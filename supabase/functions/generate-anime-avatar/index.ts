import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

// --- Style-based provider routing ---

interface StyleConfig {
  model: string;
  quality: string;
  input_fidelity: string;
  estimated_cost: number;
}

const STYLE_CONFIG: Record<string, StyleConfig> = {
  anime: {
    model: "gpt-image-1.5",
    quality: "medium",
    input_fidelity: "high",
    estimated_cost: 0.07,
  },
  ghibli: {
    model: "gpt-image-1.5",
    quality: "high", // Hero style — worth the extra cost + time
    input_fidelity: "high",
    estimated_cost: 0.12,
  },
  pixel: {
    model: "gpt-image-1.5",
    quality: "medium",
    input_fidelity: "high",
    estimated_cost: 0.07,
  },
  comic: {
    model: "gpt-image-1.5",
    quality: "medium",
    input_fidelity: "high",
    estimated_cost: 0.07,
  },
};

// --- Prompts crafted for face preservation + viral quality ---

const STYLE_PROMPTS: Record<string, string> = {
  anime:
    "Transform into vibrant anime style. Dress the person in a crisp white double-breasted chef jacket with buttons and a tall white chef's toque hat. Keep my facial features EXACTLY as they appear — same eyes, nose, mouth, face shape, skin tone, hair. Do not alter my face. Bold anime lines. Transform the real background into anime. Keep all visible objects.",
  ghibli:
    "Transform into Studio Ghibli style. Dress the person in a classic white chef's coat and tall white toque hat. Keep my facial features EXACTLY as they appear — same eyes, nose, mouth, face shape, skin tone, hair. Do not smooth or alter face. Soft watercolor textures, hand-painted look, diffused golden hour warmth. Earth-tones with sky blue accents. Real background becomes a Ghibli kitchen scene with steam, copper pots, warm lighting.",
  pixel:
    "Transform into 16-bit pixel art. Dress the person in a white chef jacket and tall white toque hat. Preserve face shape, skin tone, hair. Real background as pixel art kitchen. Retro game aesthetic.",
  comic:
    "Transform into bold comic book art with ink outlines and halftone. Dress the person in a white chef jacket and tall toque hat. Keep my facial features EXACTLY. Real background in comic style. Dramatic shadows.",
};

const MODE_PROMPTS: Record<string, string> = {
  standard: "",
  yes_chef:
    "Split-screen. Left: original photo unedited. Right: same photo as heroic anime — wearing a crisp white chef jacket and tall toque hat, speed lines, dramatic lighting. Identical features both sides. White divider. Left: 'Reality', Right: 'The Anime'.",
  kitchen_pass:
    "Anime chef ID card. Person wearing white chef jacket and toque hat. Dark border, rounded corners. Preserve exact features. Fun title: [random from list]. 'VERIFIED CHEF' in gold. Real kitchen stylised. 3:4.",
  manga_menu:
    "Manga kitchen brigade poster. Everyone in white chef jackets and toque hats. Each person with EXACT features preserved. Action poses. Real kitchen in manga style. 'THE BRIGADE' title.",
};

function getSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Convert base64 JPEG/PNG to a PNG Blob for the edit API.
 * Strips any data-URI prefix if present.
 */
function base64ToBlob(b64: string, mimeType = "image/png"): Blob {
  const raw = b64.replace(/^data:image\/\w+;base64,/, "");
  const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

/**
 * Call OpenAI image edit endpoint with a specific model.
 * Returns the base64-encoded result or throws on error.
 */
async function callImageEdit(
  openaiKey: string,
  selfieBlob: Blob,
  prompt: string,
  model: string,
  quality: string,
  inputFidelity: string,
): Promise<string> {
  const form = new FormData();
  form.append("model", model);
  form.append("image[]", selfieBlob, "selfie.png");
  form.append("prompt", prompt);
  form.append("input_fidelity", inputFidelity);
  form.append("quality", quality);
  form.append("size", "1024x1024");
  form.append("output_format", "jpeg");
  form.append("n", "1");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}` },
    body: form,
  });

  const responseData = await response.json();

  if (responseData.error) {
    throw new Error(
      responseData.error.message || JSON.stringify(responseData.error)
    );
  }

  const data = responseData.data || [];
  if (data.length > 0 && data[0].b64_json) {
    return data[0].b64_json;
  }

  throw new Error("No image generated in response");
}

// Background: generate image and update the job row
async function processJob(
  jobId: string,
  imageBase64: string,
  style: string,
  avatarMode: string = "standard"
) {
  const supabase = getSupabase();
  const openaiKey = Deno.env.get("OPENAI_API_KEY") ?? "";

  try {
    await supabase
      .from("anime_jobs")
      .update({ status: "generating" })
      .eq("id", jobId);

    const config = STYLE_CONFIG[style] || STYLE_CONFIG.anime;
    const modeOverride = MODE_PROMPTS[avatarMode] || "";
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.anime;
    const prompt = modeOverride
      ? `${modeOverride}\n\nStyle: ${stylePrompt}`
      : stylePrompt;

    const selfieBlob = base64ToBlob(imageBase64);

    // Fallback chain: gpt-image-1.5 → gpt-image-1
    let resultBase64: string;
    try {
      resultBase64 = await callImageEdit(
        openaiKey,
        selfieBlob,
        prompt,
        config.model,
        config.quality,
        config.input_fidelity,
      );
    } catch (primaryErr) {
      console.error(`Primary model failed (${config.model}):`, primaryErr);
      // Fallback to gpt-image-1 (slower but reliable)
      resultBase64 = await callImageEdit(
        openaiKey,
        selfieBlob,
        prompt,
        "gpt-image-1",
        "low",
        "high",
      );
    }

    // Upload to Supabase Storage
    let imageUrl: string | null = null;
    try {
      const resultBytes = Uint8Array.from(atob(resultBase64), (c) =>
        c.charCodeAt(0)
      );
      const fileName = `avatars/${crypto.randomUUID()}.jpg`;

      await supabase.storage.createBucket("anime-avatars", {
        public: true,
        fileSizeLimit: 5242880,
      });

      const { error: uploadError } = await supabase.storage
        .from("anime-avatars")
        .upload(fileName, resultBytes, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("anime-avatars")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    } catch {
      // Storage upload failed
    }

    if (!imageUrl) {
      await supabase
        .from("anime_jobs")
        .update({
          status: "failed",
          error: "Failed to store generated image",
        })
        .eq("id", jobId);
      return;
    }

    await supabase
      .from("anime_jobs")
      .update({
        status: "completed",
        image_url: imageUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Log usage
    await supabase.from("ai_usage").insert({
      feature: "anime_avatar",
      tokens_in: 0,
      tokens_out: 0,
      estimated_cost: config.estimated_cost,
    });
  } catch (err) {
    await supabase
      .from("anime_jobs")
      .update({
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      })
      .eq("id", jobId);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode } = body;

    const supabase = getSupabase();

    // ─── CHECK MODE: poll job status ───
    if (mode === "check") {
      const { job_id } = body;
      if (!job_id) {
        return new Response(
          JSON.stringify({ error: "Missing job_id" }),
          { status: 400, headers: jsonHeaders }
        );
      }

      const { data: job, error } = await supabase
        .from("anime_jobs")
        .select("status, image_url, error")
        .eq("id", job_id)
        .single();

      if (error || !job) {
        return new Response(
          JSON.stringify({ error: "Job not found" }),
          { status: 404, headers: jsonHeaders }
        );
      }

      return new Response(JSON.stringify(job), { headers: jsonHeaders });
    }

    // ─── START MODE (default): create job + kick off background processing ───
    const { image_base64, style, avatar_mode } = body;

    if (!image_base64 || !style) {
      return new Response(
        JSON.stringify({ error: "Missing image_base64 or style" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured." }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // Create a job row
    const { data: job, error: insertError } = await supabase
      .from("anime_jobs")
      .insert({ status: "pending", style, mode: avatar_mode || "standard" })
      .select("id")
      .single();

    if (insertError || !job) {
      return new Response(
        JSON.stringify({
          error: `DB: ${insertError?.message || "Could not create job"}`,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // Kick off image edit in background — runs after response is sent
    // @ts-ignore: EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(
      processJob(job.id, image_base64, style, avatar_mode || "standard")
    );

    // Return job_id immediately (~1 second)
    return new Response(
      JSON.stringify({ job_id: job.id, status: "pending" }),
      { headers: jsonHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
