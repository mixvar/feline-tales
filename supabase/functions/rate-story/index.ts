import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/headers.ts";
import { getSupabaseClient } from "../_shared/supabase.ts";

// We don't need to check user_id here because Supabase RLS policies ensure that:
// 1. Only authenticated users can update stories
// 2. Users can only update their own stories

console.log("rate-story function is running");

type RequestPayload = {
  storyId: string;
  rating: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { storyId, rating } = (await req.json()) as RequestPayload;

    if (!validateRating(rating)) {
      return new Response("Rating must be an integer between 1 and 5", {
        headers: corsHeaders,
        status: 400,
      });
    }

    console.log("updating story rating...", { storyId, rating });

    const { error } = await supabase
      .from("stories")
      .update({ user_rating: rating })
      .eq("id", storyId);

    if (error) {
      throw error;
    }

    console.log("story rating updated successfully!");

    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("An error occurred while rating the story.", {
      headers: corsHeaders,
      status: 500,
    });
  }
});

const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};
