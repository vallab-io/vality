import { Metadata } from "next";
import { Logo } from "@/components/common";
import { SignupPageClient } from "./_components/signup-page-client";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Vality account and start your newsletter",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-6">
        <Logo href="/about" />
      </header>
      <SignupPageClient />
    </div>
  );
}
