// headers
// PAYMENT-REQUIRED
// PAYMENT-SIGNATURE
// PAYMENT-RESPONSE

export default defineEventHandler(async (event) => {
  // include only /protected route
  const url = event.node.req.url;

  const protectedRoute = url && url.startsWith("/protected");

  if (!protectedRoute) return;

  const method = event.method;
  if (method === "OPTIONS") return;

  // verify it has a valid payment attached
  const paymentSignature = event.headers.get("PAYMENT-SIGNATURE");
  if (!paymentSignature) return paymentRequiredResponse();

  const paymentPayload = await verifyPayment(paymentSignature);
  if (!paymentPayload)
    return invalidPaymentResponse("Couldn't verify signature");

  const txHash = await settlePayment(paymentPayload);
  if (!txHash) return invalidPaymentResponse("Settlement failed");

  return;
});
