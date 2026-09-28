import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { Visibility, Search, PersonAdd, Notes } from '@mui/icons-material';

const emptyForm = { name: '', company: '', email: '', phone: '', address: '', city: '', notes: '' };

function AdminCustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => fetchCustomers(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const fetchCustomers = async (q) => {
    setLoading(true);
    setError('');
    try {
      const url = q ? `/api/admin/customers?search=${encodeURIComponent(q)}` : '/api/admin/customers';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to load clients');
      setCustomers(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.status === 409) {
        const conflict = await response.json();
        setCreateOpen(false);
        setForm(emptyForm);
        navigate(`/fyuri-admin/customers/${conflict.existingCustomerId}`, {
          state: { notice: `This client already exists (matched by ${conflict.matchedField}). Opened the existing record instead of creating a duplicate.` },
        });
        return;
      }
      if (!response.ok) throw new Error('Failed to create client');
      const created = await response.json();
      setCreateOpen(false);
      setForm(emptyForm);
      navigate(`/fyuri-admin/customers/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Clients
        </Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setCreateOpen(true)}>
          New Client
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, company, email or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Orders</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Last Order</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/fyuri-admin/customers/${c.id}`)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{c.name}</span>
                      {c.hasNotes && <Notes fontSize="small" color="action" titleAccess="Has notes" />}
                    </Stack>
                  </TableCell>
                  <TableCell>{c.company || '—'}</TableCell>
                  <TableCell>{c.phone || '—'}</TableCell>
                  <TableCell>{c.email || '—'}</TableCell>
                  <TableCell align="center">
                    <Chip size="small" label={c.orderCount} />
                  </TableCell>
                  <TableCell align="right">₪{Number(c.totalSpent).toLocaleString()}</TableCell>
                  <TableCell>{formatDate(c.lastOrderDate)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/fyuri-admin/customers/${c.id}`);
                      }}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {search ? 'No clients match your search.' : 'No clients yet. Clients are created automatically when orders come in.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
        <DialogTitle>New Client</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Only the name is required. If a client with the same email, phone, company or name already exists, you'll be taken to that record instead.
          </Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <TextField label="Notes" multiline rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving || !form.name.trim()}>
            {saving ? 'Creating…' : 'Create Client'}
          </Button>
        </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default AdminCustomersPage;
