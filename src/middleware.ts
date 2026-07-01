import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  // Prerendered (static) routes have no real request headers and must not hit
  // the auth DB during build. Only resolve a session on on-demand routes.
  if (context.isPrerendered) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }
  const session = await auth.api.getSession({ headers: context.request.headers });
  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;
  return next();
});
