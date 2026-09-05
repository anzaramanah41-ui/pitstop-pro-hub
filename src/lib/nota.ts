import { rupiah, tanggalPanjang, type Pelanggan, type Servis } from "@/lib/store";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Baris info; hanya ditampilkan bila datanya tersedia. */
const info = (label: string, nilai?: string) =>
  nilai && nilai.trim() ? `<div class="row"><span class="k">${esc(label)}</span><span class="v">${esc(nilai)}</span></div>` : "";

/** Susun nota pembayaran sebagai HTML (mock, tanpa backend). */
export function notaHtml(s: Servis, p?: Pelanggan) {
  const parts = s.items
    .map(
      (i) => `<tr><td>${esc(i.nama)}</td>
        <td class="c">${i.jumlah}</td><td class="r">${rupiah(i.harga)}</td><td class="r">${rupiah(i.harga * i.jumlah)}</td></tr>`,
    )
    .join("");

  const lunas = s.status === "Selesai Dibayar";

  return `<!doctype html><html lang="id"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Nota ${esc(s.noTransaksi)} — ${esc(s.pelanggan)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;margin:0;background:#f8fafc;}
  .sheet{max-width:760px;margin:24px auto;background:#fff;padding:36px 40px;border-radius:12px;}
  h1{font-size:24px;letter-spacing:.06em;margin:0;text-transform:uppercase;}
  .lead{color:#475569;font-size:13px;margin:4px 0 0;}
  .head{border-bottom:3px solid #0f172a;padding-bottom:14px;margin-bottom:20px;}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#1e3a8a;margin:22px 0 8px;}
  .row{display:flex;gap:12px;font-size:13px;padding:4px 0;border-bottom:1px dashed #e2e8f0;}
  .k{color:#64748b;min-width:170px;}
  .v{font-weight:600;}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:0 28px;}
  table{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px;}
  th,td{border-bottom:1px solid #e2e8f0;padding:8px 6px;text-align:left;vertical-align:top;}
  th{background:#f1f5f9;font-size:11px;text-transform:uppercase;letter-spacing:.06em;}
  .r{text-align:right;} .c{text-align:center;} .sub{color:#64748b;font-size:11px;}
  .subtotal{display:flex;justify-content:space-between;font-size:13px;font-weight:600;padding:8px 6px;background:#f8fafc;}
  .total{margin-top:22px;font-size:20px;font-weight:800;display:flex;justify-content:space-between;border-top:3px solid #0f172a;padding-top:12px;}
  .badge{display:inline-block;margin-top:14px;padding:7px 18px;border-radius:999px;font-weight:800;letter-spacing:.1em;
    background:${lunas ? "#dcfce7" : "#fee2e2"};color:${lunas ? "#166534" : "#991b1b"};}
  .foot{margin-top:28px;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;padding-top:14px;}
  @media print{body{background:#fff}.sheet{margin:0;padding:0;border-radius:0}}
</style></head><body>
<div class="sheet">
  <div class="head">
    <h1>${esc(p?.nama ?? s.pelanggan)}</h1>
    <p class="lead">Nota Servis Kendaraan · ${esc(s.noTransaksi)}</p>
  </div>

  <div class="cols">
    <div>
      <h2>Informasi Pelanggan</h2>
      ${info("Nama Pelanggan", p?.nama ?? s.pelanggan)}
      ${info("No. Telepon", p?.telepon)}
      ${info("Alamat", p?.alamat)}

      <h2>Informasi Kendaraan</h2>
      ${info("Jenis Kendaraan", s.kendaraan)}
      ${info("Nomor Polisi", s.plat)}
    </div>
    <div>
      <h2>Informasi Servis</h2>
      ${info("Nomor Servis", s.nomor)}
      ${info("Tanggal Servis", tanggalPanjang(s.tanggal))}
      ${info("Mekanik", s.mekanik)}
      ${info("Jenis Servis", s.jenis)}
      ${info("Keluhan", s.keluhan)}
      ${info("Pekerjaan Servis", s.pekerjaan)}
    </div>
  </div>

  <h2>Detail Biaya Jasa</h2>
  <table>
    <thead><tr><th>Jasa</th><th class="r">Harga</th></tr></thead>
    <tbody>
      <tr><td>${esc(s.jenis)}<div class="sub">${esc(s.pekerjaan || "Pengerjaan servis")}</div></td>
        <td class="r">${rupiah(s.biayaJasa)}</td></tr>
    </tbody>
  </table>
  <div class="subtotal"><span>Total Jasa</span><span>${rupiah(s.biayaJasa)}</span></div>

  <h2>Detail Sparepart</h2>
  ${
    s.items.length
      ? `<table>
    <thead><tr><th>Sparepart</th><th class="c">Qty</th><th class="r">Harga</th><th class="r">Subtotal</th></tr></thead>
    <tbody>${parts}</tbody>
  </table>
  <div class="subtotal"><span>Total Sparepart</span><span>${rupiah(s.biayaPart)}</span></div>`
      : `<p class="lead">Tidak ada sparepart digunakan pada servis ini.</p>`
  }

  <div class="total"><span>TOTAL PEMBAYARAN</span><span>${rupiah(s.total)}</span></div>

  <h2>Informasi Pembayaran</h2>
  ${info("Nomor Transaksi", s.noTransaksi)}
  ${info("Metode Pembayaran", s.metodeBayar)}
  ${info("Status", lunas ? "LUNAS" : "BELUM DIBAYAR")}
  ${lunas ? info("Tanggal Pembayaran", tanggalPanjang(s.tanggal)) : ""}

  <div class="badge">${lunas ? "LUNAS" : "BELUM DIBAYAR"}</div>

  <p class="foot">Terima kasih telah mempercayakan kendaraan Anda kepada bengkel kami.</p>
</div>
</body></html>`;
}

export function unduhNota(s: Servis, p?: Pelanggan) {
  const blob = new Blob([notaHtml(s, p)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Nota-${s.noTransaksi}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
