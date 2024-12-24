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

export const getSupabaseServiceClient = () => {
  return createClient<Database>(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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

// TODO: probably a DB enum would be better for this
export type UserRole = "super-user" | "none";

export const getUserRole = async (
  supabaseAdmin: SupabaseClient,
  user: User,
): Promise<UserRole> => {
  if (!user.email) {
    return "none";
  }

  const { data } = await supabaseAdmin.from("user_roles").select("user_role")
    .eq("user_email", user.email).single();

  return (data?.user_role ?? "none") as UserRole;
};

export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

export type StoryEntity = Tables<"stories">;
