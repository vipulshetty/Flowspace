import React from "react";
import dynamic from "next/dynamic";
import NotFound from "@/app/not-found";
import { createClient } from "@/utils/auth/server";
import { redirect } from "next/navigation";
import { formatEmailToName } from "@/utils/formatEmailToName";
import defaultOfficeTemplate from "@/utils/defaultOfficeTemplate.json";
import type { RealmData } from "@/utils/pixi/types";

const PlayClient = dynamic(() => import("../PlayClient"), { ssr: false });

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function getRealmData(
  realmId: string,
  shareId: string | undefined,
  accessToken: string,
) {
  try {
    let url = `${BACKEND_URL}/realms/${realmId}`;

    if (shareId) {
      url = `${BACKEND_URL}/realms/share/${shareId}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        data: null,
        error: { message: error.error || "Failed to fetch realm" },
      };
    }

    const data = await response.json();
    return { data: data.realm, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || "Network error" } };
  }
}

async function updateVisitedRealms(accessToken: string, shareId: string) {
  try {
    await fetch(`${BACKEND_URL}/realms/visited`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ share_id: shareId }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Failed to update visited realms:", error);
  }
}

export default async function Play({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { shareId: string };
}) {
  console.log('Play page params:', params);
  console.log('Play page searchParams:', searchParams);
  
  const authClient = createClient();
  const {
    data: { session },
  } = await authClient.auth.getSession();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!session || !user) {
    return redirect("/signin");
  }

  // Fetch realm data
  const { data: realm, error } = await getRealmData(
    params.id,
    searchParams.shareId,
    session.access_token,
  );

  console.log('Fetched realm:', realm);
  console.log('Fetch error:', error);

  // Show not found page if no data is returned
  if (!realm || error) {
    const message = error?.message || "Realm not found";
    return <NotFound specialMessage={message} />;
  }

  const map_data = defaultOfficeTemplate as RealmData;
  const skin = user.skin || "009";

  // Update visited realms if accessing via share link and not the owner
  if (searchParams.shareId && realm.owner_id !== user.id) {
    updateVisitedRealms(session.access_token, searchParams.shareId);
  }

  return (
    <PlayClient
      mapData={map_data}
      username={formatEmailToName(user.email)}
      access_token={session.access_token}
      realmId={params.id}
      uid={user.id}
      shareId={searchParams.shareId || ""}
      initialSkin={skin}
      name={realm.name}
    />
  );
}
