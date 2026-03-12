import type { IPayData, ISerializableSignedAction } from "@evvm/evvm-js";
import type { IEvvmSchema } from "./evvm-schema.types";

export interface IPaymentPayload {
  x402Version: 2;
  resource?: {
    url: string;
    description: string;
    mimeType: string;
  };
  accepted: IEvvmSchema;
  // crucial, this includes everything needed to execute a pay transaction
  payload: ISerializableSignedAction<IPayData>;
}

// type guard
export function isPaymentPayload(obj: any): obj is IPaymentPayload {
  return (
    obj !== null &&
    typeof obj === "object" &&
    obj.x402Version === 2 &&
    typeof obj.payload === "object" &&
    obj.payload !== null &&
    typeof obj.accepted === "object" &&
    obj.accepted.scheme === "evvm" &&
    typeof obj.payload.payload === "object" &&
    (obj.resource ? typeof obj.resource.url === "string" : true) &&
    "accepted" in obj
  );
}
