import { useQuery } from "@tanstack/react-query";
import { USER_ROLE_QUERY_KEY } from "../lib/query-keys";
import { supabase } from "../lib/supabase";

export type UserRole = "super-user" | "none";

export const useUserRole = () => {
  const query = useQuery({
    queryKey: USER_ROLE_QUERY_KEY,
    queryFn: async () => {
      const resp = await supabase.functions.invoke<{ userRole: UserRole }>(
        "get-user-role",
      );

      if (!resp.data) {
        throw new Error("Nie udało się pobrać roli użytkownika");
      }

      return resp.data.userRole;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return query;
};
