import { useState } from 'react';
import {
  BuildOutlined,
  ChevronRight,
  Close,
  Favorite,
  FavoriteBorder,
  FilterList,
  GridView,
  HandymanOutlined,
  HeadsetMicOutlined,
  List as ListIcon,
  MemoryOutlined,
  Remove,
  ScienceOutlined,
  SettingsOutlined,
  ShieldOutlined,
  ThermostatOutlined,
  TuneOutlined,
  ViewColumnOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Drawer, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import './ProductsPage.css';

const referenceProducts = [
  {
    id: 'pvs-14',
    name: 'PVS-14',
    description: ['Industry standard monocular.', 'Rugged, lightweight, proven.'],
    generation: 'Gen 3',
    stock: 'In Stock',
    stockTone: 'in',
    price: '3,200',
    image: '/images/catalog/pvs-14-reference.webp',
  },
  {
    id: 'pvs-14-pro',
    name: 'PVS-14 PRO',
    description: ['Enhanced optics & housing.', 'Built for harsh conditions.'],
    generation: 'Gen 3',
    stock: 'In Stock',
    stockTone: 'in',
    price: '4,100',
    image: '/images/catalog/pvs-14-pro-reference.webp',
  },
  {
    id: 'pvs-14-lite',
    name: 'PVS-14 LITE',
    description: ['Streamlined performance.', 'Excellent value.'],
    generation: 'Gen 2+',
    stock: 'In Stock',
    stockTone: 'in',
    price: '2,450',
    image: '/images/catalog/pvs-14-lite-reference.webp',
  },
  {
    id: 'pvs-7',
    name: 'PVS-7',
    description: ['Compact & versatile.', 'Battle-proven design.'],
    generation: 'Gen 3',
    stock: 'Low Stock',
    stockTone: 'low',
    price: '2,900',
    image: '/images/catalog/pvs-7-reference.webp',
  },
];

const categoryRows = [
  { label: 'All Products', icon: TuneOutlined },
  { label: 'Monoculars', count: 12, icon: VisibilityOutlined, active: true },
  { label: 'Binoculars', count: 8, icon: VisibilityOutlined },
  { label: 'Panoramic', count: 5, icon: ViewColumnOutlined },
  { label: 'Image Intensifiers', count: 7, icon: SettingsOutlined },
  { label: 'Lenses & Optics', count: 9, icon: HandymanOutlined },
  { label: 'Thermal', count: 6, icon: ThermostatOutlined },
  { label: 'Housings', count: 4, icon: BuildOutlined },
  { label: 'Accessories', count: 14, icon: MemoryOutlined },
];

const capabilities = [
  {
    icon: SettingsOutlined,
    title: 'Individually Tested Tubes',
    detail: 'Every device tested in-house',
  },
  {
    icon: ScienceOutlined,
    title: 'Lab Services Available',
    detail: 'Maintenance, repairs, upgrades',
  },
  {
    icon: ShieldOutlined,
    title: '2 Year Warranty',
    detail: 'Built to last. We stand behind it.',
  },
  {
    icon: HeadsetMicOutlined,
    title: 'Expert Support',
    detail: 'Real people. Real expertise.',
  },
  {
    icon: TuneOutlined,
    title: 'Custom Build Options',
    detail: 'Configure to your mission',
  },
];

function FilterPanel({ onClose }) {
  return (
    <div className="reference-filter-panel">
      {onClose && (
        <div className="reference-filter-panel__mobile-head">
          <strong>FILTERS</strong>
          <IconButton aria-label="Close filters" onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      )}

      <section className="reference-filter-section">
        <div className="reference-filter-title">
          <span>CATEGORIES</span>
          <Remove aria-hidden="true" />
        </div>
        <div className="reference-filter-rows">
          {categoryRows.map(({ active, count, icon: RowIcon, label }) => (
            <button
              type="button"
              className={active ? 'is-active' : undefined}
              key={label}
              aria-pressed={active || undefined}
            >
              <RowIcon aria-hidden="true" />
              <span>{label}</span>
              {count !== undefined && <b>{count}</b>}
            </button>
          ))}
        </div>
      </section>

      <section className="reference-filter-section reference-filter-section--generation">
        <div className="reference-filter-title">
          <span>GENERATION</span>
          <Remove aria-hidden="true" />
        </div>
        <label>
          <input type="checkbox" />
          <span>Gen 3</span>
          <b>8</b>
        </label>
        <label>
          <input type="checkbox" />
          <span>Gen 2+</span>
          <b>3</b>
        </label>
        <label>
          <input type="checkbox" />
          <span>Gen 2</span>
          <b>1</b>
        </label>
      </section>

      <section className="reference-filter-section reference-filter-section--collapsed">
        <div className="reference-filter-title">
          <span>TUBE QUALITY</span>
          <b aria-hidden="true">+</b>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, favorite, onFavorite }) {
  return (
    <article
      className="reference-product-card"
      data-testid="catalog-product-card"
      role="listitem"
    >
      <div className="reference-product-card__media">
        <img
          src={product.image}
          alt={product.name}
          width="1600"
          height="960"
          loading="eager"
        />
        <button
          type="button"
          className="reference-product-card__favorite"
          aria-label={`${favorite ? 'Remove' : 'Save'} ${product.name} ${favorite ? 'from' : 'to'} favorites`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          {favorite ? <Favorite /> : <FavoriteBorder />}
        </button>
      </div>

      <div className="reference-product-card__body">
        <h2>{product.name}</h2>
        <p>
          {product.description.map((line) => <span key={line}>{line}</span>)}
        </p>

        <div className="reference-product-card__chips">
          <span className="reference-chip reference-chip--generation">
            {product.generation}
          </span>
          <span className={`reference-chip reference-chip--${product.stockTone}`}>
            {product.stock}
          </span>
        </div>

        <div className="reference-product-card__price">
          <span>Starting at</span>
          <strong><i>₪</i>{product.price}</strong>
        </div>

        <div className="reference-product-card__actions">
          <button type="button" className="reference-button reference-button--outline">
            VIEW DETAILS
          </button>
          <RouterLink to="/builder" className="reference-button reference-button--primary">
            CONFIGURE
          </RouterLink>
        </div>
      </div>
    </article>
  );
}

function ProductsPage() {
  const [favorites, setFavorites] = useState(() => new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="reference-products-page" dir="ltr">
      <section className="reference-catalog-hero" aria-labelledby="reference-catalog-title">
        <img
          className="reference-catalog-hero__image"
          src="/images/catalog/catalog-monocular-hero-v2.webp"
          alt=""
          width="1969"
          height="799"
          fetchPriority="high"
        />
        <div className="reference-catalog-hero__shade" aria-hidden="true" />
        <div className="reference-catalog-hero__copy">
          <nav aria-label="Breadcrumb" className="reference-breadcrumb">
            <RouterLink to="/">Home</RouterLink>
            <ChevronRight aria-hidden="true" />
            <RouterLink to="/products">Products</RouterLink>
            <ChevronRight aria-hidden="true" />
            <span aria-current="page">Monoculars</span>
          </nav>
          <h1 id="reference-catalog-title">MONOCULARS</h1>
          <p className="reference-catalog-hero__tagline">
            Compact. Capable. Mission ready.
          </p>
          <p className="reference-catalog-hero__description">
            Professional-grade night vision monoculars built for clarity,
            <br />
            reliability, and real-world performance.
          </p>
        </div>
      </section>

      <section className="reference-capabilities" aria-label="Service commitments">
        <ul>
          {capabilities.map(({ detail, icon: CapabilityIcon, title }) => (
            <li key={title}>
              <CapabilityIcon aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="reference-catalog-results">
        <aside className="reference-catalog-sidebar" aria-label="Catalog filters">
          <FilterPanel />
        </aside>

        <div className="reference-catalog-main">
          <div className="reference-catalog-toolbar">
            <button
              type="button"
              className="reference-mobile-filter"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <FilterList aria-hidden="true" />
              FILTERS
            </button>

            <div className="reference-catalog-summary">
              Showing 1–12 of 12 results
            </div>

            <label className="reference-catalog-sort">
              <span>Sort by:</span>
              <select defaultValue="featured" aria-label="Sort by">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="name">Name</option>
              </select>
            </label>

            <div className="reference-view-toggle" role="group" aria-label="Product view">
              <button
                type="button"
                className={viewMode === 'grid' ? 'is-active' : undefined}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
              >
                <GridView aria-hidden="true" />
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'is-active' : undefined}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                <ListIcon aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className={`reference-product-grid reference-product-grid--${viewMode}`}
            role="list"
            aria-label="Monocular products"
          >
            {referenceProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.has(product.id)}
                onFavorite={() => toggleFavorite(product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          className: 'reference-filter-drawer',
          id: 'reference-filter-drawer',
        }}
      >
        <FilterPanel onClose={() => setMobileFiltersOpen(false)} />
      </Drawer>
    </div>
  );
}

export default ProductsPage;
