import type { Metadata } from "next";
import IssueEditorPageClient from "./issue-editor-page-client";

export const metadata: Metadata = {
  title: "Edit Issue",
};

export default function IssueEditorPage() {
  return <IssueEditorPageClient />;
}
