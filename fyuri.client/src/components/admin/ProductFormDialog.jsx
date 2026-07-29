import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const emptyProduct = {
  name: '',
  nameHebrew: '',
  description: '',
  descriptionHebrew: '',
  sku: '',
  price: 0,
  categoryId: '',
  productType: '',
  imageUrls: [],
  thumbnailUrl: '',
  inStock: true,
  stockQuantity: 0,
  isActive: true,
  generation: '',
  resolution: '',
  fom: '',
  tubeType: '',
  specifications: {},
};

function ProductFormDialog({ open, onClose, onSave, product, categories }) {
  const [form, setForm] = useState(emptyProduct);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        ...emptyProduct,
        ...product,
        categoryId: product.categoryId || '',
        productType: product.productType || '',
      });
    } else {
      setForm(emptyProduct);
    }
  }, [product, open]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleToggle = (field) => (e) => {
    setForm({ ...form, [field]: e.target.checked });
  };

  const handleFileUpload = async (e, isThumbnail = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/imageupload/product', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (isThumbnail) {
          setForm({ ...form, thumbnailUrl: data.url });
        } else {
          setForm({ ...form, imageUrls: [...form.imageUrls, data.url] });
        }
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setForm({ ...form, imageUrls: [...form.imageUrls, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (idx) => {
    setForm({ ...form, imageUrls: form.imageUrls.filter((_, i) => i !== idx) });
  };

  const addSpec = () => {
    if (specKey.trim()) {
      setForm({ ...form, specifications: { ...form.specifications, [specKey.trim()]: specValue } });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpec = (key) => {
    const specs = { ...form.specifications };
    delete specs[key];
    setForm({ ...form, specifications: specs });
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      price: parseFloat(form.price) || 0,
      categoryId: parseInt(form.categoryId, 10) || 0,
      stockQuantity: parseInt(form.stockQuantity, 10) || 0,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Name (English)" value={form.name} onChange={handleChange('name')} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Name (Hebrew)" value={form.nameHebrew} onChange={handleChange('nameHebrew')} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth multiline rows={3} label="Description (English)" value={form.description || ''} onChange={handleChange('description')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth multiline rows={3} label="Description (Hebrew)" value={form.descriptionHebrew || ''} onChange={handleChange('descriptionHebrew')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="SKU"
              value={form.sku}
              onChange={handleChange('sku')}
              required
              helperText="Unique product code used for inventory tracking, e.g. FYR-MON-001"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Price (₪)" type="number" value={form.price} onChange={handleChange('price')} required />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Category"
              value={form.categoryId}
              onChange={handleChange('categoryId')}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Product Type"
              value={form.productType || ''}
              onChange={handleChange('productType')}
              helperText="Controls which category filter (e.g. /products?category=monocular) shows this product"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="monocular">Monocular</MenuItem>
              <MenuItem value="binocular">Binocular</MenuItem>
              <MenuItem value="panoramic">Panoramic</MenuItem>
              <MenuItem value="intensifier">Image Intensifier Tube</MenuItem>
              <MenuItem value="housing">Housing</MenuItem>
              <MenuItem value="optics">Lenses & Optics</MenuItem>
              <MenuItem value="thermal">Thermal</MenuItem>
              <MenuItem value="clip-on">Clip-On</MenuItem>
              <MenuItem value="accessories">Accessories</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Stock Quantity" type="number" value={form.stockQuantity} onChange={handleChange('stockQuantity')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Switch checked={form.inStock} onChange={handleToggle('inStock')} />}
              label="In Stock"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={handleToggle('isActive')} />}
              label="Active (visible on site)"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Generation"
              value={form.generation || ''}
              onChange={handleChange('generation')}
              helperText="Image intensifier tube generation, e.g. Gen 2+ or Gen 3"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Resolution"
              value={form.resolution || ''}
              onChange={handleChange('resolution')}
              helperText="Image sharpness, in line pairs per millimeter (lp/mm)"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="FOM"
              value={form.fom || ''}
              onChange={handleChange('fom')}
              helperText="Figure of Merit — overall tube quality score (resolution × signal-to-noise)"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Tube Type"
              value={form.tubeType || ''}
              onChange={handleChange('tubeType')}
              helperText="Image intensifier tube model/variant, e.g. Photonis 4G"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Thumbnail Image</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              The main image shown on the product catalog page and cards. Upload a file or paste an image URL.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField 
                fullWidth 
                label="Thumbnail URL" 
                value={form.thumbnailUrl || ''} 
                onChange={handleChange('thumbnailUrl')} 
                size="small"
              />
              <Button 
                variant="contained" 
                component="label" 
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, true)}
                />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Product Images</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Additional photos shown in the product's detail page gallery (not required for the catalog thumbnail above).
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="/images/products/example.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Button variant="outlined" onClick={addImageUrl} startIcon={<Add />}>Add URL</Button>
              <Button 
                variant="contained" 
                component="label" 
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, false)}
                />
              </Button>
            </Box>
            {form.imageUrls.map((url, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{url}</Typography>
                <IconButton size="small" onClick={() => removeImageUrl(idx)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Specifications</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Optional extra technical details shown on the product page, beyond the fields above (e.g. "Weight" / "500g", "Battery Life" / "40 hours", "Waterproof" / "IP67"). Enter a label in "Key" and its value in "Value", then click Add.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField size="small" label="Key" placeholder="e.g. Weight" value={specKey} onChange={(e) => setSpecKey(e.target.value)} />
              <TextField size="small" label="Value" placeholder="e.g. 500g" value={specValue} onChange={(e) => setSpecValue(e.target.value)} />
              <Button variant="outlined" onClick={addSpec} startIcon={<Add />}>Add</Button>
            </Box>
            {Object.entries(form.specifications).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{key}: {value}</Typography>
                <IconButton size="small" onClick={() => removeSpec(key)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {product ? 'Save Changes' : 'Create Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductFormDialog;
