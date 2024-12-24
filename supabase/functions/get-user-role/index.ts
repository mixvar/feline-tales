import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getSupabaseServiceClient,
  getSupabaseUser,
  getUserRole,
  UserRole,
} from "../_shared/supabase.ts";
import { contentTypeHeaders, corsHeaders } from "../_shared/headers.ts";

console.log("get-user-role function is running");

type ResponsePayload = {
  userRole: UserRole;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = getSupabaseServiceClient();
    const user = await getSupabaseUser(supabaseAdmin, req);
    const userRole = await getUserRole(supabaseAdmin, user);

    const response: ResponsePayload = {
      userRole,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...contentTypeHeaders.json, ...corsHeaders } },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      "An error occurred while resolving user role.",
      { headers: { ...corsHeaders }, status: 500 },
    );
  }
});
