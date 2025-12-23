import { createClient } from "@supabase/supabase-js";
import { Database, Tables } from "./supabase-types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY,
);

export type StoryEntity = Tables<"stories">;
