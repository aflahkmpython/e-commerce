import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productReducer from './features/products/productSlice';
import wishlistReducer from './features/products/wishlistSlice';
import cartReducer from './features/cart/cartSlice';
import orderReducer from './features/orders/orderSlice';
import dashboardReducer from './features/admin/dashboardSlice';
import categoryReducer from './features/categories/categorySlice';
import adminOrdersReducer from './features/admin/adminOrdersSlice';
import adminUsersReducer from './features/admin/adminUsersSlice';
import inventoryReducer from './features/admin/inventorySlice';
import siteCustomizationReducer from './features/admin/siteCustomizationSlice';
import promoReducer from './features/admin/promoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    orders: orderReducer,
    dashboard: dashboardReducer,
    categories: categoryReducer,
    adminOrders: adminOrdersReducer,
    adminUsers: adminUsersReducer,
    inventory: inventoryReducer,
    siteCustomization: siteCustomizationReducer,
    promos: promoReducer,
  },
});
