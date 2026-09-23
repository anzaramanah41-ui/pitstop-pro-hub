import fs from "fs";

console.log("Applying QRIS consistency fixes...");

// ----------------------------------------------------------------------------
// 1. Fix src/services/appbenk-service.ts
// ----------------------------------------------------------------------------
let serviceContent = fs.readFileSync("src/services/appbenk-service.ts", "utf8");

// Fix getLocalAccounts QRIS sync logic
const oldGetLocalQris = `    // Sinkronkan QRIS spesifik dari appbenk_qris_active dan appbenk_qris_image_data jika ada
    try {
      const directQrisRaw = localStorage.getItem("appbenk_qris_active");
      const fallbackImage = localStorage.getItem("appbenk_qris_image_data");
      let qrisObj = directQrisRaw ? JSON.parse(directQrisRaw) : null;

      if (!qrisObj && fallbackImage) {
        qrisObj = {
          id: "acc-qris-001",
          workshop_id: wbId,
          id_bengkel: wbId,
          account_type: "qris",
          provider: "MANUAL",
          provider_account_id: "qris-manual",
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
        // Hapus semua QRIS lama agar tidak ada akun ganda yang menimpa
        const withoutQris = currentList.filter((a) => a.account_type !== "qris");
        const existingQris = currentList.find((a) => a.account_type === "qris");
        const mergedQris: WorkshopPaymentAccountRow = {
          ...(existingQris || defaults.find((d) => d.account_type === "qris")!),
          ...qrisObj,
          account_type: "qris",
          workshop_id: qrisObj.workshop_id || existingQris?.workshop_id || wbId,
          id_bengkel: qrisObj.id_bengkel || existingQris?.id_bengkel || wbId,
        };
        currentList = [...withoutQris, mergedQris];
      }
    } catch {}`;

const newGetLocalQris = `    // Sinkronkan QRIS spesifik dari appbenk_qris_active dan appbenk_qris_image_data jika ada
    try {
      const wsRaw = workshopId ? localStorage.getItem(\`appbenk_qris_active_\${workshopId}\`) : null;
      const wsImg = workshopId ? localStorage.getItem(\`appbenk_qris_image_data_\${workshopId}\`) : null;
      const directQrisRaw = wsRaw || localStorage.getItem("appbenk_qris_active");
      const fallbackImage = wsImg || localStorage.getItem("appbenk_qris_image_data");
      let qrisObj = directQrisRaw ? JSON.parse(directQrisRaw) : null;

      if (!qrisObj && fallbackImage) {
        qrisObj = {
          id: "acc-qris-001",
          workshop_id: wbId,
          id_bengkel: wbId,
          account_type: "qris",
          provider: "MANUAL",
          provider_account_id: "qris-manual",
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

        let mergedQris: WorkshopPaymentAccountRow;
        if (existingQris && existingTime > qrisObjTime && existingQris.qr_image_url) {
          mergedQris = existingQris;
        } else {
          mergedQris = {
            ...(existingQris || defaults.find((d) => d.account_type === "qris")!),
            ...qrisObj,
            account_type: "qris",
            workshop_id: targetWb,
            id_bengkel: targetWb,
          };
        }
        currentList = [...withoutQris, mergedQris];
      }
    } catch {}`;

if (serviceContent.includes(oldGetLocalQris)) {
  serviceContent = serviceContent.replace(oldGetLocalQris, newGetLocalQris);
  console.log("Updated getLocalAccounts QRIS sync");
} else {
  console.warn("Could not find oldGetLocalQris in appbenk-service.ts");
}

// Fix saveLocalAccount, toggleLocalAccountActive, deleteLocalAccount
const oldSaveLocalAcc = `export function saveLocalAccount(item: WorkshopPaymentAccountRow) {
  try {
    const list = getLocalAccounts();
    if (item.account_type === "qris") {
      // Hapus entri QRIS lama dan masukkan entri terbaru untuk integritas data
      const withoutQris = list.filter((a) => a.account_type !== "qris");
      withoutQris.push(item);
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(withoutQris));
      localStorage.setItem("appbenk_qris_active", JSON.stringify(item));
      if (item.qr_image_url) {
        localStorage.setItem("appbenk_qris_image_data", item.qr_image_url);
      }
    } else {
      const idx = list.findIndex((a) => a.id === item.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item };
      } else {
        list.push(item);
      }
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("appbenk_payment_accounts_updated", { detail: item }),
      );
    }
  } catch {}
}

function toggleLocalAccountActive(id: string, isActive: boolean) {
  try {
    const list = getLocalAccounts();
    const acc = list.find((a) => a.id === id);
    if (acc) {
      acc.is_active = isActive;
      acc.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
      if (acc.account_type === "qris") {
        localStorage.setItem("appbenk_qris_active", JSON.stringify(acc));
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("appbenk_payment_accounts_updated", { detail: acc }),
        );
      }
    }
  } catch {}
}

function deleteLocalAccount(id: string) {
  try {
    const list = getLocalAccounts().filter((a) => a.id !== id);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("appbenk_payment_accounts_updated", { detail: { id, deleted: true } }),
      );
    }
  } catch {}
}`;

const newSaveLocalAcc = `export function saveLocalAccount(item: WorkshopPaymentAccountRow) {
  try {
    const list = getLocalAccounts();
    const wbId = item.workshop_id || item.id_bengkel || "bengkel-001";
    if (item.account_type === "qris") {
      // Hapus entri QRIS lama untuk workshop ini dan masukkan entri terbaru
      const withoutQris = list.filter(
        (a) => !(a.account_type === "qris" && (a.workshop_id === wbId || a.id_bengkel === wbId))
      );
      withoutQris.push(item);
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(withoutQris));
      localStorage.setItem("appbenk_qris_active", JSON.stringify(item));
      localStorage.setItem(\`appbenk_qris_active_\${wbId}\`, JSON.stringify(item));
      if (item.id_bengkel && item.id_bengkel !== wbId) {
        localStorage.setItem(\`appbenk_qris_active_\${item.id_bengkel}\`, JSON.stringify(item));
      }
      if (item.qr_image_url) {
        localStorage.setItem("appbenk_qris_image_data", item.qr_image_url);
        localStorage.setItem(\`appbenk_qris_image_data_\${wbId}\`, item.qr_image_url);
        if (item.id_bengkel && item.id_bengkel !== wbId) {
          localStorage.setItem(\`appbenk_qris_image_data_\${item.id_bengkel}\`, item.qr_image_url);
        }
      }
    } else {
      const idx = list.findIndex((a) => a.id === item.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item };
      } else {
        list.push(item);
      }
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("appbenk_payment_accounts_updated", { detail: item }),
      );
    }
  } catch {}
}

function toggleLocalAccountActive(id: string, isActive: boolean) {
  try {
    const list = getLocalAccounts();
    const acc = list.find((a) => a.id === id);
    if (acc) {
      acc.is_active = isActive;
      acc.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
      if (acc.account_type === "qris") {
        const wbId = acc.workshop_id || acc.id_bengkel || "bengkel-001";
        localStorage.setItem("appbenk_qris_active", JSON.stringify(acc));
        localStorage.setItem(\`appbenk_qris_active_\${wbId}\`, JSON.stringify(acc));
        if (acc.id_bengkel && acc.id_bengkel !== wbId) {
          localStorage.setItem(\`appbenk_qris_active_\${acc.id_bengkel}\`, JSON.stringify(acc));
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("appbenk_payment_accounts_updated", { detail: acc }),
        );
      }
    }
  } catch {}
}

function deleteLocalAccount(id: string) {
  try {
    const list = getLocalAccounts();
    const target = list.find((a) => a.id === id);
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(filtered));
    if (target?.account_type === "qris") {
      const wbId = target.workshop_id || target.id_bengkel || "bengkel-001";
      localStorage.removeItem(\`appbenk_qris_active_\${wbId}\`);
      localStorage.removeItem(\`appbenk_qris_image_data_\${wbId}\`);
      localStorage.removeItem("appbenk_qris_active");
      localStorage.removeItem("appbenk_qris_image_data");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("appbenk_payment_accounts_updated", { detail: { id, deleted: true } }),
      );
    }
  } catch {}
}`;

if (serviceContent.includes(oldSaveLocalAcc)) {
  serviceContent = serviceContent.replace(oldSaveLocalAcc, newSaveLocalAcc);
  console.log("Updated saveLocalAccount and related functions");
} else {
  console.warn("Could not find oldSaveLocalAcc in appbenk-service.ts");
}

// Fix query ordering in workshopPaymentAccountsService.getAll
const oldOrder = `.order("created_at", { ascending: true });`;
const newOrder = `.order("updated_at", { ascending: false });`;
if (serviceContent.includes(oldOrder)) {
  serviceContent = serviceContent.replace(oldOrder, newOrder);
  console.log("Updated workshopPaymentAccountsService.getAll order to updated_at desc");
}

fs.writeFileSync("src/services/appbenk-service.ts", serviceContent, "utf8");

// ----------------------------------------------------------------------------
// 2. Fix src/lib/store.tsx
// ----------------------------------------------------------------------------
let storeContent = fs.readFileSync("src/lib/store.tsx", "utf8");

const oldSimpanPaymentStore = `    setWorkshopPaymentAccounts((prev) => {
      if (saved.account_type === "qris") {
        const withoutQris = prev.filter((a) => a.account_type !== "qris");
        return [...withoutQris, saved];
      }
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });`;

const newSimpanPaymentStore = `    setWorkshopPaymentAccounts((prev) => {
      if (saved.account_type === "qris") {
        const wbId = saved.workshop_id || saved.id_bengkel;
        const withoutQris = prev.filter(
          (a) => !(a.account_type === "qris" && (a.workshop_id === wbId || a.id_bengkel === wbId))
        );
        return [saved, ...withoutQris];
      }
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });`;

if (storeContent.includes(oldSimpanPaymentStore)) {
  storeContent = storeContent.replace(oldSimpanPaymentStore, newSimpanPaymentStore);
  console.log("Updated simpanPaymentAccount in store.tsx");
} else {
  console.warn("Could not find oldSimpanPaymentStore in store.tsx");
}

fs.writeFileSync("src/lib/store.tsx", storeContent, "utf8");

// ----------------------------------------------------------------------------
// 3. Fix src/routes/_shell.admin.pengaturan.tsx
// ----------------------------------------------------------------------------
let adminContent = fs.readFileSync("src/routes/_shell.admin.pengaturan.tsx", "utf8");

const oldAdminQrisInit = `  const qrisAccount =
    workshopAccounts.find((a) => a.account_type === "qris" && Boolean(a.qr_image_url)) ||
    workshopAccounts.find((a) => a.account_type === "qris") ||
    workshopPaymentAccounts.find((a) => a.account_type === "qris" && Boolean(a.qr_image_url)) ||
    workshopPaymentAccounts.find((a) => a.account_type === "qris");`;

const newAdminQrisInit = `  const qrisCandidates = workshopAccounts
    .filter((a) => a.account_type === "qris")
    .sort((a, b) => {
      const tb = new Date(b.updated_at || b.created_at || 0).getTime();
      const ta = new Date(a.updated_at || a.created_at || 0).getTime();
      return tb - ta;
    });
  const qrisAccount =
    qrisCandidates.find((a) => Boolean(a.qr_image_url)) ||
    qrisCandidates[0] ||
    workshopPaymentAccounts
      .filter((a) => a.account_type === "qris")
      .sort((a, b) => {
        const tb = new Date(b.updated_at || b.created_at || 0).getTime();
        const ta = new Date(a.updated_at || a.created_at || 0).getTime();
        return tb - ta;
      })[0] ||
    null;`;

if (adminContent.includes(oldAdminQrisInit)) {
  adminContent = adminContent.replace(oldAdminQrisInit, newAdminQrisInit);
  console.log("Updated qrisAccount in admin.pengaturan.tsx");
} else {
  console.warn("Could not find oldAdminQrisInit in admin.pengaturan.tsx");
}

const oldAdminEffect = `  useEffect(() => {
    let savedQrisImage = qrisAccount?.qr_image_url || "";
    let savedQrisActive = qrisAccount?.is_active ?? true;

    if (typeof window !== "undefined") {
      try {
        const wsRaw = localStorage.getItem(\`appbenk_qris_active_\${workshopId}\`);
        const wsImg = localStorage.getItem(\`appbenk_qris_image_data_\${workshopId}\`);
        const raw = wsRaw || localStorage.getItem("appbenk_qris_active");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.qr_image_url && !savedQrisImage) {
            savedQrisImage = parsed.qr_image_url;
          }
          if (parsed?.is_active !== undefined) {
            savedQrisActive = parsed.is_active;
          }
        }
        const rawImg = wsImg || localStorage.getItem("appbenk_qris_image_data");
        if (rawImg && !savedQrisImage) {
          savedQrisImage = rawImg;
        }
      } catch {}
    }

    if (savedQrisImage && !qrisFile) {
      setQrisPreview(savedQrisImage);
    }
    setQrisIsActive(savedQrisActive);
  }, [qrisAccount]);`;

const newAdminEffect = `  useEffect(() => {
    let savedQrisImage = qrisAccount?.qr_image_url || "";
    let savedQrisActive = qrisAccount?.is_active ?? true;
    let savedTimestamp = qrisAccount ? new Date(qrisAccount.updated_at || qrisAccount.created_at || 0).getTime() : 0;

    if (typeof window !== "undefined") {
      try {
        const wsRaw = localStorage.getItem(\`appbenk_qris_active_\${workshopId}\`);
        const wsImg = localStorage.getItem(\`appbenk_qris_image_data_\${workshopId}\`);
        const raw = wsRaw || localStorage.getItem("appbenk_qris_active");
        if (raw) {
          const parsed = JSON.parse(raw);
          const parsedTime = new Date(parsed.updated_at || parsed.created_at || 0).getTime();
          if (parsedTime >= savedTimestamp) {
            if (parsed.qr_image_url) {
              savedQrisImage = parsed.qr_image_url;
            }
            if (parsed.is_active !== undefined) {
              savedQrisActive = parsed.is_active;
            }
            savedTimestamp = parsedTime;
          }
        }
        const rawImg = wsImg || localStorage.getItem("appbenk_qris_image_data");
        if (rawImg && !savedQrisImage) {
          savedQrisImage = rawImg;
        }
      } catch {}
    }

    if (savedQrisImage && !qrisFile) {
      setQrisPreview(savedQrisImage);
    }
    setQrisIsActive(savedQrisActive);
  }, [qrisAccount, workshopId]);`;

if (adminContent.includes(oldAdminEffect)) {
  adminContent = adminContent.replace(oldAdminEffect, newAdminEffect);
  console.log("Updated useEffect in admin.pengaturan.tsx");
} else {
  console.warn("Could not find oldAdminEffect in admin.pengaturan.tsx");
}

fs.writeFileSync("src/routes/_shell.admin.pengaturan.tsx", adminContent, "utf8");

// ----------------------------------------------------------------------------
// 4. Fix src/routes/_shell.pelanggan.pembayaran.tsx
// ----------------------------------------------------------------------------
let pelangganContent = fs.readFileSync("src/routes/_shell.pelanggan.pembayaran.tsx", "utf8");

const oldActiveQris = `  const activeQRIS = useMemo(() => {
    // 1. Cek langsung dari localStorage appbenk_qris_active / per-workshop
    let directQris: any = null;
    let fallbackImage: string | null = null;
    if (typeof window !== "undefined") {
      try {
        if (targetWorkshopId) {
          const wsRaw = localStorage.getItem(\`appbenk_qris_active_\${targetWorkshopId}\`);
          if (wsRaw) directQris = JSON.parse(wsRaw);
          fallbackImage = localStorage.getItem(\`appbenk_qris_image_data_\${targetWorkshopId}\`);
        }
        if (!directQris) {
          const raw = localStorage.getItem("appbenk_qris_active");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (!targetWorkshopId || !parsed.workshop_id || parsed.workshop_id === targetWorkshopId || parsed.id_bengkel === targetWorkshopId) {
              directQris = parsed;
            }
          }
        }
        if (!fallbackImage) {
          fallbackImage = localStorage.getItem("appbenk_qris_image_data");
        }
      } catch {}
    }

    // 2. Cek dari workshopPaymentAccounts di store (scoped ke targetWorkshopId jika ada)
    const wsAccounts = (workshopPaymentAccounts || []).filter(
      (a) => !targetWorkshopId || a.workshop_id === targetWorkshopId || a.id_bengkel === targetWorkshopId,
    );
    const fromStore =
      wsAccounts.find((a) => a.account_type === "qris" && Boolean(a.qr_image_url)) ||
      wsAccounts.find((a) => a.account_type === "qris");

    // 3. Cek dari localStorage appbenk_workshop_payment_accounts
    let fromLocalList: any = null;
    if (typeof window !== "undefined") {
      try {
        const rawList = localStorage.getItem("appbenk_workshop_payment_accounts");
        if (rawList) {
          const parsed = JSON.parse(rawList);
          if (Array.isArray(parsed)) {
            const wsParsed = parsed.filter(
              (a: any) => !targetWorkshopId || a.workshop_id === targetWorkshopId || a.id_bengkel === targetWorkshopId,
            );
            fromLocalList =
              wsParsed.find((a: any) => a.account_type === "qris" && Boolean(a.qr_image_url)) ||
              wsParsed.find((a: any) => a.account_type === "qris");
          }
        }
      } catch {}
    }

    const candidateWithImage = [directQris, fromStore, fromLocalList].find(
      (item) => Boolean(item?.qr_image_url),
    );

    const base = candidateWithImage || directQris || fromStore || fromLocalList;
    if (!base && !fallbackImage) return null;

    const qrImageUrl =
      candidateWithImage?.qr_image_url ||
      directQris?.qr_image_url ||
      fromStore?.qr_image_url ||
      fromLocalList?.qr_image_url ||
      fallbackImage ||
      null;

    const isActive =
      candidateWithImage?.is_active !== undefined
        ? Boolean(candidateWithImage.is_active)
        : directQris?.is_active !== undefined
          ? Boolean(directQris.is_active)
          : fromStore?.is_active !== undefined
            ? Boolean(fromStore.is_active)
            : fromLocalList?.is_active !== undefined
              ? Boolean(fromLocalList.is_active)
              : true;

    return {
      ...(base || {}),
      display_name: base?.display_name || "QRIS Standar Nasional AppBenk",
      qr_image_url: qrImageUrl,
      is_active: isActive,
    };
  }, [workshopPaymentAccounts, targetWorkshopId]);`;

const newActiveQris = `  const activeQRIS = useMemo(() => {
    // Kumpulkan seluruh kandidat akun QRIS dari semua layer data
    const candidates: (WorkshopPaymentAccountRow & { _source?: string })[] = [];

    // 1. Cek dari workshopPaymentAccounts di store (scoped ke targetWorkshopId jika ada)
    const storeAccounts = (workshopPaymentAccounts || []).filter(
      (a) =>
        a.account_type === "qris" &&
        (!targetWorkshopId || a.workshop_id === targetWorkshopId || a.id_bengkel === targetWorkshopId),
    );
    candidates.push(...storeAccounts.map((a) => ({ ...a, _source: "store" })));

    // 2. Cek dari localStorage appbenk_workshop_payment_accounts
    if (typeof window !== "undefined") {
      try {
        const rawList = localStorage.getItem("appbenk_workshop_payment_accounts");
        if (rawList) {
          const parsed = JSON.parse(rawList);
          if (Array.isArray(parsed)) {
            const localQris = parsed.filter(
              (a: any) =>
                a.account_type === "qris" &&
                (!targetWorkshopId || a.workshop_id === targetWorkshopId || a.id_bengkel === targetWorkshopId),
            );
            candidates.push(...localQris.map((c: any) => ({ ...c, _source: "localList" })));
          }
        }
      } catch {}
    }

    // 3. Cek direct workshop-scoped keys di localStorage
    let fallbackImage: string | null = null;
    if (typeof window !== "undefined") {
      try {
        if (targetWorkshopId) {
          const wsRaw = localStorage.getItem(\`appbenk_qris_active_\${targetWorkshopId}\`);
          if (wsRaw) {
            const parsed = JSON.parse(wsRaw);
            candidates.push({ ...parsed, _source: "directWorkshop" });
          }
          fallbackImage = localStorage.getItem(\`appbenk_qris_image_data_\${targetWorkshopId}\`);
        }
        const globalRaw = localStorage.getItem("appbenk_qris_active");
        if (globalRaw) {
          const parsed = JSON.parse(globalRaw);
          if (
            !targetWorkshopId ||
            !parsed.workshop_id ||
            parsed.workshop_id === targetWorkshopId ||
            parsed.id_bengkel === targetWorkshopId
          ) {
            candidates.push({ ...parsed, _source: "directGlobal" });
          }
        }
        if (!fallbackImage) {
          fallbackImage = localStorage.getItem("appbenk_qris_image_data");
        }
      } catch {}
    }

    const getTime = (item: any) => {
      if (!item) return 0;
      const t = item.updated_at || item.created_at;
      if (!t) return 0;
      const parsed = new Date(t).getTime();
      return isNaN(parsed) ? 0 : parsed;
    };

    // Urutkan kandidat berdasarkan updated_at DESC (paling baru di paling depan)
    candidates.sort((a, b) => getTime(b) - getTime(a));

    // Prioritaskan kandidat paling baru yang memiliki qr_image_url valid
    const bestWithImage = candidates.find((c) => Boolean(c.qr_image_url && c.qr_image_url.trim().length > 0));
    const best = bestWithImage || candidates[0];

    if (!best && !fallbackImage) return null;

    let finalImageUrl = best?.qr_image_url?.trim() || fallbackImage || null;

    // Cache-busting untuk gambar remote HTTP/HTTPS agar browser tidak menampilkan gambar cache lama
    if (finalImageUrl && (finalImageUrl.startsWith("http://") || finalImageUrl.startsWith("https://"))) {
      const cacheBustTime = getTime(best) || Date.now();
      if (!finalImageUrl.includes("t=")) {
        const sep = finalImageUrl.includes("?") ? "&" : "?";
        finalImageUrl = \`\${finalImageUrl}\${sep}t=\${cacheBustTime}\`;
      }
    }

    const isActive = best?.is_active !== undefined ? Boolean(best.is_active) : true;

    return {
      ...(best || {}),
      display_name: best?.display_name || "QRIS Standar Nasional AppBenk",
      qr_image_url: finalImageUrl,
      is_active: isActive,
    };
  }, [workshopPaymentAccounts, targetWorkshopId]);`;

if (pelangganContent.includes(oldActiveQris)) {
  pelangganContent = pelangganContent.replace(oldActiveQris, newActiveQris);
  console.log("Updated activeQRIS in pelanggan.pembayaran.tsx");
} else {
  console.warn("Could not find oldActiveQris in pelanggan.pembayaran.tsx");
}

// Add real-time event listener in pelanggan.pembayaran.tsx to refresh immediately when admin saves
const oldPelangganEffect = `  useEffect(() => {
    refreshPaymentAccounts(targetWorkshopId);
  }, [targetWorkshopId, refreshPaymentAccounts]);`;

const newPelangganEffect = `  useEffect(() => {
    refreshPaymentAccounts(targetWorkshopId);
    const handleUpdated = () => {
      refreshPaymentAccounts(targetWorkshopId);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("appbenk_payment_accounts_updated", handleUpdated);
      window.addEventListener("storage", handleUpdated);
      return () => {
        window.removeEventListener("appbenk_payment_accounts_updated", handleUpdated);
        window.removeEventListener("storage", handleUpdated);
      };
    }
  }, [targetWorkshopId, refreshPaymentAccounts]);`;

if (pelangganContent.includes(oldPelangganEffect)) {
  pelangganContent = pelangganContent.replace(oldPelangganEffect, newPelangganEffect);
  console.log("Updated useEffect event listener in pelanggan.pembayaran.tsx");
} else {
  console.warn("Could not find oldPelangganEffect in pelanggan.pembayaran.tsx");
}

fs.writeFileSync("src/routes/_shell.pelanggan.pembayaran.tsx", pelangganContent, "utf8");

console.log("All QRIS persistence fixes applied successfully!");

