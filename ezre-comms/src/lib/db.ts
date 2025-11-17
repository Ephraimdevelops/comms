// Convex database utilities
// These functions are now replaced by Convex queries/mutations
// Import and use Convex hooks in components instead

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Re-export types for convenience
export type { Id } from "../../convex/_generated/dataModel";

// Legacy function signatures for compatibility
// These should be replaced with direct Convex hook calls in components

export async function getOrganizationBySlug(slug: string) {
  // Use: const org = useQuery(api.organizations.getBySlug, { slug });
  throw new Error("Use Convex hook: useQuery(api.organizations.getBySlug, { slug })");
}

export async function getUserWithOrganization(clerkUserId: string) {
  // Use: const user = useQuery(api.users.getByClerkUserId, { clerkUserId });
  throw new Error("Use Convex hook: useQuery(api.users.getByClerkUserId, { clerkUserId })");
}

export async function getOrganizationFiles(organizationId: string) {
  // Use: const files = useQuery(api.files.getByOrganization, { organizationId });
  throw new Error("Use Convex hook: useQuery(api.files.getByOrganization, { organizationId })");
}

export async function getRecentBriefs(organizationId: string, limit = 10) {
  // Use: const briefs = useQuery(api.briefs.getRecent, { organizationId, limit });
  throw new Error("Use Convex hook: useQuery(api.briefs.getRecent, { organizationId, limit })");
}

export async function getContentAnalytics(organizationId: string, days = 30) {
  // Use: const analytics = useQuery(api.content.getAnalytics, { organizationId, days });
  throw new Error("Use Convex hook: useQuery(api.content.getAnalytics, { organizationId, days })");
}
