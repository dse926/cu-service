"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  classifyTicket,
  healthCheck,
  integrationsEnabled,
  syncTicketIntegrations,
  type ApiTeam,
  type SyncResponse,
} from "@/lib/integrations-api";
import type { Ticket } from "@/lib/types";

export function TicketIntegrations({ ticket }: { ticket: Ticket }) {
  const enabled = integrationsEnabled();
  const [health, setHealth] = useState<Awaited<
    ReturnType<typeof healthCheck>
  > | null>(null);
  const [team, setTeam] = useState<ApiTeam | null>(null);
  const [rationale, setRationale] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    void healthCheck().then(setHealth);
    void classifyTicket(ticket)
      .then((r) => {
        setTeam(r.team);
        setRationale(r.rationale);
      })
      .catch((e: Error) => setError(e.message));
  }, [enabled, ticket]);

  if (!enabled) {
    return (
      <section className="rounded-xl border border-dashed border-[#1a4a5c]/20 bg-white/60 p-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Azure integrations
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Set <code className="text-xs">NEXT_PUBLIC_API_URL</code> to your Azure
          API host to create Azure DevOps sprint items, email the routed team,
          and page PagerDuty on critical tickets. Until then this GitHub Pages
          build stays fully client-side.
        </p>
      </section>
    );
  }

  async function runSync() {
    setBusy(true);
    setError(null);
    try {
      const res = await syncTicketIntegrations(ticket, {
        teamId: team?.id,
      });
      setResult(res);
      setTeam(res.classification.team);
      setRationale(res.classification.rationale);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5 space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Azure integrations
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {health
            ? `API ${health.mockIntegrations ? "mock" : "live"} · ADO ${health.integrations.azureDevOps ? "ready" : "unset"} · Email ${health.integrations.email ? "ready" : "unset"} · PagerDuty ${health.integrations.pagerDuty ? "ready" : "unset"}`
            : "Checking API…"}
        </p>
      </div>

      {team ? (
        <div className="rounded-lg bg-[#1a4a5c]/[0.04] px-3 py-2 text-sm">
          <p className="font-medium text-[#143a48]">
            Suggested team: {team.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{rationale}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ADO area: {team.adoAreaPath}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          className="bg-[#1a4a5c] hover:bg-[#143a48]"
          onClick={() => void runSync()}
        >
          {busy
            ? "Syncing…"
            : ticket.priority === "critical"
              ? "Create ADO item + email + page"
              : "Create ADO sprint item + email"}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <ul className="space-y-2 text-sm">
          <li>
            <span className="font-medium">Azure DevOps</span>{" "}
            <span className="text-muted-foreground">({result.azureDevOps.mode})</span>
            <p className="text-xs text-muted-foreground">
              {result.azureDevOps.detail}
              {result.azureDevOps.externalUrl ? (
                <>
                  {" "}
                  <a
                    className="underline"
                    href={result.azureDevOps.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open work item
                  </a>
                </>
              ) : null}
            </p>
          </li>
          <li>
            <span className="font-medium">Email</span>{" "}
            <span className="text-muted-foreground">({result.email.mode})</span>
            <p className="text-xs text-muted-foreground">{result.email.detail}</p>
          </li>
          <li>
            <span className="font-medium">PagerDuty</span>{" "}
            <span className="text-muted-foreground">({result.pagerDuty.mode})</span>
            <p className="text-xs text-muted-foreground">
              {result.pagerDuty.detail}
            </p>
          </li>
        </ul>
      ) : null}
    </section>
  );
}
