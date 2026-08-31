export type ContentDataViewMode = "GLOBAL" | "LOCAL";

export type TeamScopedContent = {
  team_id: string | null;
};

/** Roles are stored in lowercase in profiles; all operational roles can consume scoped content. */
export function canViewTeamScopedContent(role: string | null | undefined) {
  return role === "advisor" || role === "leader" || role === "director" || role === "super_admin";
}

/**
 * Keeps Global records (team_id null) and records belonging to the active workspace
 * explicitly separated in the client. Database RLS remains the enforcement layer.
 */
export function filterTeamScopedContent<T extends TeamScopedContent>(
  items: T[],
  mode: ContentDataViewMode,
  currentTeamId: string | null | undefined,
) {
  if (mode === "GLOBAL") return items.filter((item) => item.team_id === null);
  if (!currentTeamId) return [];
  return items.filter((item) => item.team_id === currentTeamId);
}
