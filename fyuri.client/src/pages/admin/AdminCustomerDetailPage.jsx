import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ArrowBack, Save, Delete, Add, Visibility } from '@mui/icons-material';

const statusColors = {
  Pending: 'warning',
  Contacted: 'info',
  Approved: 'success',
  Rejected: 'error',
  Completed: 'success',
  Cancelled: 'default',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function AdminCustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({ product: null, description: '', serialNumber: '', notes: '' });
  const [addingItem, setAddingItem] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const handleAddNote = async () => {
    const text = newNote.trim();
    if (!text) return;
    setAddingNote(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/customers/${id}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('Failed to add note');
      setNewNote('');
      await fetchCustomer();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (note) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      const response = await fetch(`/api/admin/customers/${id}/notes/${note.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete note');
      await fetchCustomer();
    } catch (err) {
      setError(err.message);
    }
  };

  const hasUnsaved = customer && form && ['name', 'company', 'email', 'phone', 'address', 'city']
    .some((k) => (form[k] || '') !== (customer[k] || ''));

  useEffect(() => {
    if (!hasUnsaved) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsaved]);

  useEffect(() => {
    fetchCustomer();
    fetch('/api/products', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setProducts)
      .catch(() => {});
  }, [id]);

  const fetchCustomer = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/customers/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Client not found');
      const data = await response.json();
      setCustomer(data);
      setForm({
        name: data.name || '',
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        notes: data.notes || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.status === 409) {
        const conflict = await response.json();
        throw new Error(conflict.message || 'Another client already has these details');
      }
      if (!response.ok) throw new Error('Failed to save client');
      setSuccess('Client details saved.');
      await fetchCustomer();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    const description = newItem.description.trim() || newItem.product?.name;
    if (!description) return;
    setAddingItem(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/customers/${id}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newItem.product?.id ?? null,
          description,
          serialNumber: newItem.serialNumber,
          notes: newItem.notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      setNewItem({ product: null, description: '', serialNumber: '', notes: '' });
      setSuccess(`"${description}" added to equipment.`);
      await fetchCustomer();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (item) => {
    if (!window.confirm(`Remove "${item.description}" from this client's equipment?`)) return;
    try {
      const response = await fetch(`/api/admin/customers/${id}/items/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to remove item');
      setSuccess(`"${item.description}" removed.`);
      await fetchCustomer();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading || !form) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/fyuri-admin/customers')}>Back to Clients</Button>
        <Alert severity="error" sx={{ mt: 2 }}>{error || 'Client not found'}</Alert>
      </Box>
    );
  }

  const totalSpent = customer.orders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Rejected')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const contactDirty = ['name', 'company', 'email', 'phone', 'address', 'city']
    .some((k) => (form[k] || '') !== (customer[k] || ''));
  const anyDirty = contactDirty;

  const DirtyHint = ({ dirty }) => (
    <Typography variant="caption" color={dirty ? 'warning.main' : 'text.secondary'}>
      {dirty ? '● Unsaved changes' : 'All changes saved'}
    </Typography>
  );

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => {
          if (anyDirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
          navigate('/fyuri-admin/customers');
        }}
        sx={{ mb: 2 }}
      >
        Back to Clients
      </Button>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>{customer.name}</Typography>
          {customer.company && (
            <Typography variant="subtitle1" color="text.secondary">{customer.company}</Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Client since {formatDate(customer.createdDate)} · {customer.orders.length} orders · ₪{totalSpent.toLocaleString()} total
          </Typography>
        </Box>
      </Stack>

      {notice && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setNotice('')}>{notice}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Contact Details</Typography>
            <Stack spacing={2}>
              <TextField label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="Company / Organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <DirtyHint dirty={contactDirty} />
              <Button variant="contained" size="small" startIcon={<Save />} disabled={saving || !contactDirty} onClick={handleSave}>
                Save Details
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Client Notes Log</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Lab services, custom work, calls, special arrangements… Each entry is stamped with date, time and who wrote it.
            </Typography>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddNote(); }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Tube swap on PVS-14 done in lab. Prefers WhatsApp."
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote(); }}
              />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Ctrl+Enter to add</Typography>
                <Button type="submit" variant="contained" size="small" startIcon={<Add />} disabled={addingNote || !newNote.trim()}>
                  {addingNote ? 'Adding…' : 'Add Note'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {customer.noteEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No notes yet.
              </Typography>
            ) : (
              <List dense disablePadding>
                {customer.noteEntries.map((n) => (
                  <ListItem
                    key={n.id}
                    alignItems="flex-start"
                    disableGutters
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}
                    secondaryAction={
                      <IconButton edge="end" size="small" title="Delete note" onClick={() => handleDeleteNote(n)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', pr: 4 }}>{n.text}</Typography>}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(n.createdDate)}{n.author ? ` · ${n.author}` : ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Purchase History</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customer.orders.map((o) => (
                    <TableRow key={o.id} hover>
                      <TableCell>{o.orderNumber}</TableCell>
                      <TableCell>{formatDate(o.createdDate)}</TableCell>
                      <TableCell align="center">{o.itemCount}</TableCell>
                      <TableCell align="right">₪{o.totalAmount.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={o.status} color={statusColors[o.status] || 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => navigate(`/fyuri-admin/orders/${o.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customer.orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No orders yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Equipment in Possession</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Devices, tubes and accessories the client owns — bought here or brought in for lab work.
            </Typography>

            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Serial #</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Added</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customer.ownedItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        {item.description}
                        {item.product?.sku && (
                          <Typography variant="caption" color="text.secondary" display="block">{item.product.sku}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{item.serialNumber || '—'}</TableCell>
                      <TableCell>{item.notes || '—'}</TableCell>
                      <TableCell>{formatDate(item.addedDate)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleRemoveItem(item)} title="Remove">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customer.ownedItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Nothing recorded yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Add Equipment</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Pick a catalog product or type a free-text description, then press Add (or Enter). Items are saved immediately.
            </Typography>
            <Grid container spacing={1.5} component="form" onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  size="small"
                  options={products}
                  value={newItem.product}
                  getOptionLabel={(p) => `${p.name}${p.sku ? ` (${p.sku})` : ''}`}
                  onChange={(_, product) => setNewItem({ ...newItem, product, description: newItem.description || product?.name || '' })}
                  renderInput={(params) => <TextField {...params} label="Catalog product (optional)" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="e.g. PVS-14 with Photonis 4G tube"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField size="small" fullWidth label="Serial #" value={newItem.serialNumber} onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField size="small" fullWidth label="Notes" value={newItem.notes} onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button fullWidth type="submit" variant="contained" startIcon={<Add />} disabled={addingItem || (!newItem.description.trim() && !newItem.product)}>
                  {addingItem ? 'Adding…' : 'Add'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminCustomerDetailPage;
