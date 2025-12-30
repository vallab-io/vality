import type { Metadata } from "next";
import SettingsPageClient from "./settings-page-client";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
