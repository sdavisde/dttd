"use client";

import { useState, useMemo } from "react";
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
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Role, RolesModal } from "./RolesModal";
import { useRoles } from "../hooks/useRoles";

export default function Roles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: roles = [], isLoading, isError, error } = useRoles();

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matches = role.label
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matches;
    });
  }, [searchTerm, roles]);

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => setIsModalOpen(false);
  const handleModalExited = () => setSelectedRole(null);

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Roles & Permissions
        </Typography>
        <Alert severity="error">
          Error: {error instanceof Error ? error.message : "Failed to load roles"}
        </Alert>
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
          disabled={isLoading}
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
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading roles...
            </Typography>
          </Box>
        ) : filteredRoles.length > 0 ? (
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
      <RolesModal
        role={selectedRole}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
      />
    </Box>
  );
}
