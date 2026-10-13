import crypto from "crypto";

export interface EasyPaisaPaymentRequest {
  orderId: string;
  amount: number;
  mobileNumber?: string;
  email?: string;
  paymentMethod: "easypaisa_wallet" | "easypaisa_qr" | "cod";
}

export const EASYPAISA_CONFIG = {
  storeId: process.env.EASYPAISA_STORE_ID || "12345",
  hashKey: process.env.EASYPAISA_HASH_KEY || "demo_easypaisa_secret_key",
  accountNumber: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT || "03238048183",
  accountTitle: process.env.NEXT_PUBLIC_EASYPAISA_TITLE || "Safiullah",
  isSandbox: process.env.EASYPAISA_SANDBOX !== "false",
};

/**
 * Generate Secure Hash for EasyPaisa API transactions
 */
export function generateEasyPaisaHash(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  const hashString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  return crypto
    .createHmac("sha256", EASYPAISA_CONFIG.hashKey)
    .update(hashString)
    .digest("hex");
}

/**
 * Verify EasyPaisa Callback response
 */
export function verifyEasyPaisaCallback(responseParams: Record<string, string>, receivedHash: string): boolean {
  try {
    const calculated = generateEasyPaisaHash(responseParams);
    return calculated === receivedHash;
  } catch (error) {
    console.error("EasyPaisa callback verification error:", error);
    return false;
  }
}
