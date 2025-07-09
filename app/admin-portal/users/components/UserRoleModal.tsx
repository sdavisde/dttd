"use client";

import { useState, useEffect } from "react";
import { Tables } from "@/database.types";
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

interface UserRoleModalProps {
  user: UserWithRole | null;
  roles: Tables<'roles'>[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, roleId: string | null) => Promise<void>;
  onExited?: () => void;
}

export function UserRoleModal({
  user,
  roles,
  isOpen,
  onClose,
  onUpdate,
  onExited,
}: UserRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selected role when user changes
  useEffect(() => {
    setSelectedRoleId(user?.role?.id ?? "No role");
    setError(null);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const newRole = selectedRoleId === "No role" ? "" : selectedRoleId;
      await onUpdate(user.id, newRole);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setLoading(false);
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
            User Email
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {'sample@gmail.com'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Role</InputLabel>
          <Select
            value={selectedRoleId || ""}
            onChange={(e) => setSelectedRoleId(e.target.value || null)}
            label="Select Role"
            disabled={loading}
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || selectedRoleId === (user?.role?.id || null)}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Updating..." : "Update Role"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}