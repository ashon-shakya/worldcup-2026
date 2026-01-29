import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnAdmin) {
                // console.log("Middleware Auth User:", auth?.user);
                if (isLoggedIn && (auth?.user as any).role === 'ADMIN') return true;
                return false; // Redirect unauthenticated or non-admin users
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect logged-in users away from auth pages to dashboard
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id?.toString();
                token.role = (user as any).role;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
