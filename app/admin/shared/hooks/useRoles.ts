"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, updateRolePermissions } from "@/actions/roles";
import { isErr } from "@/lib/results";

const ROLES_QUERY_KEY = "roles";

export function useRoles() {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: async () => {
      const result = await getRoles();
      if (isErr(result)) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const result = await updateRolePermissions(roleId, permissions);
      if (isErr(result)) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (_, { roleId, permissions }) => {
      // Update the cached roles data
      queryClient.setQueryData([ROLES_QUERY_KEY], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((role: any) =>
          role.id === roleId ? { ...role, permissions } : role
        );
      });
    },
  });
}