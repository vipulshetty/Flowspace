import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  // With JWT auth in cookies, we don't need to modify the session in middleware
  // Auth verification happens in protected routes and server components
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return response;
};
