/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as briefs from "../briefs.js";
import type * as comments from "../comments.js";
import type * as content from "../content.js";
import type * as files from "../files.js";
import type * as media from "../media.js";
import type * as organizations from "../organizations.js";
import type * as platformConnections from "../platformConnections.js";
import type * as schedules from "../schedules.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  briefs: typeof briefs;
  comments: typeof comments;
  content: typeof content;
  files: typeof files;
  media: typeof media;
  organizations: typeof organizations;
  platformConnections: typeof platformConnections;
  schedules: typeof schedules;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
