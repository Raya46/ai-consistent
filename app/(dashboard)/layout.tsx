import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<Sidebar />
				<div className="flex-1 flex flex-col w-full" id="main-content">
					<Navbar />
					<main className="flex-1 overflow-auto">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
