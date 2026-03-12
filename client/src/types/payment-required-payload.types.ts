import type { IEvvmSchema } from "./evvm-schema.types";

export interface IPaymentRequiredPayload {
  offers: [IEvvmSchema, ...any];
}
