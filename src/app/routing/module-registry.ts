import React from "react";

/**
 * Contract for a routable module.
 * Each module provides its own route entries — host-router never imports modules directly.
 */
export type RouteModule = {
  getRouteEntries: () => React.ReactNode;
};

/**
 * Registry of all mountable modules.
 * Extend this type (and pass a new registry instance) to add a module — never edit moduleMounter.
 */
export type ModuleRegistry = {
  apex: RouteModule;
  authentication: RouteModule;
  admin: RouteModule;
  student: RouteModule;
};
