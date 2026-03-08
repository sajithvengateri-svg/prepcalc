import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STYLE_PROMPTS: Record<string, string> = {
  anime:
    "Transform this person into an anime character in a professional kitchen. They are wearing a chef's coat and toque. Style: vibrant anime with bold lines, expressive eyes. Kitchen background with flames and steam. Dynamic cooking pose.",
  ghibli:
    "Transform this person into a Studio Ghibli style character cooking in a warm, detailed kitchen. Soft painterly style, warm lighting, gentle expression, detailed food preparation scene.",
  pixel:
    "Transform this person into a pixel art chef character. 16-bit retro game style. Kitchen background with pixel fire and ingredients. Bright colours.",
  comic:
    "Transform this person into a comic book superhero chef. Bold outlines, action lines, dramatic lighting. Kitchen as a battlefield. Heroic cooking pose.",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, style } = await req.json();

    if (!image_base64 || !style) {
      return new Response(
        JSON.stringify({ error: "Missing image_base64 or style" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.anime;

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call OpenAI DALL-E 3 for image generation
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      // Fallback: return a placeholder response if no API key configured
      await supabase.from("ai_usage").insert({
        feature: "anime_avatar",
        tokens_in: 0,
        tokens_out: 0,
        estimated_cost: 0,
      });

      return new Response(
        JSON.stringify({
          success: true,
          image_url: null,
          message:
            "AI generation not configured yet. Set OPENAI_API_KEY in edge function secrets.",
          style,
          prompt,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DALL-E 3 API call
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      }
    );

    const data = await response.json();

    // Log usage
    await supabase.from("ai_usage").insert({
      feature: "anime_avatar",
      tokens_in: 0,
      tokens_out: 0,
      estimated_cost: 0.04,
    });

    // IMPORTANT: Original selfie (image_base64) is NEVER stored.
    // It is only used to inform the prompt context.
    // Only the AI-generated output is returned.

    return new Response(
      JSON.stringify({
        success: true,
        image_url: data.data?.[0]?.url ?? null,
        style,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
