-- 016_create_triggers.sql

-- Auto update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pelanggan_updated_at on public.pelanggan;
create trigger trg_pelanggan_updated_at before update on public.pelanggan for each row execute procedure public.set_updated_at();

drop trigger if exists trg_kendaraan_updated_at on public.kendaraan;
create trigger trg_kendaraan_updated_at before update on public.kendaraan for each row execute procedure public.set_updated_at();

drop trigger if exists trg_booking_updated_at on public.booking_servis;
create trigger trg_booking_updated_at before update on public.booking_servis for each row execute procedure public.set_updated_at();

drop trigger if exists trg_servis_updated_at on public.servis;
create trigger trg_servis_updated_at before update on public.servis for each row execute procedure public.set_updated_at();

drop trigger if exists trg_pembayaran_updated_at on public.pembayaran;
create trigger trg_pembayaran_updated_at before update on public.pembayaran for each row execute procedure public.set_updated_at();

drop trigger if exists trg_sparepart_updated_at on public.sparepart;
create trigger trg_sparepart_updated_at before update on public.sparepart for each row execute procedure public.set_updated_at();

drop trigger if exists trg_admin_updated_at on public.admin;
create trigger trg_admin_updated_at before update on public.admin for each row execute procedure public.set_updated_at();

drop trigger if exists trg_owner_updated_at on public.owner;
create trigger trg_owner_updated_at before update on public.owner for each row execute procedure public.set_updated_at();

-- Trigger: kurangi stok saat penggunaan sparepart & catat riwayat_stok keluar
create or replace function public.trigger_kurangi_stok_penggunaan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_stok_saat_ini integer;
  v_min integer;
  v_status text;
  v_nomor_servis text;
begin
  select stok_tersedia, stok_minimum
  into v_stok_saat_ini, v_min
  from public.sparepart
  where id_sparepart = new.id_sparepart
  for update;

  if not found then
    raise exception 'Sparepart dengan ID % tidak ditemukan.', new.id_sparepart;
  end if;

  if v_stok_saat_ini < new.jumlah then
    raise exception 'Stok tidak mencukupi untuk sparepart %. Tersedia: %, diminta: %',
      new.id_sparepart, v_stok_saat_ini, new.jumlah;
  end if;

  v_stok_saat_ini := v_stok_saat_ini - new.jumlah;

  if v_stok_saat_ini = 0 then
    v_status := 'habis';
  elsif v_stok_saat_ini <= v_min then
    v_status := 'menipis';
  else
    v_status := 'tersedia';
  end if;

  update public.sparepart
  set stok_tersedia = v_stok_saat_ini,
      status_stok = v_status,
      tanggal_update = now(),
      updated_at = now()
  where id_sparepart = new.id_sparepart;

  select nomor_servis into v_nomor_servis from public.servis where id_servis = new.id_servis;

  insert into public.riwayat_stok (
    id_sparepart,
    jenis,
    jumlah,
    tanggal,
    keterangan
  ) values (
    new.id_sparepart,
    'keluar',
    new.jumlah,
    now(),
    coalesce(new.keterangan, 'Digunakan untuk servis ' || coalesce(v_nomor_servis, ''))
  );

  return new;
end;
$$;

drop trigger if exists trg_on_penggunaan_sparepart_created on public.penggunaan_sparepart;
create trigger trg_on_penggunaan_sparepart_created
after insert on public.penggunaan_sparepart
for each row execute procedure public.trigger_kurangi_stok_penggunaan();

-- Trigger: tambah stok saat pembelian sparepart & catat riwayat_stok masuk
create or replace function public.trigger_tambah_stok_pembelian()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_stok_saat_ini integer;
  v_min integer;
  v_status text;
begin
  if new.status = 'diterima' then
    select stok_tersedia, stok_minimum
    into v_stok_saat_ini, v_min
    from public.sparepart
    where id_sparepart = new.id_sparepart
    for update;

    if not found then
      raise exception 'Sparepart dengan ID % tidak ditemukan.', new.id_sparepart;
    end if;

    v_stok_saat_ini := v_stok_saat_ini + new.jumlah;

    if v_stok_saat_ini = 0 then
      v_status := 'habis';
    elsif v_stok_saat_ini <= v_min then
      v_status := 'menipis';
    else
      v_status := 'tersedia';
    end if;

    update public.sparepart
    set stok_tersedia = v_stok_saat_ini,
        status_stok = v_status,
        tanggal_update = now(),
        updated_at = now()
    where id_sparepart = new.id_sparepart;

    insert into public.riwayat_stok (
      id_sparepart,
      jenis,
      jumlah,
      tanggal,
      keterangan
    ) values (
      new.id_sparepart,
      'masuk',
      new.jumlah,
      now(),
      'Pembelian ' || new.nomor_pembelian || ' · Supplier: ' || new.supplier
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_pembelian_sparepart_created on public.pembelian_sparepart;
create trigger trg_on_pembelian_sparepart_created
after insert on public.pembelian_sparepart
for each row execute procedure public.trigger_tambah_stok_pembelian();

-- Trigger: retur sparepart
create or replace function public.trigger_retur_sparepart()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_stok_saat_ini integer;
  v_min integer;
  v_status text;
begin
  if new.status = 'disetujui' and (old is null or old.status <> 'disetujui') then
    select stok_tersedia, stok_minimum
    into v_stok_saat_ini, v_min
    from public.sparepart
    where id_sparepart = new.id_sparepart
    for update;

    if v_stok_saat_ini < new.jumlah then
      raise exception 'Stok tidak mencukupi untuk retur sparepart %', new.id_sparepart;
    end if;

    v_stok_saat_ini := v_stok_saat_ini - new.jumlah;
    v_status := case when v_stok_saat_ini = 0 then 'habis' when v_stok_saat_ini <= v_min then 'menipis' else 'tersedia' end;

    update public.sparepart
    set stok_tersedia = v_stok_saat_ini,
        status_stok = v_status,
        tanggal_update = now(),
        updated_at = now()
    where id_sparepart = new.id_sparepart;

    insert into public.riwayat_stok (
      id_sparepart,
      jenis,
      jumlah,
      tanggal,
      keterangan
    ) values (
      new.id_sparepart,
      'keluar',
      new.jumlah,
      now(),
      'Retur sparepart: ' || new.alasan
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_retur_sparepart_approved on public.retur_sparepart;
create trigger trg_on_retur_sparepart_approved
after insert or update on public.retur_sparepart
for each row execute procedure public.trigger_retur_sparepart();

-- Trigger: hitung ulang total servis dari detail_servis
create or replace function public.recalculate_servis_biaya()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_servis_id uuid;
  v_total_part numeric(14,2);
  v_biaya_jasa numeric(14,2);
begin
  v_servis_id := coalesce(new.id_servis, old.id_servis);

  select coalesce(sum(jumlah * harga), 0)
  into v_total_part
  from public.detail_servis
  where id_servis = v_servis_id;

  select biaya_jasa into v_biaya_jasa
  from public.servis
  where id_servis = v_servis_id;

  update public.servis
  set biaya_sparepart = v_total_part,
      total_biaya = coalesce(v_biaya_jasa, 0) + v_total_part,
      updated_at = now()
  where id_servis = v_servis_id;

  return null;
end;
$$;

drop trigger if exists trg_detail_servis_recalculate on public.detail_servis;
create trigger trg_detail_servis_recalculate
after insert or update or delete on public.detail_servis
for each row execute procedure public.recalculate_servis_biaya();

