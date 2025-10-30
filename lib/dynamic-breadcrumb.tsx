import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = { label: string; href?: string };

export default function generateBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean); // e.g. ['home', 'auto-transcribe']
  const crumbs: Crumb[] = [];

  // Handle home routes
  if (segments[0] === "home") {
    crumbs.push({ label: "Home", href: "/home" });

    if (segments.length > 1) {
      // /home/auto-transcribe or /home/document-analysis
      const subRoute = segments[1];
      const formattedName = subRoute
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      crumbs.push({ label: formattedName });
    }
  } else if (segments[0] === "projects") {
    crumbs.push({ label: "Projects" });
  } else if (segments[0] === "settings") {
    crumbs.push({ label: "Settings" });
  }

  return (
    <>
      {crumbs.map((crumb, index) => (
        <BreadcrumbItem key={index}>
          {crumb.href ? (
            <BreadcrumbLink
              href={crumb.href}
              className="text-white hover:text-gray-200"
            >
              {crumb.label}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="text-white">
              {crumb.label}
            </BreadcrumbPage>
          )}
          {index < crumbs.length - 1 && (
            <BreadcrumbSeparator className="text-white" />
          )}
        </BreadcrumbItem>
      ))}
    </>
  );
}
