import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { DashboardHeader } from "./_components/dashboard-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <DashboardHeader />

      <div className="flex">
        {/* Sidebar - Desktop */}
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 md:ml-64">{children}</main>
      </div>
    </div>
  );
}
