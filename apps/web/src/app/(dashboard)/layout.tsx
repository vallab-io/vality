import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardTopbar } from "./_components/dashboard-topbar";
import { TopbarActionProvider } from "./_components/topbar-action-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <TopbarActionProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <DashboardHeader />

        <div className="flex">
          {/* Sidebar - Desktop */}
          <DashboardSidebar />

          {/* Main Content Area */}
          <div className="flex-1 md:ml-64">
            {/* Desktop Topbar */}
            <DashboardTopbar />
            
            {/* Page Content */}
            <main className="px-6 py-8">{children}</main>
          </div>
        </div>
      </div>
    </TopbarActionProvider>
  );
}
