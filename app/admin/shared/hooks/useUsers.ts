"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsersWithRoles, assignUserRole, removeUserRole } from "@/actions/users";
import { isErr } from "@/lib/results";

const USERS_QUERY_KEY = "users";

export function useUsersWithRoles() {
  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: async () => {
      const result = await getUsersWithRoles();
      if (isErr(result)) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const result = await assignUserRole(userId, roleId);
      if (isErr(result)) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useRemoveUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await removeUserRole(userId);
      if (isErr(result)) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}