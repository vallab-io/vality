import { HomeSidebar } from "@/app/home/_components/home-sidebar";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <HomeSidebar />
      <div className="ml-64">{children}</div>
    </div>
  );
}

