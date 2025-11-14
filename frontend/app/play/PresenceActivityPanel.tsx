"use client";
import React, { useMemo } from "react";
import type {
  ActivityAction,
  ActivityRecord,
  PresencePlayer,
} from "@/utils/pixi/types";

type Props = {
  presence: PresencePlayer[];
  activity: ActivityRecord[];
  roomNames: string[];
};

const statusStyles: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "#4ade80" },
  busy: { label: "Busy", color: "#f97316" },
  away: { label: "Away", color: "#facc15" },
};

const actionLabels: Record<ActivityAction, string> = {
  entered: "entered",
  left: "left",
  teleported: "teleported to",
  joined: "joined",
  departed: "left the realm",
};

function formatRoomName(roomIndex: number, providedName: string | undefined, roomNames: string[]): string {
  if (providedName && providedName.trim().length > 0) {
    return providedName;
  }
  const fallback = roomNames[roomIndex];
  if (fallback) {
    return fallback;
  }
  return `Room ${roomIndex + 1}`;
}

function formatRelativeTime(timestamp: number): string {
  const delta = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(delta / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const PresenceActivityPanel: React.FC<Props> = ({ presence, activity, roomNames }) => {
  const orderedPresence = useMemo(() => {
    return [...presence].sort((a, b) => b.lastSeen - a.lastSeen);
  }, [presence]);

  const trimmedActivity = useMemo(() => activity.slice(0, 15), [activity]);

  return (
    <div className="pointer-events-none absolute top-4 right-4 flex flex-col gap-3 max-w-xs">
      <section className="pointer-events-auto rounded-lg border border-white/10 bg-black/65 text-white shadow-lg backdrop-blur-sm">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            Online
          </h3>
          <span className="text-xs text-white/60">{orderedPresence.length}</span>
        </header>
        <ul className="max-h-48 overflow-y-auto px-3 py-2 text-sm">
          {orderedPresence.length === 0 && (
            <li className="py-2 text-xs text-white/50">No one is online yet.</li>
          )}
          {orderedPresence.map((player) => {
            const status = statusStyles[player.status] ?? statusStyles.available;
            const roomLabel = formatRoomName(player.roomIndex, undefined, roomNames);
            return (
              <li key={player.uid} className="flex flex-col gap-1 border-b border-white/5 py-2 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span
                    className="block h-2 w-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                    aria-hidden
                  />
                  <span className="font-medium text-white/90">{player.username}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{roomLabel}</span>
                  <span>{formatRelativeTime(player.lastSeen)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="pointer-events-auto rounded-lg border border-white/10 bg-black/65 text-white shadow-lg backdrop-blur-sm">
        <header className="border-b border-white/10 px-4 py-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Recent Activity</h3>
        </header>
        <ul className="max-h-48 overflow-y-auto px-3 py-2 text-sm">
          {trimmedActivity.length === 0 && (
            <li className="py-2 text-xs text-white/50">No events yet.</li>
          )}
          {trimmedActivity.map((event) => {
            const roomLabel = formatRoomName(event.roomIndex, event.roomName, roomNames);
            const actionVerb = actionLabels[event.action] ?? "moved";
            return (
              <li key={`${event.timestamp}-${event.uid}-${event.action}`} className="flex flex-col gap-1 border-b border-white/5 py-2 last:border-b-0">
                <span className="text-white/90">
                  <span className="font-semibold">{event.username}</span> {actionVerb} {roomLabel}
                </span>
                <span className="text-xs text-white/50">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default PresenceActivityPanel;
