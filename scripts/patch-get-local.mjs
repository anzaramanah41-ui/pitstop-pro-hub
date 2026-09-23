import fs from "fs";

let c = fs.readFileSync("src/services/appbenk-service.ts", "utf8");
const start = c.indexOf("    // Sinkronkan QRIS");
const end = c.indexOf("  if (workshopId) {", start);

if (start === -1 || end === -1) {
  console.error("Could not find delimiters in appbenk-service.ts");
  process.exit(1);
}

const replacement = `    // Sinkronkan QRIS spesifik dari appbenk_qris_active dan appbenk_qris_image_data jika ada
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
    } catch {}
  }

`;

c = c.slice(0, start) + replacement + c.slice(end);
fs.writeFileSync("src/services/appbenk-service.ts", c, "utf8");
console.log("Successfully replaced getLocalAccounts QRIS sync block!");

