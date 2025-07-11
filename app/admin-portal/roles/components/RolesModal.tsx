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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

export type Role = Database["public"]["Tables"]["roles"]["Row"];

interface RoleModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (roleId: string, permissions: string[]) => Promise<void>;
  onExited?: () => void;
  loading?: boolean;
}

export function RoleModal({
  role,
  isOpen,
  onClose,
  onUpdate,
  onExited,
  loading = false,
}: RoleModalProps) {
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions || []
  );
  const [newPermission, setNewPermission] = useState("");

  // Update permissions when role changes
  useEffect(() => {
    setPermissions(role?.permissions || []);
  }, [role]);

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

  const handleSave = async () => {
    if (!role) return;
    await onUpdate(role.id, permissions);
    onClose();
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
          />
          <Button
            variant="contained"
            onClick={handleAddPermission}
            startIcon={<AddIcon />}
            disabled={!newPermission.trim()}
          >
            Add
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
