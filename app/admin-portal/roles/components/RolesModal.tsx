"use client";

import { useState, useEffect } from "react";
import { Database } from "@/database.types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useUpdateRolePermissions } from "../hooks/useRoles";
import { logger } from "@/lib/logger";

export type Role = Database["public"]["Tables"]["roles"]["Row"];

interface RolesModal {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

export function RolesModal({
  role,
  isOpen,
  onClose,
  onExited,
}: RolesModal) {
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions || []
  );
  const [newPermission, setNewPermission] = useState("");

  const updateRolePermissions = useUpdateRolePermissions();

  // Update permissions when role changes
  useEffect(() => {
    setPermissions(role?.permissions || []);
  }, [role]);

  // Reset mutation state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      updateRolePermissions.reset();
    }
  }, [isOpen, updateRolePermissions]);

  const handleAddPermission = () => {
    if (newPermission.trim() && !permissions.includes(newPermission.trim())) {
      const updatedPermissions = [...permissions, newPermission.trim()];
      setPermissions(updatedPermissions);
      setNewPermission("");
    }
  };

  const handleRemovePermission = (permissionToRemove: string) => {
    setPermissions(permissions.filter((p) => p !== permissionToRemove));
  };

  const resetForm = () => setNewPermission("")

  const handleSave = async () => {
    if (!role) return;

    try {
      await updateRolePermissions.mutateAsync({
        roleId: role.id,
        permissions
      })
      onClose
    } catch (e) {
      logger.error(e)
    } finally {
      onClose()
      resetForm()
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      slotProps={onExited ? { transition: { onExited } } : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Edit Role: {role?.label}
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
        {updateRolePermissions.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateRolePermissions.error instanceof Error
              ? updateRolePermissions.error.message
              : "Failed to update role permissions"}
          </Alert>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Permissions
        </Typography>
        <Box sx={{ mb: 3 }}>
          {permissions.map((permission, index) => (
            <Chip
              key={index}
              label={permission}
              onDelete={() => handleRemovePermission(permission)}
              deleteIcon={<DeleteIcon />}
              disabled={updateRolePermissions.isPending}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            placeholder="Add new permission..."
            onKeyDown={(e) => e.key === "Enter" && handleAddPermission()}
            disabled={updateRolePermissions.isPending}
          />
          <Button
            variant="contained"
            onClick={handleAddPermission}
            startIcon={<AddIcon />}
            disabled={!newPermission.trim() || updateRolePermissions.isPending}
          >
            Add
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateRolePermissions.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={updateRolePermissions.isPending}
          startIcon={updateRolePermissions.isPending ? <CircularProgress size={16} /> : undefined}
        >
          {updateRolePermissions.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
