import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import BottomTabBar from './components/layout/BottomTabBar';
import ProductListingPage from './pages/products/ProductListingPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import WishlistPage from './pages/products/WishlistPage';
import SearchPage from './pages/products/SearchPage';
import ProfilePage from './pages/auth/ProfilePage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderSuccessPage from './pages/checkout/OrderSuccessPage';
import OrderHistoryPage from './pages/orders/OrderHistoryPage';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminUserListPage from './pages/admin/AdminUserListPage';
import SiteCustomizationPage from './pages/admin/SiteCustomizationPage';
import PromoCodePage from './pages/admin/PromoCodePage';
import NotFound from './pages/NotFound';
import HealthBadge from './components/common/HealthBadge';
import { pageTransition } from './constants/animations';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="flex-grow flex flex-col"
      >
        <Routes location={location}>
          <Route path="/" element={<ProductListingPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductListPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoryPage />} />
              <Route path="orders" element={<AdminOrderListPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="users" element={<AdminUserListPage />} />
              <Route path="settings" element={<SiteCustomizationPage />} />
              <Route path="banners" element={<SiteCustomizationPage />} />
              <Route path="promos" element={<PromoCodePage />} />
            </Route>
          </Route>

          <Route path="/403" element={<div className="p-20 text-center"><h1>403 Forbidden</h1><p>You don't have access to this page.</p></div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <AnimatedRoutes />
        </main>
        <HealthBadge />
        <BottomTabBar />
        <footer className="bg-white border-t py-8 mt-auto text-center text-gray-500 hidden md:block">
          <p>&copy; 2026 Ecommerce Store. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
