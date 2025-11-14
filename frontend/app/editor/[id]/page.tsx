import NotFound from "@/app/not-found";
import { createClient } from "@/utils/auth/server";
import { redirect } from "next/navigation";
import Editor from "../Editor";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function getRealmData(realmId: string, accessToken: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/realms/${realmId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { data: null, error: { message: "Failed to fetch realm" } };
    }

    const data = await response.json();
    return { data: data.realm, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || "Network error" } };
  }
}

export default async function RealmEditor({
  params,
}: {
  params: { id: string };
}) {
  const authClient = createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const {
    data: { session },
  } = await authClient.auth.getSession();

  if (!user || !session) {
    return redirect("/signin");
  }

  const { data: realm, error } = await getRealmData(
    params.id,
    session.access_token,
  );

  // Show not found page if no data is returned or user is not the owner
  if (!realm || error) {
    return <NotFound />;
  }

  // Check if user is the owner
  if (realm.owner_id !== user.id) {
    return <NotFound />;
  }

  const map_data = realm.map_data;

  return (
    <div>
      <Editor realmData={map_data} />
    </div>
  );
}
