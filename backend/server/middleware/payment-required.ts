export default defineEventHandler(async (e) => {
  // include only /protected route
  const url = e.node.req.url;

  const protectedRoute = url && url.startsWith("/protected");

  if (!protectedRoute) return;

  // verify it has a valid payment attached
  // if true, return (passes it to the /protected route)
  // if false ask for a payment
});
