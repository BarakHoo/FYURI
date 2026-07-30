import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { CartProvider } from './context/CartContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeModeProvider, useThemeMode } from './context/ThemeContext';
import { rtlCache, ltrCache } from './rtlCache';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import HomePage from './pages/HomePage';

const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LabServicesPage = lazy(() => import('./pages/LabServicesPage'));
const BuilderPage = lazy(() => import('./pages/BuilderPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));

const RouteFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress />
  </Box>
);

function AppContent() {
  const { theme } = useThemeMode();
  const { language } = useLanguage();
  const isRtl = language === 'he';
  const themeWithDirection = { ...theme, direction: isRtl ? 'rtl' : 'ltr' };

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRtl, language]);

  return (
    <CacheProvider value={isRtl ? rtlCache : ltrCache}>
      <ThemeProvider theme={themeWithDirection}>
        <CssBaseline />
      <AdminAuthProvider>
        <Router>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Hidden admin panel routes - rendered without the public Layout/Navbar/Footer */}
            <Route path="/fyuri-admin/login" element={<AdminLoginPage />} />
            <Route
              path="/fyuri-admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminProductsPage />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/fyuri-admin/products"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminProductsPage />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/fyuri-admin/orders"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminOrdersPage />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/fyuri-admin/orders/:id"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminOrderDetailPage />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/fyuri-admin/messages"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminMessagesPage />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />

            {/* Public site routes */}
            <Route
              path="/*"
              element={
                <ToastProvider>
                  <CartProvider>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/services" element={<LabServicesPage />} />
                        <Route path="/builder" element={<BuilderPage />} />
                        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Layout>
                  </CartProvider>
                </ToastProvider>
              }
            />
          </Routes>
          </Suspense>
        </Router>
      </AdminAuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeModeProvider>
        <AppContent />
      </ThemeModeProvider>
    </LanguageProvider>
  );
}

export default App;