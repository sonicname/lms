import { index, layout, type RouteConfig } from '@react-router/dev/routes';
import {
  buildGlobRouteConfig,
  type GlobModules,
} from './core/router/route-builder';

// Import all module page and API route files
const globTree = import.meta.glob('./modules/**/pages/**/*.{tsx,ts}');

// Build React Router v7 RouteConfig nodes for modules/*/pages/* using our custom builder
const moduleRoutes = buildGlobRouteConfig(globTree as GlobModules);

const routes = [
  // All module pages are nested under a shared modules root layout
  layout('modules/__root.tsx', [
    index('modules/__homepage.tsx'),
    ...moduleRoutes,
  ]),
];

export default routes satisfies RouteConfig;
