"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import BasicButton from "@/components/BasicButton";
import { useRouter } from "next/navigation";
import { request } from "@/utils/backend/requests";
import { createClient } from "@/utils/auth/client";
import { useModal } from "@/app/hooks/useModal";

type Realm = {
  id: string;
  name: string;
  share_id: string;
  map_data?: {
    rooms: Array<{ name: string }>;
  };
};

type VisitedRealm = {
  id: string;
  name: string;
  share_id: string;
};

type RealmsMenuProps = {
  realm: Realm | null;
  hasOffice: boolean;
  errorMessage: string;
  generalRealm: Realm | null;
  generalRealmError: string;
  visitedRealms: VisitedRealm[];
};

const zones = [
  { name: "Lobby", icon: "�️", description: "Greets guests and teammates." },
  { name: "Team Pods", icon: "💼", description: "Focus desks for daily work." },
  { name: "All Hands Stage", icon: "🗣️", description: "Host stand-ups or demos." },
  { name: "Focus Rooms", icon: "�", description: "Quiet areas for heads-down time." },
  { name: "Lounge", icon: "☕", description: "Casual catch-ups & social time." },
];

const generalFeatures = [
  { icon: "🤝", label: "Meet anyone in Flowspace Commons" },
  { icon: "🎥", label: "Proximity video & audio verified for groups" },
  { icon: "⚡", label: "Instant access—no setup required" },
];

const personalFeatures = [
  { icon: "🏢", label: "Five curated zones tailored for teams" },
  { icon: "🔒", label: "Owner controls access & privacy" },
  { icon: "📡", label: "Proximity bubbles connect up to 6 people automatically" },
];

const RealmsMenu: React.FC<RealmsMenuProps> = ({
  realm,
  hasOffice,
  errorMessage,
  generalRealm,
  generalRealmError,
  visitedRealms,
}) => {
  const [playerCounts, setPlayerCounts] = useState<{ general: number; personal: number }>(() => ({
    general: 0,
    personal: 0,
  }));
  const router = useRouter();
  const authClient = useMemo(() => createClient(), []);
  const { setModal } = useModal();

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (generalRealmError && generalRealm) {
      toast.error(generalRealmError);
    }
  }, [generalRealmError, generalRealm]);

  const refreshPlayerCounts = useCallback(async () => {
    const realmIds: string[] = [];
    const keys: Array<"general" | "personal"> = [];

    if (generalRealm?.id) {
      realmIds.push(generalRealm.id);
      keys.push("general");
    }
    if (realm?.id) {
      realmIds.push(realm.id);
      keys.push("personal");
    }

    if (realmIds.length === 0) return;

    const {
      data: { session },
    } = await authClient.getSession();
    if (!session) return;

    const { data: countData } = await request(
      "/getPlayerCounts",
      { realmIds },
      session.access_token,
    );

    if (!countData) return;

    const updates: Partial<typeof playerCounts> = {};
    keys.forEach((key, index) => {
      updates[key] = countData.playerCounts[index] || 0;
    });
    setPlayerCounts((prev) => ({ ...prev, ...updates }));
  }, [authClient, generalRealm?.id, realm?.id]);

  useEffect(() => {
    refreshPlayerCounts();
    const interval = setInterval(refreshPlayerCounts, 15000);
    return () => clearInterval(interval);
  }, [refreshPlayerCounts]);

  const enterGeneralOffice = () => {
    if (!generalRealm) {
      toast.error("General office is not available yet.");
      return;
    }
    router.push(`/play/${generalRealm.id}?shareId=${generalRealm.share_id}`);
  };

  const enterOffice = () => {
    if (!realm) return;
    router.push(`/play/${realm.id}?shareId=${realm.share_id}`);
  };

  const createOffice = () => {
    setModal("Create Realm");
  };

  const copyInviteLink = async () => {
    if (!realm || typeof window === "undefined") return;
    const inviteUrl = `${window.location.origin}/play/${realm.id}?shareId=${realm.share_id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success("Invite link copied to clipboard");
      } else {
        throw new Error("Clipboard unavailable");
      }
    } catch (error) {
      toast.info(`Share ID: ${realm.share_id}`);
    }
  };

  const handleVisit = (realmId: string, shareId: string) => {
    router.push(`/play/${realmId}?shareId=${shareId}`);
  };

  const filteredVisited = useMemo(() => {
    const exclude = new Set<string>();
    if (realm?.id) exclude.add(realm.id);
    if (generalRealm?.id) exclude.add(generalRealm.id);
    return visitedRealms.filter((entry) => !exclude.has(entry.id)).slice(0, 4);
  }, [visitedRealms, realm?.id, generalRealm?.id]);

  return (
    <div className="flex flex-col gap-8">
      {/* Main Workspace Cards */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* General Office Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-xl transition-all hover:border-cyan-500/30">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-all group-hover:bg-cyan-500/20" />
          
          <div className="relative">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Shared Space
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  {generalRealm?.name || "Flowspace Commons"}
                </h2>
                <p className="text-sm text-white/60">
                  Drop-in lounge for quick stand-ups, serendipitous chats, and community events.
                </p>
              </div>
              <div className="ml-4 flex flex-col items-end">
                <span className="text-xs font-medium text-white/40">Online</span>
                <span className="text-2xl font-bold text-cyan-400">{playerCounts.general}</span>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              {generalFeatures.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="text-lg">{feature.icon}</span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={enterGeneralOffice}
              disabled={!generalRealm}
              className="group/btn relative w-full overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="relative z-10">
                {generalRealm ? "Join Commons" : "Configure General Office"}
              </span>
            </button>
            
            {!generalRealm && (
              <p className="mt-3 text-xs text-white/40">
                Add <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-cyan-300">NEXT_PUBLIC_GENERAL_REALM_SHARE_ID</code> to env
              </p>
            )}
          </div>
        </div>

        {/* Personal Office Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-xl transition-all hover:border-blue-500/30">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl transition-all group-hover:bg-blue-500/20" />
          
          <div className="relative">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
                  </svg>
                  {hasOffice ? "Your HQ" : "Create Office"}
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  {hasOffice ? realm?.name || "My Virtual Office" : "Launch Your Team Office"}
                </h2>
                <p className="text-sm text-white/60">
                  {hasOffice
                    ? "Invite teammates into a polished workspace with meeting rooms, pods, and lounge areas."
                    : "Spin up a branded office layout in one click—perfect for hybrid teams."}
                </p>
              </div>
              {hasOffice && (
                <div className="ml-4 flex flex-col items-end">
                  <span className="text-xs font-medium text-white/40">Online</span>
                  <span className="text-2xl font-bold text-blue-400">{playerCounts.personal}</span>
                </div>
              )}
            </div>

            {hasOffice ? (
              <>
                <div className="mb-6 space-y-3">
                  {personalFeatures.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-3 text-sm text-white/70">
                      <span className="text-lg">{feature.icon}</span>
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={enterOffice}
                    className="flex-1 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/50"
                  >
                    Enter Office
                  </button>
                  {realm && (
                    <button
                      type="button"
                      onClick={copyInviteLink}
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                    >
                      <svg className="inline h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {zones.map((zone) => (
                    <div
                      key={zone.name}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm"
                    >
                      <span className="text-2xl">{zone.icon}</span>
                      <div>
                        <p className="font-semibold text-white">{zone.name}</p>
                        <p className="text-xs text-white/50">{zone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={createOffice}
                  className="w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/50"
                >
                  Create My Office
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recently Visited Section */}
      {filteredVisited.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Recently Visited</h3>
            <span className="text-xs font-medium text-white/40">Jump back in</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredVisited.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 backdrop-blur-sm transition-all hover:border-white/20"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">{entry.name}</p>
                  <p className="text-xs text-white/40">ID: {entry.share_id}</p>
                </div>
                <button
                  onClick={() => handleVisit(entry.id, entry.share_id)}
                  className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealmsMenu;
