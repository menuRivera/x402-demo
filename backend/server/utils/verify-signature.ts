import {
  Core,
  HexString,
  IPayData,
  ISerializableSignedAction,
} from "@evvm/evvm-js";
import { recoverMessageAddress } from "viem";

export const verifySignature = async (
  signedAction: ISerializableSignedAction<IPayData>,
): Promise<boolean> => {
  const config = useRuntimeConfig();
  const signer = await useSigner();

  // create instance of evvm core contract
  const core = new Core({
    chainId: signedAction.chainId,
    address: config.evvmCoreAddress as HexString,
    signer,
  });

  // replicate signed message
  const evvmId = await core.getEvvmID();
  const hashPayload = core.buildHashPayload(signedAction.functionName, {
    to_address: signedAction.data.to_address,
    to_identity: signedAction.data.to_identity,
    token: signedAction.data.token,
    amount: signedAction.data.amount,
    priorityFee: signedAction.data.priorityFee,
  });

  const message = core.buildMessageToSign(
    evvmId,
    hashPayload,
    signedAction.data.senderExecutor,
    signedAction.data.nonce,
    signedAction.data.isAsyncExec,
  );

  // recover signer of the message
  const address = await recoverMessageAddress({
    message,
    signature: signedAction.data.signature as HexString,
  });

  if (address !== signedAction.data.from) {
    console.error("Couldn't recover address from signature");
    return false;
  }

  // verify nonces are ok
  if (signedAction.data.isAsyncExec) {
    // async execution, assert nonce hasn't been used before
    const used = await core.isValidAsyncNonce(signedAction.data.nonce);
    if (used) {
      console.error("Invalid async nonce");
      return false;
    }
  } else {
    const nextExpectedNonce = await core.getSyncNonce();
    if (nextExpectedNonce.toString() != signedAction.data.nonce.toString()) {
      console.error("Invalid sync nonce");
      return false;
    }
  }

  // assert balances
  const balance = await core.getBalance(
    signedAction.data.from,
    signedAction.data.token,
  );
  if (balance <= signedAction.data.amount) return false;

  return true;
};
