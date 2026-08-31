import { createFileRoute } from "@tanstack/react-router";
import { CustomerServicePage } from "@/components/customer-service";

export const Route = createFileRoute("/_shell/pelanggan/cs")({
  head: () => ({
    meta: [
      { title: "Customer Service — AppBenk" },
      { name: "description", content: "Hubungi tim AppBenk untuk bantuan penggunaan aplikasi: kirim pertanyaan, laporkan masalah, dan pantau status tiket Anda." },
      { property: "og:title", content: "Customer Service — AppBenk" },
      { property: "og:description", content: "Bantuan penggunaan aplikasi AppBenk untuk pelanggan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomerServicePage,
});
