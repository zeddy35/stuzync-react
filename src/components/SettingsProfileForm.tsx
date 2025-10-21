"use client";

import { useState } from "react";
import { showToast } from "@/lib/toastBus";

type Props = {
  defaults: {
    firstName?: string;
    lastName?: string;
    school?: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
  };
};

export default function SettingsProfileForm({ defaults }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/profile", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      showToast({ text: "Profile saved", variant: "success" });
    } catch (e: any) {
      setError(e?.message || "Failed to save");
      showToast({ text: "Failed to save profile", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="section-card space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="firstName">First name</label>
          <input className="input" id="firstName" name="firstName" defaultValue={defaults.firstName || ""} required />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Last name</label>
          <input className="input" id="lastName" name="lastName" defaultValue={defaults.lastName || ""} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="school">School</label>
          <input className="input" id="school" name="school" defaultValue={defaults.school || ""} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" defaultValue={defaults.phone || ""} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bio">Bio</label>
        <textarea
          className="input min-h-28"
          id="bio"
          name="bio"
          placeholder="Tell people about yourself."
          defaultValue={defaults.bio || ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="skills">Skills (comma-separated)</label>
        <input
          className="input"
          id="skills"
          name="skills"
          placeholder="React, Node, MongoDB"
          defaultValue={(defaults.skills || []).join(", ")}
        />
        <p className="text-xs text-neutral-500 mt-1">Use commas to separate items.</p>
      </div>

      <div>
        <label className="label" htmlFor="interests">Interests (comma-separated)</label>
        <input
          className="input"
          id="interests"
          name="interests"
          placeholder="AI, Startups, Design"
          defaultValue={(defaults.interests || []).join(", ")}
        />
      </div>

      {error && <div className="toast toast-error">{error}</div>}

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

