import type { IExactEvvmSchema } from "./evvm-schema.types";

export interface IPaymentRequiredPayload {
  offers: [IExactEvvmSchema, ...any];
}
