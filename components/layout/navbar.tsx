"use client";

import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import generateBreadcrumb from "@/lib/dynamic-breadcrumb";

export function Navbar() {
  const pathname = usePathname();

  // Check if current route should hide search bar
  const hideSearch = ["/home/auto-transcribe", "/home/document-analysis"].some(
    (route) => pathname.startsWith(route)
  );

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-slate-900 px-4 sm:gap-x-6 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        <Breadcrumb className="hidden md:flex items-center">
          {generateBreadcrumb(pathname)}
        </Breadcrumb>
        {!hideSearch && (
          <div className="flex flex-1 items-center justify-center">
            <Input
              type="search"
              placeholder="Search..."
              className="max-w-md bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}
