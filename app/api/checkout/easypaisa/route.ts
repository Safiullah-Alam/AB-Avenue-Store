import { NextResponse } from "next/server";
import { EASYPAISA_CONFIG, generateEasyPaisaHash } from "@/lib/easypaisa";

export async function POST(req: Request) {
  try {
    const { orderId, amount, mobileNumber } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const orderRef = orderId || `EP-${Date.now()}`;
    const params: Record<string, string> = {
      storeId: EASYPAISA_CONFIG.storeId,
      orderId: orderRef,
      transactionAmount: String(amount),
      mobileNum: mobileNumber || "",
    };

    const hash = generateEasyPaisaHash(params);

    return NextResponse.json({
      success: true,
      orderRef,
      amount,
      accountNumber: EASYPAISA_CONFIG.accountNumber,
      accountTitle: EASYPAISA_CONFIG.accountTitle,
      hash,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initialize payment";
    console.error("EasyPaisa Checkout Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
