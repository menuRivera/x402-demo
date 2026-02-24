// headers
// PAYMENT-REQUIRED
// PAYMENT-SIGNATURE
// PAYMENT-RESPONSE

import { settlePayment, verifyPayment } from "util/facilitator";
import {
  invalidPaymentResponse,
  paymentRequiredResponse,
} from "util/payment-responses";

export default defineEventHandler(async (event) => {
  // include only /protected route
  const url = event.node.req.url;

  const protectedRoute = url && url.startsWith("/protected");

  if (!protectedRoute) return;

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
