import React, { createElement, lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

interface RouteModule {
  default: React.ComponentType;
  Layout?: React.ComponentType<{ children: React.ReactNode }>;
}

export type GlobModules = Record<string, () => Promise<RouteModule>>;

/**
 * Sorts routes by priority root index > other index > static > dynamic > catch-all
 */
function sortRoutes(MODULES: GlobModules): string[] {
  return Object.keys(MODULES)
    .filter((route) => {
      return (
        !route.match(/\/_[^/]+$/) &&
        !route.endsWith('/layout.tsx') &&
        !route.endsWith('/error.tsx') &&
        !route.endsWith('/not-found.tsx')
      );
    })
    .sort((a, b) => {
      // Priority: root index > other index > static > dynamic > catch-all
      const aIsRootIndex = a === '/src/pages/index.tsx';
      const bIsRootIndex = b === '/src/pages/index.tsx';
      const aIsIndex = a.endsWith('/index.tsx');
      const bIsIndex = b.endsWith('/index.tsx');
      const aIsCatchAll = a.includes('[...');
      const bIsCatchAll = b.includes('[...');
      const aIsDynamic = a.includes('[') && !aIsCatchAll;
      const bIsDynamic = b.includes('[') && !bIsCatchAll;
      const aIsStatic = !aIsDynamic && !aIsCatchAll;
      const bIsStatic = !bIsDynamic && !bIsCatchAll;

      // 1. Root index first
      if (aIsRootIndex) return -1;
      if (bIsRootIndex) return 1;

      // 2. Other index routes
      if (aIsIndex !== bIsIndex) return aIsIndex ? -1 : 1;

      // 3. Static routes before dynamic and catch-all
      if (aIsStatic !== bIsStatic) return aIsStatic ? -1 : 1;

      // Extract clean paths for more accurate segment comparison
      const stripPrefix = (p: string) =>
        p
          .replace(/^\/src\/pages\//, '')
          .replace(/^\/src\/modules\/[^/]+\/pages\//, '')
          .replace(/\.tsx$/, '');
      const aPath = stripPrefix(a);
      const bPath = stripPrefix(b);

      // Count segments more accurately
      const aSegments = aPath.split('/').filter(Boolean).length;
      const bSegments = bPath.split('/').filter(Boolean).length;

      // 4. Static and Dynamic routes - sort by segments length first
      if (aSegments !== bSegments) return aSegments - bSegments;

      // 5. Within same type, sort alphabetically
      if (aIsStatic && bIsStatic) return a.localeCompare(b);
      if (aIsDynamic && bIsDynamic) return a.localeCompare(b);

      // 6. Dynamic routes before catch-all
      if (aIsDynamic !== bIsDynamic) return aIsDynamic ? -1 : 1;

      // 7. Catch-all routes last
      if (aIsCatchAll !== bIsCatchAll) return aIsCatchAll ? 1 : -1;

      // 8. Within same type, sort by path length
      return a.length - b.length;
    });
}

/**
 * Converts a file path to a valid route path.
 * Supports two roots:
 * - /src/pages/...  (legacy)
 * - /src/modules/<module>/pages/...  -> becomes /<module>/... in URL
 */
function convertToRoutePath(route: string): string {
  // Helper to convert segment patterns
  const convertSegments = (p: string) =>
    p
      .replace(/\(.+?\)\//g, '') // remove group notation
      .replace(/\/index$/, '') // remove trailing /index
      .replace(/^index$/, '')
      .replace(/\.(tsx|jsx)$/, '')
      .replace(/\[\.\.\.(.+?)\]/g, '*')
      .replace(/\[([^.].*?)\]/g, ':$1');

  // Modules pattern: /src/modules/<module>/pages/...
  const modMatch = route.match(/^\/src\/modules\/([^/]+)\/pages\/(.*)\.tsx$/);
  if (modMatch) {
    const moduleName = modMatch[1];
    let rest = modMatch[2];
    rest = convertSegments(rest);

    // If rest is empty or index -> module root
    if (!rest || rest === '') return `/${moduleName}`;

    // ensure leading slash for rest
    if (!rest.startsWith('/')) rest = '/' + rest;
    return `/${moduleName}${rest}`;
  }

  // Legacy /src/pages/... support
  const legacyMatch = route.match(/^\/src\/pages\/(.*)\.tsx$/);
  if (legacyMatch) {
    let rest = legacyMatch[1];
    rest = convertSegments(rest);
    if (!rest || rest === '') return '/';
    if (!rest.startsWith('/')) rest = '/' + rest;
    return rest;
  }

  // Fallback: remove extension and ensure leading slash
  let path = route.replace(/\.tsx$/, '');
  path = convertSegments(path);
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

/**
 * Collects layout components from the modules
 */
function collectLayouts(
  MODULES: GlobModules,
): Map<string, React.ComponentType> {
  const layoutRoutes = new Map<string, React.ComponentType>();

  Object.keys(MODULES).forEach((route) => {
    // Match layout files in either /src/pages or /src/modules/<module>/pages
    if (route.endsWith('/layout.tsx') || route.endsWith('/_layout.tsx')) {
      let layoutKey: string | undefined;

      // Root layout in legacy /src/pages/layout.tsx
      if (
        route === '/src/pages/layout.tsx' ||
        route === '/src/pages/_layout.tsx'
      ) {
        layoutKey = '';
      }

      // Module layouts: /src/modules/<module>/pages/.../layout.tsx
      const modMatch = route.match(
        /^\/src\/modules\/([^/]+)\/pages\/(.*)\/(?:_?layout)\.tsx$/,
      );
      if (modMatch) {
        const moduleName = modMatch[1];
        const rest = modMatch[2].replace(/\/$/, '');
        // if rest is empty -> module root layout
        layoutKey = rest ? `${moduleName}/${rest}` : moduleName;
      }

      // Nested module root layout like /src/modules/<module>/pages/_layout.tsx
      const modRootMatch = route.match(
        /^\/src\/modules\/([^/]+)\/pages\/(?:_?layout)\.tsx$/,
      );
      if (modRootMatch) {
        layoutKey = modRootMatch[1];
      }

      // Nested legacy layouts under /src/pages/.../layout.tsx
      if (
        !layoutKey &&
        route.startsWith('/src/pages/') &&
        (route.endsWith('/layout.tsx') || route.endsWith('/_layout.tsx'))
      ) {
        layoutKey = route
          .replace(/^\/src\/pages\//, '')
          .replace(/\/(?:_?layout)\.tsx$/, '');
      }

      if (layoutKey !== undefined) {
        // Normalize dynamic bracket segments to colon parameters for layout matching
        layoutKey = layoutKey.replace(/\[(.+?)\]/g, ':$1');
        const Layout = lazy(MODULES[route]);
        layoutRoutes.set(layoutKey, Layout);
      }
    }
  });

  return layoutRoutes;
}

/**
 * Builds an array of possible layout paths for a given route
 */
function getLayoutPaths(path: string): string[] {
  // For root path, just return an empty string
  if (path === '/') {
    return [''];
  }

  // For other paths, build layout paths from most specific to least specific
  const segments = path.split('/').filter(Boolean);
  const paths = [];

  // Start with the most specific path
  // Build paths from most specific to least specific (excluding empty string for now)
  for (let i = segments.length; i > 0; i--) {
    paths.push(segments.slice(0, i).join('/'));
  }

  // Add root layout (empty string) last - this ensures it will be applied last
  paths.push('');

  return paths;
}

// Helper: get parent key and last segment for a layout key like "auth/reports"
function getParentKey(key: string): string | null {
  if (key === '') return null;
  const pos = key.lastIndexOf('/');
  if (pos === -1) return '';
  return key.slice(0, pos);
}

function getLastSegment(key: string): string {
  if (key === '') return '';
  const pos = key.lastIndexOf('/');
  const seg = pos === -1 ? key : key.slice(pos + 1);
  const dyn = seg.match(/^\[(.+?)\]$/);
  return dyn ? `:${dyn[1]}` : seg;
}

function suspenseWrap(
  Component: React.ComponentType,
  children?: React.ReactNode,
) {
  const node = children
    ? createElement(Component, null, children)
    : createElement(Component, null);
  return createElement(
    Suspense,
    { fallback: createElement('div', null, 'Loading...') },
    node,
  );
}

/**
 * Adds not-found routes to the routes array
 */
// Attach a child route to a parent (by key) or to the top-level list
function attachRoute(
  parentKey: string | null,
  nodes: Map<string, RouteObject>,
  topLevel: RouteObject[],
  child: RouteObject,
) {
  if (parentKey === null) {
    topLevel.push(child);
    return;
  }
  const parent = nodes.get(parentKey);
  if (!parent) {
    // If no explicit parent node, attach to top-level
    topLevel.push(child);
    return;
  }
  parent.children = parent.children ?? [];
  parent.children.push(child);
}

/**
 * Builds routes from the glob modules
 */
function buildGlobRoutes(MODULES: GlobModules): RouteObject[] {
  const layoutRoutes = collectLayouts(MODULES);

  // Create nodes for layout routes (these will use <Outlet /> in the component itself)
  const nodes = new Map<string, RouteObject>();
  const topLevel: RouteObject[] = [];

  const ensureNode = (key: string) => {
    if (nodes.has(key)) return nodes.get(key)!;
    const parentKey = getParentKey(key);
    const route: RouteObject = { path: getLastSegment(key) };
    const Layout = layoutRoutes.get(key);
    if (Layout) {
      route.element = suspenseWrap(Layout);
    }
    nodes.set(key, route);

    // Attach to parent or top-level
    if (parentKey === null) {
      topLevel.push(route);
    } else {
      const parent = ensureNode(parentKey);
      parent.children = parent.children ?? [];
      parent.children.push(route);
    }
    return route;
  };

  // Ensure all layout nodes exist
  Array.from(layoutRoutes.keys()).forEach((key) => ensureNode(key));

  // Utility to find the most specific layout key for a path
  const findParentLayoutKey = (fullPath: string): string | null => {
    const keys = getLayoutPaths(fullPath);
    for (const k of keys) {
      if (layoutRoutes.has(k)) return k;
    }
    return null;
  };

  // Regular page routes
  const sortedRoutePaths = sortRoutes(MODULES);
  sortedRoutePaths.forEach((route) => {
    const fullPath = convertToRoutePath(route); // e.g., '/auth/sign-in'
    const Component = lazy(MODULES[route]);
    const element = suspenseWrap(Component);

    const parentKey = findParentLayoutKey(fullPath);

    // Compute relative path from parentKey
    let relPath = fullPath.slice(1); // remove leading '/'
    if (parentKey) {
      if (relPath.startsWith(parentKey)) {
        relPath = relPath.slice(parentKey.length);
        if (relPath.startsWith('/')) relPath = relPath.slice(1);
      }
    }

    const pageRoute: RouteObject = relPath
      ? { path: relPath, element }
      : { index: true, element };

    if (parentKey) {
      const parentNode = ensureNode(parentKey);
      parentNode.children = parentNode.children ?? [];
      parentNode.children.push(pageRoute);
    } else {
      // No layout parent, attach directly to top-level
      attachRoute(null, nodes, topLevel, pageRoute);
    }
  });

  // Not-found routes
  const notFoundRoutes = Object.keys(MODULES).filter(
    (r) => r.endsWith('/not-found.tsx') || r.endsWith('/_not-found.tsx'),
  );

  notFoundRoutes.forEach((filePath) => {
    // Determine target base path for wildcard
    let basePath = '/*';

    const modNestedMatch = filePath.match(
      /^\/src\/modules\/([^/]+)\/pages\/(.+?)\/(_?not-found)\.tsx$/,
    );
    const modRootMatch = filePath.match(
      /^\/src\/modules\/([^/]+)\/pages\/_?not-found\.tsx$/,
    );

    if (modNestedMatch) {
      const moduleName = modNestedMatch[1];
      const remainder = modNestedMatch[2].replace(/\/$/, '');
      basePath = remainder
        ? `/${moduleName}/${remainder}/*`
        : `/${moduleName}/*`;
    } else if (modRootMatch) {
      const moduleName = modRootMatch[1];
      basePath = `/${moduleName}/*`;
    } else {
      // Legacy /src/pages
      const p = filePath
        .replace(/^\/src\/pages\//, '')
        .replace(/_?not-found\.tsx$/, '')
        .replace(/\([^)]+\)\//g, '')
        .replace(/\/$/, '');
      basePath = p ? `/${p}/*` : '/*';
    }

    const layoutKeyForNotFound = basePath
      .replace(/\/\*$/, '')
      .replace(/^\//, '');
    const parentKey = layoutKeyForNotFound || null; // '' becomes null (attach to top-level)

    const NotFound = lazy(MODULES[filePath]);
    const element = suspenseWrap(NotFound);
    const nfRoute: RouteObject = { path: '*', element };

    if (parentKey) {
      const parentNode = ensureNode(parentKey);
      parentNode.children = parentNode.children ?? [];
      parentNode.children.push(nfRoute);
    } else {
      attachRoute(null, nodes, topLevel, nfRoute);
    }
  });

  return topLevel;
}

export default buildGlobRoutes;
