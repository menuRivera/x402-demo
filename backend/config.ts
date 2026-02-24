import { HexString } from "@evvm/evvm-js";

const requiredEnvVars = [
  "RECEIVER_ACCOUNT",
  "EVVM_CORE_ADDRESS",
  "EXECUTOR_PRIVATE_KEY",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const config = {
  receiver: process.env.RECEIVER_ACCOUNT!,
  evvmCoreAddress: process.env.EVVM_CORE_ADDRESS! as HexString,
  executorPrivateKey: process.env.EXECUTOR_PRIVATE_KEY! as HexString,
};
