"use client";

import { useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { useAlertPreferences, type AlertPreferences } from "@/hooks/use-alert-preferences";
import { accentColors, usePreferences, type AccentColor, type SurfaceTheme } from "@/hooks/use-preferences";
import { usePushNotifications } from "@/hooks/use-push-notifications";

type Section = "Profile" | "Appearance" | "Alerts";

const alertRows: Array<{ key: keyof AlertPreferences; name: string; description: string }> = [
  { key: "buySignals", name: "Goal-fit buy signals", description: "Notify when a token crosses your goal-fit threshold." },
];

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("Profile");
  const { preferences, updatePreferences } = usePreferences();
  const { alerts, toggleAlert } = useAlertPreferences();
  const push = usePushNotifications();

  return <div className="space-y-6">
    <PageHeading eyebrow="Personal workspace" title="Settings" description="Make NexIQ feel like yours and control exactly how it gets your attention." />
    <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="panel flex h-fit gap-1 overflow-x-auto p-2 lg:block">{(["Profile", "Appearance", "Alerts"] as Section[]).map(item => <button type="button" key={item} onClick={() => setSection(item)} className={`min-w-fit rounded-xl px-3 py-3 text-left text-sm lg:w-full ${section === item ? "bg-[var(--accent-soft)] text-white" : "text-[#7e857e]"}`}>{item}</button>)}</div>
      <div className="panel p-5 md:p-7">
        {section === "Profile" && <div className="max-w-xl"><div className="eyebrow">Personalization</div><h2 className="mt-2 text-xl font-semibold">Your NexIQ identity</h2><p className="mt-2 text-sm leading-6 text-[#7f877f]">This name appears in the app header and personalized briefings.</p><label className="mt-7 block"><span className="eyebrow">Display name</span><input value={preferences.displayName} maxLength={24} onChange={event => updatePreferences({ displayName: event.target.value })} className="field mt-2 w-full px-4 py-3" placeholder="Investor" /></label><label className="mt-5 flex items-center gap-3 rounded-2xl border border-[#292e29] p-4"><input type="checkbox" checked={preferences.compactMode} onChange={event => updatePreferences({ compactMode: event.target.checked })} className="h-4 w-4 accent-[var(--accent)]" /><div><div className="text-sm font-medium">Compact workspace</div><div className="mt-1 text-xs text-[#747b74]">Fit more market information on screen.</div></div></label></div>}

        {section === "Appearance" && <div><div className="eyebrow">Visual system</div><h2 className="mt-2 text-xl font-semibold">Choose your atmosphere</h2><p className="mt-2 text-sm text-[#7f877f]">Changes apply instantly across the entire app.</p><div className="mt-7"><div className="eyebrow">Accent color</div><div className="mt-3 flex flex-wrap gap-3">{(Object.keys(accentColors) as AccentColor[]).map(accent => <button type="button" key={accent} aria-label={`Use ${accent} accent`} aria-pressed={preferences.accent === accent} onClick={() => updatePreferences({ accent })} className={`grid h-12 w-12 place-items-center rounded-2xl border transition ${preferences.accent === accent ? "scale-105 border-white" : "border-transparent"}`} style={{ background: accentColors[accent] }}><span className="text-black">{preferences.accent === accent ? "✓" : ""}</span></button>)}</div></div><div className="mt-8"><div className="eyebrow">Surface</div><div className="mt-3 grid gap-3 sm:grid-cols-3">{(["carbon", "midnight", "graphite"] as SurfaceTheme[]).map(surface => <button type="button" key={surface} aria-pressed={preferences.surface === surface} onClick={() => updatePreferences({ surface })} className={`rounded-2xl border p-4 text-left capitalize transition ${preferences.surface === surface ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[#303530]"}`}><span className="text-sm font-medium">{surface}</span><span className="mt-3 block h-12 rounded-xl border border-white/10" style={{ background: surface === "carbon" ? "#080b0d" : surface === "midnight" ? "#090d18" : "#151619" }} /></button>)}</div></div></div>}

        {section === "Alerts" && <div><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow">Signal delivery</div><h2 className="mt-2 text-xl font-semibold">Never miss your setup</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#7f877f]">Enable browser alerts, then NexIQ can notify you when an open scan finds a token above your goal-fit threshold.</p></div><Button variant="outline" size="sm" onClick={push.enable} disabled={!push.supported || push.permission === "granted"}>{push.permission === "granted" ? "Push enabled" : push.supported ? "Enable push" : "Unavailable"}</Button></div><div className="mt-7 divide-y divide-[#272b27]">{alertRows.map(row => <div key={row.key} className="flex items-center gap-4 py-5 first:pt-0"><div><div className="text-sm font-medium">{row.name}</div><div className="mt-1 text-xs leading-5 text-[#747b74]">{row.description}</div></div><button type="button" aria-label={`Toggle ${row.name}`} aria-pressed={alerts[row.key]} onClick={() => toggleAlert(row.key)} className={`ml-auto flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 ${alerts[row.key] ? "justify-end bg-[var(--accent)]" : "justify-start bg-[#303530]"}`}><span className="h-5 w-5 rounded-full bg-[#0c0e0d]" /></button></div>)}</div><p className="mt-5 rounded-2xl bg-[#0d100e] p-4 text-xs leading-5 text-[#737a73]">Background delivery still requires a hosted push provider. Until then, alerts work while NexIQ is open and scanning.</p></div>}
      </div>
    </section>
  </div>;
}
