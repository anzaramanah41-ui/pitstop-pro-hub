import assert from "node:assert/strict";

console.log("======================================================================");
console.log("     APPBENK — QRIS ADMIN & PELANGGAN CONSISTENCY TEST SUITE          ");
console.log("======================================================================\n");

// Mock LocalStorage
const store = new Map();
const localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

// Mirroring the saveLocalAccount logic from appbenk-service.ts
const LOCAL_ACCOUNTS_KEY = "appbenk_workshop_payment_accounts";

function getLocalAccounts(workshopId) {
  const wbId = workshopId || "bengkel-001";
  const defaults = [
    {
      id: "acc-bank-001",
      workshop_id: "bengkel-001",
      id_bengkel: "bengkel-001",
      account_type: "bank_transfer",
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    {
      id: "acc-qris-001",
      workshop_id: "bengkel-001",
      id_bengkel: "bengkel-001",
      account_type: "qris",
      qr_image_url: null,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
  ];
  let currentList = defaults;
  const existing = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed) && parsed.length > 0) currentList = parsed;
    } catch {}
  }

  const wsRaw = workshopId ? localStorage.getItem(`appbenk_qris_active_${workshopId}`) : null;
  const wsImg = workshopId ? localStorage.getItem(`appbenk_qris_image_data_${workshopId}`) : null;
  const directQrisRaw = wsRaw || localStorage.getItem("appbenk_qris_active");
  const fallbackImage = wsImg || localStorage.getItem("appbenk_qris_image_data");
  let qrisObj = directQrisRaw ? JSON.parse(directQrisRaw) : null;

  if (!qrisObj && fallbackImage) {
    qrisObj = {
      id: "acc-qris-001",
      workshop_id: wbId,
      id_bengkel: wbId,
      account_type: "qris",
      qr_image_url: fallbackImage,
      display_name: "QRIS Bengkel",
      is_active: true,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } else if (qrisObj && fallbackImage && !qrisObj.qr_image_url) {
    qrisObj.qr_image_url = fallbackImage;
  }

  if (qrisObj) {
    const targetWb = qrisObj.workshop_id || qrisObj.id_bengkel || wbId;
    const withoutQris = currentList.filter(
      (a) => !(a.account_type === "qris" && (a.workshop_id === targetWb || a.id_bengkel === targetWb))
    );
    const existingQris = currentList.find(
      (a) => a.account_type === "qris" && (a.workshop_id === targetWb || a.id_bengkel === targetWb)
    );

    const existingTime = existingQris ? new Date(existingQris.updated_at || existingQris.created_at || 0).getTime() : 0;
    const qrisObjTime = new Date(qrisObj.updated_at || qrisObj.created_at || 0).getTime();

    let mergedQris;
    if (existingQris && existingTime > qrisObjTime && existingQris.qr_image_url) {
      mergedQris = existingQris;
    } else {
      mergedQris = {
        ...(existingQris || defaults.find((d) => d.account_type === "qris")),
        ...qrisObj,
        account_type: "qris",
        workshop_id: targetWb,
        id_bengkel: targetWb,
      };
    }
    currentList = [...withoutQris, mergedQris];
  }

  if (workshopId) {
    const filtered = currentList.filter(
      (a) => a.workshop_id === workshopId || a.id_bengkel === workshopId
    );
    if (filtered.length > 0) return filtered;
  }
  return currentList;
}

function saveLocalAccount(item) {
  const list = getLocalAccounts();
  const wbId = item.workshop_id || item.id_bengkel || "bengkel-001";
  if (item.account_type === "qris") {
    const withoutQris = list.filter(
      (a) => !(a.account_type === "qris" && (a.workshop_id === wbId || a.id_bengkel === wbId))
    );
    withoutQris.push(item);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(withoutQris));
    localStorage.setItem("appbenk_qris_active", JSON.stringify(item));
    localStorage.setItem(`appbenk_qris_active_${wbId}`, JSON.stringify(item));
    if (item.id_bengkel && item.id_bengkel !== wbId) {
      localStorage.setItem(`appbenk_qris_active_${item.id_bengkel}`, JSON.stringify(item));
    }
    if (item.qr_image_url) {
      localStorage.setItem("appbenk_qris_image_data", item.qr_image_url);
      localStorage.setItem(`appbenk_qris_image_data_${wbId}`, item.qr_image_url);
      if (item.id_bengkel && item.id_bengkel !== wbId) {
        localStorage.setItem(`appbenk_qris_image_data_${item.id_bengkel}`, item.qr_image_url);
      }
    }
  }
}

// Mirroring the activeQRIS resolution logic from _shell.pelanggan.pembayaran.tsx
function resolvePelangganQRIS(workshopPaymentAccounts, targetWorkshopId) {
  const candidates = [];

  // Source A: store
  const storeAccounts = (workshopPaymentAccounts || []).filter(
    (a) =>
      a.account_type === "qris" &&
      (!targetWorkshopId || a.workshop_id === targetWorkshopId || a.id_bengkel === targetWorkshopId)
  );
  candidates.push(...storeAccounts.map((a) => ({ ...a, _source: "store" })));

  // Source B: localList
  const rawList = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
  if (rawList) {
    try {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) {
        const localQris = parsed.filter(
          (a) =>
            a.account_type === "qris" &&
            (!targetWorkshopId || a.workshop_id === targetWorkshopId || a.id_bengkel === targetWorkshopId)
        );
        candidates.push(...localQris.map((c) => ({ ...c, _source: "localList" })));
      }
    } catch {}
  }

  // Source C: direct workshop-scoped keys
  let fallbackImage = null;
  if (targetWorkshopId) {
    const wsRaw = localStorage.getItem(`appbenk_qris_active_${targetWorkshopId}`);
    if (wsRaw) {
      try {
        candidates.push({ ...JSON.parse(wsRaw), _source: "directWorkshop" });
      } catch {}
    }
    fallbackImage = localStorage.getItem(`appbenk_qris_image_data_${targetWorkshopId}`);
  }
  const globalRaw = localStorage.getItem("appbenk_qris_active");
  if (globalRaw) {
    try {
      const parsed = JSON.parse(globalRaw);
      if (
        !targetWorkshopId ||
        !parsed.workshop_id ||
        parsed.workshop_id === targetWorkshopId ||
        parsed.id_bengkel === targetWorkshopId
      ) {
        candidates.push({ ...parsed, _source: "directGlobal" });
      }
    } catch {}
  }
  if (!fallbackImage) {
    fallbackImage = localStorage.getItem("appbenk_qris_image_data");
  }

  const getTime = (item) => {
    if (!item) return 0;
    const t = item.updated_at || item.created_at;
    if (!t) return 0;
    const parsed = new Date(t).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  candidates.sort((a, b) => getTime(b) - getTime(a));
  const bestWithImage = candidates.find((c) => Boolean(c.qr_image_url && c.qr_image_url.trim().length > 0));
  const best = bestWithImage || candidates[0];

  if (!best && !fallbackImage) return null;

  let finalImageUrl = best?.qr_image_url?.trim() || fallbackImage || null;

  if (finalImageUrl && (finalImageUrl.startsWith("http://") || finalImageUrl.startsWith("https://"))) {
    const cacheBustTime = getTime(best) || Date.now();
    if (!finalImageUrl.includes("t=")) {
      const sep = finalImageUrl.includes("?") ? "&" : "?";
      finalImageUrl = `${finalImageUrl}${sep}t=${cacheBustTime}`;
    }
  }

  const isActive = best?.is_active !== undefined ? Boolean(best.is_active) : true;

  return {
    ...(best || {}),
    display_name: best?.display_name || "QRIS Standar Nasional AppBenk",
    qr_image_url: finalImageUrl,
    is_active: isActive,
  };
}

// ---------------------------------------------------------------------------
// TEST 1: Initial upload of QRIS Image 1 by Admin
// ---------------------------------------------------------------------------
console.log("[TEST 1] Admin mengunggah dan menyimpan QRIS pertama (Image A)...");
const workshopId = "bengkel-001";
const imageA = "data:image/jpeg;base64,IMAGE_A_RAW_BYTES_11111";

const qrisA = {
  id: "qris-001",
  workshop_id: workshopId,
  id_bengkel: workshopId,
  account_type: "qris",
  qr_image_url: imageA,
  display_name: "QRIS Bengkel Utama",
  is_active: true,
  status: "active",
  created_at: new Date(Date.now() - 100000).toISOString(),
  updated_at: new Date(Date.now() - 100000).toISOString(),
};

saveLocalAccount(qrisA);
let storeAccounts = [qrisA];

let pelangganQRIS = resolvePelangganQRIS(storeAccounts, workshopId);
assert.equal(pelangganQRIS.qr_image_url, imageA, "Pelanggan harus menerima Image A");
assert.equal(pelangganQRIS.is_active, true, "Status QRIS aktif");
console.log("  ✓ TEST 1 BERHASIL: Pelanggan menampilkan QRIS Image A dengan benar.\n");

// ---------------------------------------------------------------------------
// TEST 2: Admin replaces QRIS with Image B
// (Simulates stale localStorage keys vs fresh store / new upload)
// ---------------------------------------------------------------------------
console.log("[TEST 2] Admin mengganti gambar QRIS baru (Image B)...");
const imageB = "https://supabase.co/storage/v1/object/public/payment-assets/bengkel-001/qris/new-qris-22222.png";

const now = new Date().toISOString();
const qrisB = {
  id: "qris-001",
  workshop_id: workshopId,
  id_bengkel: workshopId,
  account_type: "qris",
  qr_image_url: imageB,
  display_name: "QRIS Bengkel Utama Terkini",
  is_active: true,
  status: "active",
  created_at: qrisA.created_at,
  updated_at: now,
};

saveLocalAccount(qrisB);
storeAccounts = [qrisB];

pelangganQRIS = resolvePelangganQRIS(storeAccounts, workshopId);
assert.ok(
  pelangganQRIS.qr_image_url.startsWith(imageB),
  "Pelanggan harus menampilkan Image B terbaru, BUKAN Image A lama!"
);
assert.ok(
  pelangganQRIS.qr_image_url.includes("t="),
  "URL remote harus memiliki cache buster parameter t="
);
console.log("  ✓ TEST 2 BERHASIL: Pelanggan langsung menampilkan QRIS Image B terbaru tanpa ter-override oleh cache!\n");

// ---------------------------------------------------------------------------
// TEST 3: Admin menonaktifkan status aktif QRIS
// ---------------------------------------------------------------------------
console.log("[TEST 3] Admin menonaktifkan status aktif QRIS...");
const qrisB_disabled = {
  ...qrisB,
  is_active: false,
  updated_at: new Date().toISOString(),
};
saveLocalAccount(qrisB_disabled);
storeAccounts = [qrisB_disabled];

pelangganQRIS = resolvePelangganQRIS(storeAccounts, workshopId);
assert.equal(pelangganQRIS.is_active, false, "Status is_active harus bernilai false");
assert.ok(
  pelangganQRIS.qr_image_url.startsWith(imageB),
  "Gambar QRIS di storage/database TIDAK boleh terhapus saat status dinonaktifkan"
);
console.log("  ✓ TEST 3 BERHASIL: QRIS dinonaktifkan tanpa menghapus file gambar di storage/database.\n");

// ---------------------------------------------------------------------------
// TEST 4: Multi-tenant Workshop Isolation
// ---------------------------------------------------------------------------
console.log("[TEST 4] Uji Isolasi Multi-Tenant (Workshop A vs Workshop B)...");
const workshopBId = "bengkel-002";
const imageBengkelB = "data:image/jpeg;base64,IMAGE_BENGKEL_002_CUSTOM";

const qrisBengkelB = {
  id: "qris-002",
  workshop_id: workshopBId,
  id_bengkel: workshopBId,
  account_type: "qris",
  qr_image_url: imageBengkelB,
  display_name: "QRIS Bengkel Cabang B",
  is_active: true,
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

saveLocalAccount(qrisBengkelB);

const qrisForBengkelA = resolvePelangganQRIS([...storeAccounts, qrisBengkelB], workshopId);
const qrisForBengkelB = resolvePelangganQRIS([...storeAccounts, qrisBengkelB], workshopBId);

assert.ok(qrisForBengkelA.qr_image_url.startsWith(imageB), "Workshop A harus tetap memakai QRIS Image B miliknya");
assert.equal(qrisForBengkelB.qr_image_url, imageBengkelB, "Workshop B harus memakai QRIS Image miliknya sendiri");
console.log("  ✓ TEST 4 BERHASIL: Multi-tenant isolation terverifikasi sempurna (Workshop A != Workshop B).\n");

// ---------------------------------------------------------------------------
// TEST 5: QRIS aktif tetapi belum di-upload (no dummy QR)
// ---------------------------------------------------------------------------
console.log("[TEST 5] QRIS aktif tapi belum ada gambar (harus fallback null, tanpa hardcoded dummy)...");
localStorage.clear();
const qrisNoImg = {
  id: "qris-empty",
  workshop_id: "bengkel-new",
  account_type: "qris",
  qr_image_url: null,
  is_active: true,
  updated_at: new Date().toISOString(),
};
saveLocalAccount(qrisNoImg);
const emptyQRIS = resolvePelangganQRIS([qrisNoImg], "bengkel-new");
assert.equal(emptyQRIS.qr_image_url, null, "qr_image_url harus null (tidak boleh menghasilkan QR dummy)");
console.log("  ✓ TEST 5 BERHASIL: Tanpa gambar QRIS, sistem tidak membangkitkan dummy QR dan mengarahkan ke fallback peringatan.\n");

console.log("======================================================================");
console.log("    SELURUH TEST KONSISTENSI & PERSISTENSI QRIS 100% SUKSES!         ");
console.log("======================================================================\n");

