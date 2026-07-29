import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const statusColors = {
  Pending: 'warning',
  Contacted: 'info',
  Approved: 'success',
  Rejected: 'error',
  Completed: 'success',
  Cancelled: 'default',
};

const statusOptions = ['Pending', 'Contacted', 'Approved', 'Rejected', 'Completed', 'Cancelled'];

function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load order');
      }
      const data = await response.json();
      setOrder(data);
      setStatus(data.status);
      setAdminNotes(data.adminNotes || '');
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
      const payload = { 
        Status: status, 
        AdminNotes: adminNotes 
      };
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update order: ${response.status} ${errorData}`);
      }
      const data = await response.json();
      setOrder(data);
      setSuccess('Order updated successfully.');
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return <Alert severity="error">Order not found.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', width: '100%' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/fyuri-admin/orders')} sx={{ mb: 2 }}>
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Order {order.orderNumber}
        </Typography>
        <Chip label={order.status} color={statusColors[order.status] || 'default'} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Items
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            variant="rounded"
                            src={item.product?.thumbnailUrl}
                            alt={item.productName}
                          />
                          <Box>
                            <Typography variant="body2">{item.productName}</Typography>
                            {item.product?.productType === 'custom-build' && item.product?.specifications && (
                              <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                                {Object.entries(item.product.specifications).map(([component, option]) => (
                                  <Typography
                                    key={component}
                                    component="li"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'list-item' }}
                                  >
                                    <strong>{component}:</strong> {option}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{item.productSku}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">₪{item.unitPrice.toLocaleString()}</TableCell>
                      <TableCell align="right">₪{item.totalPrice.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="h6">
                Total: ₪{order.totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Update Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Admin Notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Customer Information
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{order.customerName}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{order.customerEmail}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{order.customerPhone}</Typography>
              </Grid>

              {order.customerAddress && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{order.customerAddress}</Typography>
                  </Grid>
                </>
              )}

              {order.customerCity && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">City</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{order.customerCity}</Typography>
                  </Grid>
                </>
              )}

              {order.customerNotes && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Customer Notes</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{order.customerNotes}</Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Order Date</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {new Date(order.createdDate).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Grid>

              {order.contactedDate && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Contacted On</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {new Date(order.contactedDate).toLocaleString('en-GB')}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminOrderDetailPage;
