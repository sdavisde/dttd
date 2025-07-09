"use client";

import { useState, useEffect } from "react";
import { UserWithRole, assignUserRole, removeUserRole } from "@/actions/users";
import { Tables } from "@/database.types";
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
  Person as PersonIcon,
} from "@mui/icons-material";
import { UserRoleModal } from "./UserRoleModal";
import { isErr } from "@/lib/results";

interface UsersProps {
  initialUsers: UserWithRole[];
  roles: Tables<'roles'>[];
  error?: string;
}

export default function Users({ initialUsers, roles, error }: UsersProps) {
  const [users, setUsers] = useState<UserWithRole[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Use prop error or local error
  const displayError = error || localError;

  // Filter users based on search term
  useEffect(() => {
    const filtered = searchTerm != ""? users.filter((user) => {
      // const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = user.role?.label.toLowerCase().includes(searchTerm.toLowerCase());
      return roleMatch;
    }) : users;

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleUserClick = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateUserRole = async (userId: string, roleId: string | null) => {
    setLoading(true);
    setLocalError(null);

    try {
      let result;
      if (roleId) {
        result = await assignUserRole(userId, roleId);
      } else {
        result = await removeUserRole(userId);
      }

      if (isErr(result)) {
        throw new Error(result.error.message);
      }

      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          const newRole = roleId ? roles.find(r => r.id === roleId) || null : null;
          return { ...user, role: newRole };
        }
        return user;
      }));

    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err; // Re-throw to let modal handle it
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLocalError(null);
  };

  const handleModalExited = () => {
    setSelectedUser(null);
    setLocalError(null);
  };

  if (displayError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          User Management
        </Typography>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Error: {displayError}
          </Typography>
          {displayError.includes('SUPABASE_SERVICE_ROLE_KEY') && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              To use the user management feature, you need to add your Supabase service role key to your environment variables:
              <br />
              <code>SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here</code>
              <br />
              You can find this key in your Supabase dashboard under Settings → API.
            </Typography>
          )}
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
          placeholder="Search users by email or role..."
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

      {/* Users List */}
      <Paper elevation={1}>
        {filteredUsers.length > 0 ? (
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
                      {user.role ? (
                        <Chip
                          label={user.role.label}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          label="No role"
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                      <ChevronRightIcon color="action" />
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon color="action" />
                        <Typography variant="h6" component="div">
                          {"sample@gmail.com"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        User ID: {user.id.slice(0, 8)}...
                      </Typography>
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
        roles={roles}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExited={handleModalExited}
        onUpdate={handleUpdateUserRole}
      />
    </Box>
  );
}