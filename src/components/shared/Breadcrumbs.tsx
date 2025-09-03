"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Breadcrumb, BreadcrumbsProps } from "@/types";

export default function Breadcrumbs({
  customItems,
  className = "",
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if no custom items provided
  const generateBreadcrumbs = (): Breadcrumb[] => {
    if (customItems) return customItems;

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [];

    // Add home/dashboard
    if (segments[0] === "admin") {
      breadcrumbs.push({
        label: "Admin Dashboard",
        href: "/admin",
      });
    } else if (segments[0] === "mod") {
      breadcrumbs.push({
        label: "Group Admin",
        href: "/mod",
      });
    } else {
      breadcrumbs.push({
        label: "Dashboard",
        href: "/",
      });
    }

    // Process each segment
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Skip dynamic route segments (UUIDs, etc.) unless they're the last segment
      if (isUUID(segment) && !isLast) {
        return;
      }

      const label = formatSegmentLabel(segment);

      // Handle special cases
      if (segment === "admin" && index === 0) {
        return; // Already added as "Admin Dashboard"
      }
      if (segment === "mod" && index === 0) {
        return; // Already added as "Group Admin"
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-2" />
            )}

            {index === 0 && (
              <HomeIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
            )}

            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-sm ${
                  item.current
                    ? "text-gray-900 dark:text-white font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Helper functions
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) || str.length > 10; // Also catch cuid-style IDs
}

function formatSegmentLabel(segment: string): string {
  // Handle UUIDs or long IDs - these will need custom labels
  if (isUUID(segment)) {
    return "Details"; // Fallback - should be overridden with custom items
  }

  // Convert kebab-case and handle special cases
  const specialCases: Record<string, string> = {
    admin: "Admin",
    mod: "Moderator",
    groups: "Groups",
    events: "Events",
    users: "Users",
    settings: "Settings",
    profile: "Profile",
    notifications: "Notifications",
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Convert kebab-case to Title Case
  return segment
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
