import { useEffect, useState } from "react";
import { Breadcrumb } from "@/types";

interface UseBreadcrumbsOptions {
  groupName?: string;
  eventTitle?: string;
  userName?: string;
  customSegments?: Record<string, string>;
}

export function useBreadcrumbs(
  options: UseBreadcrumbsOptions = {}
): Breadcrumb[] {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);
    const items: Breadcrumb[] = [];

    // Build breadcrumbs based on path and options
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      if (segment === "admin" && index === 0) {
        items.push({
          label: "Admin Dashboard",
          href: "/admin",
        });
      } else if (segment === "mod" && index === 0) {
        items.push({
          label: "Group Admin",
          href: "/mod",
        });
      } else if (segment === "groups") {
        items.push({
          label: "Groups",
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
      } else if (segment === "events") {
        items.push({
          label: "Events",
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
      } else if (segment === "users") {
        items.push({
          label: "Users",
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
      } else if (options.customSegments?.[segment]) {
        items.push({
          label: options.customSegments[segment],
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
      } else if (isUUID(segment)) {
        // Handle dynamic segments
        let label = "Details";

        if (options.groupName && segments[index - 1] === "groups") {
          label = options.groupName;
        } else if (options.eventTitle && segments[index - 1] === "events") {
          label = options.eventTitle;
        } else if (options.userName && segments[index - 1] === "users") {
          label = options.userName;
        }

        items.push({
          label,
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
      } else {
        // Default formatting
        const label = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        items.push({
          label,
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
      }
    });

    setBreadcrumbs(items);
  }, [
    options.groupName,
    options.eventTitle,
    options.userName,
    options.customSegments,
  ]);

  return breadcrumbs;
}

function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) || str.length > 10;
}
