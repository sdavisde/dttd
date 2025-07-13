"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { UserWithRole } from "@/actions/users";
import { useRoles } from "../../shared/hooks/useRoles";
import { useAssignUserRole, useRemoveUserRole } from "../../shared/hooks/useUsers";

interface UserRoleModalProps {
  user: UserWithRole | null;
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

export function UserRoleModal({
  user,
  isOpen,
  onClose,
  onExited,
}: UserRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { data: roles = [] } = useRoles();
  const assignUserRoleMutation = useAssignUserRole();
  const removeUserRoleMutation = useRemoveUserRole();

  // Update selected role when user changes
  useEffect(() => {
    setSelectedRoleId(user?.role?.id ?? "No role");
  }, [user]);

  // Reset mutation state when modal opens
  useEffect(() => {
    if (isOpen) {
      assignUserRoleMutation.reset();
      removeUserRoleMutation.reset();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (selectedRoleId === "No role") {
        await removeUserRoleMutation.mutateAsync({ userId: user.id });
      } else if (selectedRoleId) {
        await assignUserRoleMutation.mutateAsync({ userId: user.id, roleId: selectedRoleId });
      }
      onClose();
    } catch (err) {
      // Error is handled by the mutation hooks
    }
  };

  const isLoading = assignUserRoleMutation.isPending || removeUserRoleMutation.isPending;
  const error: any = assignUserRoleMutation.error || removeUserRoleMutation.error;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      slotProps={onExited ? { transition: { onExited } } : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Manage User Role
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          ×
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            User Information
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {user?.first_name || user?.last_name
              ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
              : 'Unknown User'
            }
          </Typography>
          {user?.gender && (
            <Typography variant="body2" color="text.secondary">
              Gender: {user.gender}
            </Typography>
          )}
        </Box>

        {error &&
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : "Failed to update user role"}
          </Alert>
        }

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Role</InputLabel>
          <Select
            value={selectedRoleId || ""}
            onChange={(e) => setSelectedRoleId(e.target.value || null)}
            label="Select Role"
            disabled={isLoading}
          >
            <MenuItem value="No role">
              <em>No role</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || selectedRoleId === (user?.role?.id || null)}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? "Updating..." : "Update Role"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}