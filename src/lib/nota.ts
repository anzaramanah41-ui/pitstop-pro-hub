import { rupiah, tanggalPanjang, type Servis } from "@/lib/store";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Susun nota pembayaran sebagai HTML sederhana (mock, tanpa backend). */
export function notaHtml(s: Servis) {
  const baris = s.items
    .map(
      (i) => `<tr><td>${esc(i.nama)}<div class="sub">${esc(i.kode)}</div></td>
        <td class="c">${i.jumlah}</td><td class="r">${rupiah(i.harga)}</td><td class="r">${rupiah(i.harga * i.jumlah)}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html lang="id"><head><meta charset="utf-8" />
<title>Nota ${esc(s.noTransaksi)} — AppBenk</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;margin:32px;}
  h1{font-size:18px;letter-spacing:.08em;margin:0;}
  .muted{color:#64748b;font-size:12px;}
  table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px;}
  th,td{border-bottom:1px solid #e2e8f0;padding:8px 6px;text-align:left;vertical-align:top;}
  th{background:#f1f5f9;font-size:11px;text-transform:uppercase;letter-spacing:.06em;}
  .r{text-align:right;} .c{text-align:center;} .sub{color:#64748b;font-size:11px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:13px;margin-top:16px;}
  .total{margin-top:16px;font-size:18px;font-weight:700;display:flex;justify-content:space-between;border-top:2px solid #0f172a;padding-top:10px;}
  .badge{display:inline-block;margin-top:14px;padding:6px 14px;border-radius:999px;background:#dcfce7;color:#166534;font-weight:700;letter-spacing:.08em;}
</style></head><body>
<h1>APPBENK — SOLUSI SERVIS KENDARAAN</h1>
<p class="muted">Nota Pembayaran Servis Kendaraan</p>
<div class="grid">
  <div><b>No. Transaksi:</b> ${esc(s.noTransaksi)}</div>
  <div><b>No. Servis:</b> ${esc(s.nomor)}</div>
  <div><b>Tanggal:</b> ${tanggalPanjang(s.tanggal)}</div>
  <div><b>Pelanggan:</b> ${esc(s.pelanggan)}</div>
  <div><b>Kendaraan:</b> ${esc(s.kendaraan)} (${esc(s.plat)})</div>
  <div><b>Metode:</b> ${esc(s.metodeBayar ?? "-")}</div>
</div>
<table>
  <thead><tr><th>Deskripsi</th><th class="c">Jumlah</th><th class="r">Harga</th><th class="r">Subtotal</th></tr></thead>
  <tbody>
    <tr><td>Jasa Servis — ${esc(s.jenis)}<div class="sub">${esc(s.pekerjaan || "-")}</div></td>
      <td class="c">1</td><td class="r">${rupiah(s.biayaJasa)}</td><td class="r">${rupiah(s.biayaJasa)}</td></tr>
    ${baris}
  </tbody>
</table>
<div class="total"><span>Total Pembayaran</span><span>${rupiah(s.total)}</span></div>
<div class="badge">${s.status === "Selesai Dibayar" ? "LUNAS" : "BELUM DIBAYAR"}</div>
<p class="muted" style="margin-top:24px">Terima kasih telah mempercayakan kendaraan Anda kepada AppBenk.</p>
</body></html>`;
}

export function unduhNota(s: Servis) {
  const blob = new Blob([notaHtml(s)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Nota-${s.noTransaksi}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
