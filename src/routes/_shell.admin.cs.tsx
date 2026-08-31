import { createFileRoute } from "@tanstack/react-router";
import { CustomerServicePage } from "@/components/customer-service";

export const Route = createFileRoute("/_shell/admin/cs")({
  head: () => ({
    meta: [
      { title: "Customer Service Admin — AppBenk" },
      { name: "description", content: "Kirim pertanyaan atau laporan kendala aplikasi ke tim pengelola AppBenk dan pantau status tiket bantuan." },
      { property: "og:title", content: "Customer Service Admin — AppBenk" },
      { property: "og:description", content: "Bantuan teknis aplikasi AppBenk untuk admin bengkel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomerServicePage,
});
