import { Metadata } from "next";
import { Logo } from "@/components/common";
import { LoginPageClient } from "./_components/login-page-client";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Vality account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-6">
        <Logo href="/about" />
      </header>
      <LoginPageClient />
    </div>
  );
}
