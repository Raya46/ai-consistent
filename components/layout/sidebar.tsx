"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, FolderGit2, MenuIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

const navigation = [
	{ name: "Home", href: "/home", icon: Home },
	{ name: "Projects", href: "/projects", icon: FolderGit2 },
	{ name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const mainContent = document.getElementById("main-content");
		if (mainContent) {
			if (isOpen) {
				mainContent.style.marginLeft = "16rem";
			} else {
				mainContent.style.marginLeft = "4rem";
			}
		}
	}, [isOpen]);

	return (
		<>
			{/* Desktop Sidebar */}
			<div
				className={cn(
					"hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 z-50",
					isOpen ? "lg:w-64" : "lg:w-16",
				)}
			>
				<div className="flex flex-1 flex-col bg-slate-900">
					<div className="flex h-16 items-center justify-center px-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-slate-200 hover:text-white hover:bg-slate-800 h-8 w-8"
							onClick={() => setIsOpen(!isOpen)}
						>
							{isOpen ? (
								<X className="h-4 w-4" />
							) : (
								<MenuIcon className="h-4 w-4" />
							)}
						</Button>
					</div>
					<nav className="flex-1 space-y-2 px-2">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									pathname === item.href
										? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
										: "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
									"group flex items-center px-2 py-2 text-sm font-medium rounded-md",
									isOpen ? "justify-start" : "justify-center",
								)}
								title={item.name}
							>
								<item.icon
									className={cn(
										pathname === item.href
											? "text-gray-500 dark:text-gray-300"
											: "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300",
										"h-6 w-6 flex-shrink-0",
										isOpen ? "mr-3" : "",
									)}
								/>
								{isOpen && item.name}
							</Link>
						))}
					</nav>
					<div className="flex flex-shrink-0 p-2 justify-center">
						<Avatar className="h-8 w-8">
							<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</div>
				</div>
			</div>

			{/* Mobile Sidebar */}
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" className="lg:hidden">
						<MenuIcon className="h-6 w-6" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-64">
					<nav className="flex-1 space-y-1 px-2 mt-16">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									pathname === item.href
										? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
										: "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
									"group flex items-center px-2 py-2 text-sm font-medium rounded-md",
								)}
							>
								<item.icon
									className={cn(
										pathname === item.href
											? "text-gray-500 dark:text-gray-300"
											: "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300",
										"mr-3 h-6 w-6 flex-shrink-0",
									)}
								/>
								{item.name}
							</Link>
						))}
					</nav>
					<div className="absolute bottom-4 left-4">
						<Avatar>
							<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
