'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material'
import { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { Tables } from '@/database.types'
import { createClient } from '@/lib/supabase/client'

type ContactInformation = Tables<'contact_information'>

interface ContactInformationTableProps {
  contactInformation: ContactInformation[]
}

interface ContactFormData {
  label: string
  email_address: string
}

export function ContactInformationTable({ contactInformation }: ContactInformationTableProps) {
  const [contacts, setContacts] = useState<ContactInformation[]>(contactInformation)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactInformation | null>(null)
  const [formData, setFormData] = useState<ContactFormData>({ label: '', email_address: '' })
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const supabase = createClient()

  const handleEdit = (contact: ContactInformation) => {
    setEditingContact(contact)
    setFormData({
      label: contact.label || '',
      email_address: contact.email_address || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return
    }

    const { error } = await supabase.from('contact_information').delete().eq('id', id)

    if (error) {
      setSnackbar({ open: true, message: 'Error deleting contact', severity: 'error' })
      return
    }

    setContacts(contacts.filter((contact) => contact.id !== id))
    setSnackbar({ open: true, message: 'Contact deleted successfully', severity: 'success' })
  }

  const handleSubmit = async () => {
    if (!formData.label.trim() || !formData.email_address.trim()) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' })
      return
    }

    if (editingContact) {
      // Update existing contact
      const { error } = await supabase
        .from('contact_information')
        .update({
          label: formData.label.trim(),
          email_address: formData.email_address.trim(),
        })
        .eq('id', editingContact.id)

      if (error) {
        setSnackbar({ open: true, message: 'Error updating contact', severity: 'error' })
        return
      }

      setContacts(
        contacts.map((contact) =>
          contact.id === editingContact.id
            ? { ...contact, label: formData.label.trim(), email_address: formData.email_address.trim() }
            : contact
        )
      )
      setSnackbar({ open: true, message: 'Contact updated successfully', severity: 'success' })
    } else {
      // Create new contact
      const { data, error } = await supabase
        .from('contact_information')
        .insert({
          label: formData.label.trim(),
          email_address: formData.email_address.trim(),
        } as any)
        .select()
        .single()

      if (error) {
        setSnackbar({ open: true, message: 'Error creating contact', severity: 'error' })
        return
      }

      setContacts([...contacts, data])
      setSnackbar({ open: true, message: 'Contact created successfully', severity: 'success' })
    }

    setIsDialogOpen(false)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingContact(null)
    setFormData({ label: '', email_address: '' })
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Label</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact, index) => (
              <TableRow
                key={contact.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 'bold' }}>{contact.label}</TableCell>
                <TableCell>{contact.email_address}</TableCell>
                <TableCell>{new Date(contact.created_at).toLocaleDateString()}</TableCell>
                <TableCell align='right'>
                  <IconButton
                    size='small'
                    onClick={() => handleEdit(contact)}
                    title='Edit'
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => handleDelete(contact.id)}
                    title='Delete'
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align='center'
                  sx={{ py: 4 }}
                >
                  <Typography color='text.secondary'>
                    No contact information found. Click "Add Contact" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label='Label'
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              margin='normal'
              required
              placeholder='e.g., General Inquiries, Support'
            />
            <TextField
              fullWidth
              label='Email Address'
              type='email'
              value={formData.email_address}
              onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
              margin='normal'
              required
              placeholder='contact@example.com'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
          >
            {editingContact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
