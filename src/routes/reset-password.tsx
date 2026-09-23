import { createFileRoute, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mengarahkan ke Pemulihan Kata Sandi — AppBenk" },
      {
        name: "description",
        content: "Mengarahkan ke halaman verifikasi kode reset kata sandi akun AppBenk.",
      },
    ],
  }),
  component: ResetPasswordRedirectPage,
});

function ResetPasswordRedirectPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isExactRoot = location.pathname === "/reset-password" || location.pathname === "/reset-password/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isExactRoot) return;

    const queryParams = new URLSearchParams(window.location.search);
    const qEmail = queryParams.get("email");
    const sEmail = sessionStorage.getItem("appbenk_reset_email");
    const email = qEmail || sEmail;

    if (email) {
      navigate({ to: "/verify-reset-code", replace: true });
    } else {
      navigate({ to: "/forgot-password", replace: true });
    }
  }, [isExactRoot, navigate]);

  if (!isExactRoot) {
    return <Outlet />;
  }

  return (
    <AuthLayout aksi="masuk">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Mengarahkan ke alur pemulihan kata sandi...</p>
      </div>
    </AuthLayout>
  );
}
