import { createClient } from "@/utils/auth/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar/Navbar";
import RealmsMenu from "./RealmsMenu/RealmsMenu";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Flowspace",
  description: "Your virtual office dashboard. Choose your workspace and start collaborating.",
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function getOwnedRealms(accessToken: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/realms/user/owned`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { data: null, error: { message: "Failed to fetch owned realms" } };
    }

    const data = await response.json();
    return { data: data.realms, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || "Network error" } };
  }
}

async function getVisitedRealms(accessToken: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/realms/visited/list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        data: null,
        error: { message: "Failed to fetch visited realms" },
      };
    }

    const data = await response.json();
    return { data: data.realms, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || "Network error" } };
  }
}

async function getRealmByShareId(accessToken: string, shareId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/realms/share/${shareId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        data: null,
        error: { message: "Failed to load the general office" },
      };
    }

    const data = await response.json();
    return { data: data.realm, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || "Network error" } };
  }
}

export default async function App() {
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

  let userRealm: any = null;
  let errorMessage = "";
  let hasOffice = false;
  let generalRealm: any = null;
  let generalRealmError = "";

  // Get user's virtual office (should only have one)
  const { data: ownedRealms, error: ownedError } = await getOwnedRealms(
    session.access_token,
  );
  if (ownedRealms && ownedRealms.length > 0) {
    userRealm = ownedRealms[0]; // Get the first (and only) office
    hasOffice = true;
  }
  if (ownedError) {
    errorMessage = ownedError.message;
  }

  const { data: visitedRealms, error: visitedError } = await getVisitedRealms(
    session.access_token,
  );
  if (visitedError && !errorMessage) {
    errorMessage = visitedError.message;
  }

  const generalShareId = process.env.NEXT_PUBLIC_GENERAL_REALM_SHARE_ID;
  if (generalShareId) {
    const { data: publicRealm, error: generalError } = await getRealmByShareId(
      session.access_token,
      generalShareId,
    );
    if (publicRealm) {
      generalRealm = publicRealm;
    }
    if (generalError) {
      generalRealmError = generalError.message;
    }
  } else {
    generalRealmError = "General office share ID is not configured.";
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-cyan-950/20 via-black to-blue-950/20 px-4 py-16 sm:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-xl">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-xs font-medium text-cyan-300">Dashboard</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {user.email?.split('@')[0]}
            </span>
          </h1>
          <p className="max-w-2xl text-base text-white/60 sm:text-lg">
            Choose your workspace and start collaborating with your team in immersive virtual environments.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-300">{errorMessage}</span>
            </div>
          </div>
        )}
        
        <RealmsMenu
          realm={userRealm}
          hasOffice={hasOffice}
          errorMessage={errorMessage}
          generalRealm={generalRealm}
          generalRealmError={generalRealmError}
          visitedRealms={visitedRealms ?? []}
        />
      </div>
    </div>
  );
}
