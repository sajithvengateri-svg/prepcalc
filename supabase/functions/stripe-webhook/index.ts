import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { supabase_user_id, pack_id, credits } = paymentIntent.metadata;

    if (!supabase_user_id || !credits) {
      console.error("Missing metadata on PaymentIntent", paymentIntent.id);
      return new Response("Missing metadata", { status: 400 });
    }

    const creditsToAdd = parseInt(credits, 10);

    // Use service role to update credits
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Add credits to profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_credits")
      .eq("id", supabase_user_id)
      .single();

    const currentCredits = profile?.avatar_credits ?? 0;

    await supabase
      .from("profiles")
      .update({ avatar_credits: currentCredits + creditsToAdd })
      .eq("id", supabase_user_id);

    // Record purchase
    await supabase.from("anime_purchases").insert({
      user_id: supabase_user_id,
      style: pack_id,
      receipt_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: "completed",
    });

    console.log(`Added ${creditsToAdd} credits to user ${supabase_user_id}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
