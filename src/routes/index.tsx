import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/login", replace: true });
  },
  head: () => ({
    meta: [
      { title: "AppBenk — Solusi Servis Kendaraan" },
      {
        name: "description",
        content: "AppBenk: platform servis kendaraan untuk pelanggan, admin bengkel, dan owner.",
      },
      { property: "og:title", content: "AppBenk — Solusi Servis Kendaraan" },
<<<<<<< HEAD
      { property: "og:description", content: "Masuk atau daftar akun untuk mulai menggunakan AppBenk." },
=======
      {
        property: "og:description",
        content: "Masuk atau daftar akun untuk mulai menggunakan AppBenk.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
