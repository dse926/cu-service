"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  fetchTeams,
  integrationsEnabled,
  saveTeams,
  type ApiTeam,
} from "@/lib/integrations-api";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function TeamsTrainerPage() {
  const enabled = integrationsEnabled();
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    void fetchTeams()
      .then((c) => setTeams(c.teams))
      .catch((e: Error) => setError(e.message));
  }, [enabled]);

  function update(index: number, patch: Partial<ApiTeam>) {
    setTeams((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  }

  async function onSave() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await saveTeams(teams);
      setMessage("Team descriptions saved. Routing will use the new wording.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      actions={
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-[#1a4a5c]/20 bg-white/80"
          )}
        >
          <ArrowLeft data-icon="inline-start" />
          Queue
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-medium tracking-wide text-[#1a4a5c] uppercase">
            Training
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#143a48]">
            Team routing descriptions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Write how each Azure DevOps team talks about their work. The
            classifier scores ticket text against these descriptions to pick the
            sprint backlog / area path.
          </p>
        </header>

        {!enabled ? (
          <div className="rounded-xl border border-dashed border-[#1a4a5c]/20 bg-white/60 px-5 py-10 text-sm text-muted-foreground">
            Connect <code className="text-xs">NEXT_PUBLIC_API_URL</code> to the
            Azure API to edit live team routing. Seed descriptions ship in{" "}
            <code className="text-xs">server/config/teams.json</code>.
          </div>
        ) : (
          <div className="space-y-5">
            {teams.map((team, index) => (
              <section
                key={team.id}
                className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5 space-y-3"
              >
                <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                  {team.name}
                </h2>
                <div className="space-y-2">
                  <Label htmlFor={`desc-${team.id}`}>
                    Description (training text)
                  </Label>
                  <Textarea
                    id={`desc-${team.id}`}
                    rows={4}
                    value={team.description}
                    onChange={(e) =>
                      update(index, { description: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`area-${team.id}`}>ADO area path</Label>
                    <Input
                      id={`area-${team.id}`}
                      value={team.adoAreaPath}
                      onChange={(e) =>
                        update(index, { adoAreaPath: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`mail-${team.id}`}>Notify emails</Label>
                    <Input
                      id={`mail-${team.id}`}
                      value={team.notifyEmails.join(", ")}
                      onChange={(e) =>
                        update(index, {
                          notifyEmails: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="bg-white"
                    />
                  </div>
                </div>
              </section>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={busy || teams.length === 0}
                className="bg-[#1a4a5c] hover:bg-[#143a48]"
                onClick={() => void onSave()}
              >
                {busy ? "Saving…" : "Save training"}
              </Button>
              {message ? (
                <p className="text-sm text-[#2f5d4a]">{message}</p>
              ) : null}
              {error ? (
                <p className="text-sm text-rose-700">{error}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
