import { NextResponse } from "next/server";
import { verifyEasyPaisaCallback } from "@/lib/easypaisa";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, transactionId, responseCode, hash, ...rest } = body;

    // Verify hash if in live environment
    if (hash && process.env.EASYPAISA_HASH_KEY) {
      const isValid = verifyEasyPaisaCallback({ orderId, transactionId, responseCode, ...rest }, hash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid hash verification" }, { status: 400 });
      }
    }

    // Response code "0000" signifies success in EasyPaisa merchant API
    if (responseCode === "0000" && orderId) {
      if (isSupabaseConfigured()) {
        const supabaseAdmin = getServiceSupabase();
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            fulfillment_status: "processing",
            easypaisa_transaction_id: transactionId,
            updated_at: new Date().toISOString(),
          })
          .eq("order_number", orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("EasyPaisa Webhook error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
