import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Match /api/webhooks/clerk and any future webhook paths (glob `*` is not valid here).
  '/api/webhooks(.*)',
  // OAuth start + callback routes handle auth themselves via getDbUserOrNull().
  // They must be public so Clerk doesn't intercept the cross-origin callback redirect
  // that Twitter/LinkedIn sends back to our server after authorization.
  '/api/auth/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};