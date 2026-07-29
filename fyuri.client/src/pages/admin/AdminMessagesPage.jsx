import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Link,
} from '@mui/material';
import { Visibility, Delete, MarkEmailRead, MarkEmailUnread } from '@mui/icons-material';

function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/messages', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setRead = async (message, value) => {
    try {
      const response = await fetch(`/api/admin/messages/${message.id}/read?value=${value}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update message');
      const updated = await response.json();
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      if (selected?.id === updated.id) setSelected(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm(`Delete message from ${message.name}?`)) return;
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete message');
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      if (selected?.id === message.id) setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const openMessage = (message) => {
    setSelected(message);
    if (!message.isRead) {
      setRead(message, true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Customer Messages
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Message</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow
                key={message.id}
                hover
                sx={{ '& td': { fontWeight: message.isRead ? 400 : 600 } }}
              >
                <TableCell>
                  {new Date(message.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>{message.name}</TableCell>
                <TableCell>
                  <Link href={`mailto:${message.email}`}>{message.email}</Link>
                </TableCell>
                <TableCell>{message.phone || '—'}</TableCell>
                <TableCell sx={{ maxWidth: 280 }}>
                  <Typography variant="body2" noWrap>
                    {message.message}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={message.isRead ? 'Read' : 'New'}
                    color={message.isRead ? 'default' : 'info'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => openMessage(message)}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <IconButton
                    size="small"
                    title={message.isRead ? 'Mark as unread' : 'Mark as read'}
                    onClick={() => setRead(message, !message.isRead)}
                  >
                    {message.isRead ? <MarkEmailUnread fontSize="small" /> : <MarkEmailRead fontSize="small" />}
                  </IconButton>
                  <IconButton size="small" color="error" title="Delete" onClick={() => deleteMessage(message)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No customer messages yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>Message from {selected.name}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(selected.createdAt).toLocaleString('en-GB')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> <Link href={`mailto:${selected.email}`}>{selected.email}</Link>
              </Typography>
              {selected.phone && (
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {selected.phone}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button color="error" startIcon={<Delete />} onClick={() => deleteMessage(selected)}>
                Delete
              </Button>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default AdminMessagesPage;
