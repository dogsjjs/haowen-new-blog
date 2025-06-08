/**
 * @file menuUtils.ts
 * Utilities for generating and processing menu items,
 * including cleaning route parameters from paths.
 */

/**
 * Represents the structure of a route definition, similar to Vue Router's RouteRecordRaw.
 * Used as input for generating menu items.
 */
export interface RouteConfig {
  path: string; // The path string, can contain parameters
  name?: string; // Route name
  meta?: {
    title?: string; // Title for the menu item label
    icon?: string; // Icon for the menu item
    // ... other meta fields
  };
  children?: RouteConfig[]; // Nested routes
}

/**
 * Represents the structure of a generated menu item.
 */
export interface MenuItem {
  path: string; // Cleaned path for navigation, without parameters
  label: string; // Display label for the menu item
  icon?: string; // Optional icon
  children?: MenuItem[]; // Nested menu items
}

/**
 * Cleans a given path string by removing route parameter segments.
 * For example, "/users/:id/profile" becomes "/users/profile", and "/products/:productId" becomes "/products".
 * If the path becomes empty or was just parameters (e.g., "/:id"), it defaults to "/".
 *
 * @param path The path string to clean.
 * @returns The cleaned path string.
 */
export function cleanPath(path: string): string {
  if (!path) {
    return path; // Return original if null, undefined, or empty
  }

  const segments = path.split("/");
  // Filter out segments that are parameters (e.g., ":id", ":userId?")
  const cleanedSegments = segments.filter(
    (segment) => !segment.startsWith(":")
  );

  if (path.startsWith("/")) {
    // For absolute paths
    // If cleanedSegments is [""] (e.g., from "/:id") or ["", ""] (from "/"), the result should be "/"
    if (cleanedSegments.length === 1 && cleanedSegments[0] === "") {
      return "/"; // Path was like "/:param" or "/:param1/:param2"
    }
    // If cleanedSegments is ["", ""], it means the original path was "/"
    if (
      cleanedSegments.length === 2 &&
      cleanedSegments[0] === "" &&
      cleanedSegments[1] === ""
    ) {
      return "/";
    }
    const result = cleanedSegments.join("/");
    return result === "" ? "/" : result; // If joining results in empty (e.g. path was "/:id/:id2"), default to "/"
  } else {
    // For relative paths or paths not starting with '/'
    // e.g., "foo/:id/bar" -> "foo/bar"
    // e.g., ":id/bar" -> "bar"
    // e.g., ":id" -> ""
    return cleanedSegments.join("/");
  }
}

/**
 * Generates an array of MenuItem objects from an array of RouteConfig objects.
 * The `path` property of each MenuItem will be cleaned of route parameters.
 * Handles nested routes by recursively calling itself.
 *
 * @param routes Array of route configurations.
 * @param parentPath The full path of the parent route, used for resolving relative child paths.
 * @returns An array of MenuItem objects.
 */
export function generateMenuItems(
  routes: RouteConfig[],
  parentPath: string = ""
): MenuItem[] {
  return routes
    .map((route) => {
      let currentFullPath: string;

      // 1. Construct the full path for the current route
      if (parentPath && route.path && !route.path.startsWith("/")) {
        // Relative child path: concatenate with parent's full path
        const separator = parentPath.endsWith("/") ? "" : "/";
        currentFullPath = `${parentPath}${separator}${route.path}`;
      } else {
        // Absolute path (either top-level or a child route with an absolute path)
        currentFullPath = route.path;
      }

      // 2. Clean this full path to remove parameters for the menu item's navigation path
      const menuItemPath = cleanPath(currentFullPath);

      const menuItem: MenuItem = {
        path: menuItemPath,
        label: route.meta?.title || route.name || route.path, // Fallback label
        icon: route.meta?.icon,
        children:
          route.children && route.children.length > 0
            ? generateMenuItems(route.children, currentFullPath) // Pass original full path for next level's base
            : undefined,
      };
      return menuItem;
    })
    .filter((item) => item !== null && item.path !== undefined) as MenuItem[]; // Ensure valid items
}
