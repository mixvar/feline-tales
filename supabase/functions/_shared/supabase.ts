import { createClient, User } from "jsr:@supabase/supabase-js";
import { Database, Tables } from "./supabase-types.ts";

export const getSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get("Authorization");

  return createClient<Database>(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: { Authorization: authHeader ?? "" },
      },
    },
  );
};

export const getSupabaseUser = async (
  supabase: SupabaseClient,
  req: Request,
): Promise<User | null> => {
  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await supabase.auth.getUser(token);
  return data.user;
};

export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

export type StoryEntity = Tables<"stories">;
