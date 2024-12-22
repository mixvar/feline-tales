import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { contentTypeHeaders, corsHeaders } from "../_shared/headers.ts";
import { getSupabaseClient } from "../_shared/supabase-client.ts";

console.log("Function 'hello-world' is running");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { name } = await req.json();
  const message = `Hello ${name}!`;

  const supabase = getSupabaseClient(req);

  const { data, error } = await supabase.from("test_cats").select("*");

  return new Response(
    JSON.stringify({ message, data, error }),
    { headers: { ...contentTypeHeaders.json, ...corsHeaders } },
  );
});
