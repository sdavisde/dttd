'use client'

import { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Tables } from '@/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'

type ContactInformation = Tables<'contact_information'>

interface ContactInformationTableProps {
  contactInformation: ContactInformation[]
}

interface ContactFormData {
  label: string
  email_address: string
}

export function ContactInformationTable({
  contactInformation,
}: ContactInformationTableProps) {
  const [contacts, setContacts] =
    useState<ContactInformation[]>(contactInformation)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] =
    useState<ContactInformation | null>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    label: '',
    email_address: '',
  })
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
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

    const { error } = await supabase
      .from('contact_information')
      .delete()
      .eq('id', id)

    if (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting contact',
        severity: 'error',
      })
      return
    }

    setContacts(contacts.filter((contact) => contact.id !== id))
    setSnackbar({
      open: true,
      message: 'Contact deleted successfully',
      severity: 'success',
    })
  }

  const handleSubmit = async () => {
    if (!formData.label.trim() || !formData.email_address.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error',
      })
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
        setSnackbar({
          open: true,
          message: 'Error updating contact',
          severity: 'error',
        })
        return
      }

      setContacts(
        contacts.map((contact) =>
          contact.id === editingContact.id
            ? {
                ...contact,
                label: formData.label.trim(),
                email_address: formData.email_address.trim(),
              }
            : contact
        )
      )
      setSnackbar({
        open: true,
        message: 'Contact updated successfully',
        severity: 'success',
      })
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
        setSnackbar({
          open: true,
          message: 'Error creating contact',
          severity: 'error',
        })
        return
      }

      setContacts([...contacts, data])
      setSnackbar({
        open: true,
        message: 'Contact created successfully',
        severity: 'success',
      })
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Label</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, index) => (
            <TableRow
              key={contact.id}
              className={index % 2 === 0 ? '' : 'bg-muted/50'}
            >
              <TableCell className="font-bold">{contact.label}</TableCell>
              <TableCell>{contact.email_address}</TableCell>
              <TableCell>
                {new Date(contact.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(contact)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {contacts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <p className="text-muted-foreground">
                  No contact information found. Click &ldquo;Add Contact&rdquo;
                  to create one.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <label htmlFor="label" className="text-sm font-medium">
                Label
              </label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="e.g., General Inquiries, Support"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email_address}
                onChange={(e) =>
                  setFormData({ ...formData, email_address: e.target.value })
                }
                placeholder="contact@example.com"
                required
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingContact ? 'Update' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert
            variant={snackbar.severity === 'error' ? 'destructive' : 'default'}
          >
            <AlertDescription>{snackbar.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </>
  )
}
