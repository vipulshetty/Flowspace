import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// OAuth callback route for Google Sign-In
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const error = requestUrl.searchParams.get('error');
  const origin = requestUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/signin?error=${encodeURIComponent(error)}`);
  }

  if (token) {
    // Set the access token cookie
    const response = NextResponse.redirect(`${origin}/app`);
    response.cookies.set('access_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  }

  // If no token, redirect to signin
  return NextResponse.redirect(`${origin}/signin`);
}
