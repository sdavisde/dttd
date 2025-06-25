"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
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

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("roles").select("*");

        if (error) {
          setError(error.message);
        } else {
          setRoles(data || []);
          setFilteredRoles(data || []);
        }
      } catch (err) {
        setError("Failed to fetch roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

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
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("roles")
        .update({ permissions })
        .eq("id", roleId);

      if (error) {
        console.error("Error updating role:", error);
        return;
      }

      // Update local state
      setRoles(
        roles.map((role) =>
          role.id === roleId ? { ...role, permissions } : role
        )
      );
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleModalExited = () => setSelectedRole(null);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Roles & Permissions
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Roles & Permissions
        </Typography>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Roles & Permissions
      </Typography>

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
      />
    </Box>
  );
}
