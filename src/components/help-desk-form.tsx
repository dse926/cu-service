"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createHelpDeskAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HelpDeskCategory, Priority } from "@/lib/types";
import { categoryLabels, priorityLabels } from "@/lib/labels";

const categories = Object.keys(categoryLabels) as HelpDeskCategory[];
const priorities = Object.keys(priorityLabels) as Priority[];

export function HelpDeskForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await createHelpDeskAction({
          title: String(fd.get("title") || ""),
          description: String(fd.get("description") || ""),
          priority: String(fd.get("priority") || "medium") as Priority,
          category: String(fd.get("category") || "other") as HelpDeskCategory,
          requesterName: String(fd.get("requesterName") || ""),
          requesterEmail: String(fd.get("requesterEmail") || ""),
          requesterDepartment: String(fd.get("requesterDepartment") || ""),
          requesterBranch: String(fd.get("requesterBranch") || ""),
        });
        router.push(`/tickets/${result.id}`);
        router.refresh();
      } catch {
        setError("Could not open the request. Check required fields and try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Request details
        </h2>
        <div className="space-y-2">
          <Label htmlFor="title">Summary</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="e.g. Unlock Symitar account for teller"
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={5}
            placeholder="What happened, who is affected, and any error messages."
            className="bg-white"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue="access"
              className="flex h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              name="priority"
              defaultValue="medium"
              className="flex h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#1a4a5c]/10 pt-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Requester
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="requesterName">Name</Label>
            <Input
              id="requesterName"
              name="requesterName"
              required
              defaultValue="Jordan Hale"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requesterEmail">Email</Label>
            <Input
              id="requesterEmail"
              name="requesterEmail"
              type="email"
              required
              defaultValue="jordan.hale@meridiancu.org"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requesterDepartment">Department</Label>
            <Input
              id="requesterDepartment"
              name="requesterDepartment"
              required
              defaultValue="Consumer Lending"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requesterBranch">Branch</Label>
            <Input
              id="requesterBranch"
              name="requesterBranch"
              defaultValue="Westlake Branch"
              className="bg-white"
            />
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#1a4a5c] hover:bg-[#143a48]"
        >
          {pending ? "Opening…" : "Open help desk ticket"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push("/")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
