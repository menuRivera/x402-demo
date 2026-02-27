import { defineNitroConfig } from "nitropack/config";

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

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "latest",
  srcDir: "server",
  runtimeConfig: {
    receiver: process.env.RECEIVER_ACCOUNT!,
    evvmCoreAddress: process.env.EVVM_CORE_ADDRESS!,
    executorPrivateKey: process.env.EXECUTOR_PRIVATE_KEY!,
  },
  routeRules: {
    "*": {
      cors: true,
      headers: {
        "access-control-allow-credentials": "true",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "*",
        "access-control-allow-headers": "*",
      },
    },
  },
});
