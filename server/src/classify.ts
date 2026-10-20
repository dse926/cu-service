import type { ClassifyResult, Team, TicketPayload } from "./types.js";

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "for",
  "in",
  "on",
  "at",
  "is",
  "are",
  "with",
  "from",
  "by",
  "as",
  "be",
  "this",
  "that",
  "it",
  "we",
  "our",
  "their",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/[\s/-]+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function scoreTeam(team: Team, ticket: TicketPayload): { score: number; hits: string[] } {
  const hay = tokens(
    [
      ticket.title,
      ticket.description,
      ticket.category || "",
      ticket.type,
      ticket.changeType || "",
      ticket.riskLevel || "",
      ticket.requester.department,
    ].join(" ")
  );
  const needle = new Set(tokens(team.description + " " + team.name));
  const hits: string[] = [];
  let score = 0;
  for (const t of hay) {
    if (needle.has(t)) {
      score += 1;
      if (!hits.includes(t)) hits.push(t);
    }
  }
  // Light boosts for structured fields
  if (ticket.type === "change_request" && team.id === "change-management") score += 3;
  if (ticket.type === "help_desk" && team.id === "service-desk") score += 2;
  if (ticket.priority === "critical" && (team.id === "infosec" || team.id === "infrastructure")) {
    score += 1;
  }
  if (ticket.category === "access" && team.id === "service-desk") score += 2;
  if (ticket.category === "network" && team.id === "infrastructure") score += 2;
  return { score, hits };
}

/**
 * Trainable team router: edit each team's `description` with the language
 * staff use in tickets. Matching is token overlap against those descriptions.
 */
export function classifyTeam(
  teams: Team[],
  ticket: TicketPayload
): ClassifyResult {
  const ranked = teams
    .map((team) => {
      const { score, hits } = scoreTeam(team, ticket);
      return { team, score, hits };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const rationale =
    best.hits.length > 0
      ? `Matched team description terms: ${best.hits.slice(0, 8).join(", ")}.`
      : `No strong keyword overlap; defaulted to ${best.team.name}. Improve routing by expanding that team's description.`;

  return {
    team: best.team,
    score: best.score,
    rationale,
    alternatives: ranked.slice(1, 4).map((r) => ({
      teamId: r.team.id,
      name: r.team.name,
      score: r.score,
    })),
  };
}
