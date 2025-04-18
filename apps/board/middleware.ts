import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/api/problems/:path*",
    "/api/solutions/:path*",
    "/api/votes/:path*",
    "/api/admin/:path*",
    "/api/moderation/:path*",
    "/api/profile/:path*",
    "/api/webhooks/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/problems/new",
  ],
};