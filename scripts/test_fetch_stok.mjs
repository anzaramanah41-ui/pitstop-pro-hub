async function test() {
  try {
    const res = await fetch('http://localhost:8081/admin/stok');
    console.log("STATUS:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("Contains RET-2026-001?", html.includes('RET-2026-001'));
    console.log("Contains RET-2026-242?", html.includes('RET-2026-242'));
    console.log("Contains 'Belum ada data retur'?", html.includes('Belum ada data retur'));
    console.log("Contains 'Riwayat Retur Pembelian'?", html.includes('Riwayat Retur Pembelian'));
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}

test();

