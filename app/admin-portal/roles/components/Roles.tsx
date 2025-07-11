"use client";

import { useState, useEffect } from "react";
import { updateRolePermissions } from "@/actions/roles";
import { isErr } from "@/lib/results";
import {
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Alert,
  InputAdornment,
  Paper,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Role, RoleModal } from "./RolesModal";

interface RolesProps {
  initialRoles: Role[];
  error?: string;
}

export default function Roles({ initialRoles, error: initialError }: RolesProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  // Update filtered roles when roles or search term changes
  useEffect(() => {
    setRoles(initialRoles);
    setFilteredRoles(initialRoles);
  }, [initialRoles]);

  // Filter roles based on search term
  useEffect(() => {
    const filtered = roles.filter((role) => {
      const matches = role.label
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matches;
    });

    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleUpdateRole = async (roleId: string, permissions: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateRolePermissions(roleId, permissions);
      
      if (isErr(result)) {
        setError(result.error.message);
        return;
      }

      // Update local state on success
      setRoles(
        roles.map((role) =>
          role.id === roleId ? { ...role, permissions } : role
        )
      );
    } catch (err) {
      setError("Failed to update role permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleModalExited = () => setSelectedRole(null);

  if (initialError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Roles & Permissions
        </Typography>
        <Alert severity="error">Error: {initialError}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Roles & Permissions
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          size="medium"
        />
      </Box>

      {/* Role List */}
      <Paper elevation={1}>
        {filteredRoles.length > 0 ? (
          <List sx={{ paddingY: 0 }}>
            {filteredRoles.map((role, index) => (
              <Box key={role.id}>
                <ListItem
                  component="button"
                  onClick={() => handleRoleClick(role)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                  secondaryAction={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {role.permissions
                        ?.slice(0, 3)
                        .map((permission, permIndex) => (
                          <Chip
                            key={permIndex}
                            label={permission}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      {role.permissions && role.permissions.length > 3 && (
                        <Typography variant="body2" color="text.secondary">
                          +{role.permissions.length - 3} more
                        </Typography>
                      )}
                      <ChevronRightIcon color="action" />
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {role.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {role.permissions?.length || 0} permission
                        {role.permissions?.length !== 1 ? "s" : ""}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < filteredRoles.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {searchTerm
                ? "No roles found matching your search."
                : "No roles found in the database."}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Role Modal */}
      <RoleModal
        role={selectedRole}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
        onUpdate={handleUpdateRole}
        loading={loading}
      />
    </Box>
  );
}
