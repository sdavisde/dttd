"use client";

import { useState, useMemo } from "react";
import { UserWithRole } from "@/actions/users";
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
  Person as PersonIcon,
} from "@mui/icons-material";
import { UserRoleModal } from "./UserRoleModal";
import { useUsers } from "../hooks/useUsers";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users = [], isLoading, isError, error } = useUsers();

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const firstNameMatch = user.first_name?.toLowerCase().includes(searchLower);
      const lastNameMatch = user.last_name?.toLowerCase().includes(searchLower);
      const roleMatch = user.role?.label.toLowerCase().includes(searchLower);
      return firstNameMatch || lastNameMatch || roleMatch;
    });
  }, [searchTerm, users]);

  const handleUserClick = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalExited = () => {
    setSelectedUser(null);
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          User Management
        </Typography>
        <Alert severity="error">
          Error: {error instanceof Error ? error.message : "Failed to load data"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        User Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage user roles and permissions. Click on a user to assign or change their role.
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name or role..."
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

      {/* Users List */}
      <Paper elevation={1}>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading users...
            </Typography>
          </Box>
        ) : filteredUsers.length > 0 ? (
          <List sx={{ paddingY: 0 }}>
            {filteredUsers.map((user, index) => (
              <Box key={user.id}>
                <ListItem
                  component="button"
                  onClick={() => handleUserClick(user)}
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
                      {user.role &&
                        <Chip
                          label={user.role.label}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      }
                      <ChevronRightIcon color="action" />
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="h6" component="div">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'Unknown User'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        {user.gender && (
                          <Typography variant="body2" color="text.secondary">
                            Gender: {user.gender}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          User ID: {user.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredUsers.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {searchTerm
                ? "No users found matching your search."
                : "No users found in the system."}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* User Role Modal */}
      <UserRoleModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
      />
    </Box>
  );
}