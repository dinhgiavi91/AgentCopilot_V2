export const LEADERSHIP_TRAITS = ["Visionary", "Architect", "Nurturer", "Coach"] as const;
export type LeadershipTrait = (typeof LEADERSHIP_TRAITS)[number];

/** Existing curriculum codes provide a concrete, access-controlled practice context for each L.E.A.D result. */
export const LEADERSHIP_PRACTICE_PLAYBOOK_CODES: Record<LeadershipTrait, string> = {
  Visionary: "v80-playbook-02",
  Architect: "v80-playbook-04",
  Nurturer: "v80-playbook-04",
  Coach: "v80-playbook-01",
};

export function getLeadershipPracticePlaybookCode(trait: LeadershipTrait) {
  return LEADERSHIP_PRACTICE_PLAYBOOK_CODES[trait];
}

export function isLeadershipTrait(value: unknown): value is LeadershipTrait {
  return typeof value === "string" && LEADERSHIP_TRAITS.includes(value as LeadershipTrait);
}

/** Returns the highest tally; ties are resolved by the earliest matching answer to keep outcomes deterministic. */
export function calculateLeadershipTraitResult(answers: LeadershipTrait[]): LeadershipTrait | null {
  if (!answers.length) return null;
  const tallies = new Map<LeadershipTrait, number>();
  answers.forEach((trait) => tallies.set(trait, (tallies.get(trait) ?? 0) + 1));
  const highest = Math.max(...Array.from(tallies.values()));
  return answers.find((trait) => tallies.get(trait) === highest) ?? null;
}
