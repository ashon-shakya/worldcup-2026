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
                if (isLoggedIn) {
                    const role = (auth?.user as any).role;
                    if (role === 'ADMIN') return true;
                    if (role === 'MODERATOR') {
                        if (nextUrl.pathname.startsWith('/admin/set-score')) {
                            return true;
                        }
                        return Response.redirect(new URL('/admin/set-score', nextUrl));
                    }
                }
                return false; // Redirect unauthenticated or non-admin/non-moderator users
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
                token.picture = user.image;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
                if (session.image) {
                    token.picture = session.image;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                session.user.image = token.picture as string | null | undefined;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
