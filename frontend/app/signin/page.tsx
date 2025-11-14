"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/auth/client";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true); // Simple email-only mode by default
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const authClient = createClient();

  useEffect(() => {
    // Check for error from OAuth callback using window.location to avoid useSearchParams SSR issues
    try {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get('error');
      if (oauthError) {
        setError(decodeURIComponent(oauthError));
      }
    } catch (e) {
      // ignore in non-browser contexts
    }
  }, []);

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth route
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (simpleMode) {
        // Simple email-only sign in
        const { data, error: signInError } = await authClient.simpleSignIn(email);
        if (signInError) {
          setError(signInError.error);
          setLoading(false);
          return;
        }
        if (data) {
          router.push("/app");
          router.refresh();
        }
      } else if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await authClient.signUp(
          email,
          password,
        );
        if (signUpError) {
          setError(signUpError.error);
          setLoading(false);
          return;
        }
        if (data) {
          router.push("/app");
          router.refresh();
        }
      } else {
        // Sign in
        const { data, error: signInError } = await authClient.signIn(
          email,
          password,
        );
        if (signInError) {
          setError(signInError.error);
          setLoading(false);
          return;
        }
        if (data) {
          router.push("/app");
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen overflow-hidden bg-[#0a0a0a] p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-blue-950/20 to-purple-950/30" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl transition-all hover:bg-black/60 hover:border-white/20"
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium text-white">Back</span>
      </Link>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphic Card */}
        <div className="relative rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/50 via-blue-500/50 to-purple-500/50 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
          
          <div className="relative">
            {/* Logo & Title */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 opacity-75 blur-lg" />
                </div>
                <span className="text-3xl font-bold text-white">Flowspace</span>
              </div>
              
              <h1 className="mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                {simpleMode ? "Welcome!" : isSignUp ? "Join Us" : "Welcome Back"}
              </h1>
              <p className="text-sm text-gray-400">
                {simpleMode ? "Enter your email to get started" : isSignUp ? "Create your account in seconds" : "Sign in to your workspace"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="group">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-gray-500 backdrop-blur-xl transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              {!simpleMode && (
                <div className="group">
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-gray-500 backdrop-blur-xl transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                  {isSignUp && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="animate-shake rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/50 transition-all hover:shadow-cyan-500/75 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {simpleMode ? "Continue" : isSignUp ? "Create Account" : "Sign In"}
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider with Google Sign In */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black/40 px-4 text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium text-white">Sign in with Google</span>
              </button>
            </div>

            {/* Toggle Options */}
            <div className="space-y-3 text-center">
              {simpleMode && (
                <button
                  type="button"
                  onClick={() => {
                    setSimpleMode(false);
                    setError("");
                  }}
                  className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                  disabled={loading}
                >
                  Use password instead
                </button>
              )}

              {!simpleMode && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                    }}
                    className="block w-full text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    disabled={loading}
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimpleMode(true);
                      setIsSignUp(false);
                      setError("");
                    }}
                    className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                    disabled={loading}
                  >
                    Use email only (no password)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <Link href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
