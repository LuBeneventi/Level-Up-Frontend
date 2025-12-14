// level-up-gaming-frontend/src/routes/AppRouter.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componentes de Protección
import AdminRoute from '../components/AdminRoute';

// Componentes de Páginas
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CommunityPage from '../pages/CommunityPage';
import RewardsPage from '../pages/RewardsPage';
import BlogPage from '../pages/BlogPage';
import BlogPostPage from '../pages/BlogPostPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import CheckoutPage from '../pages/CheckoutPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import NotFoundPage from '../pages/NotFoundPage';
import AboutUsPage from '../pages/AboutUsPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';

// Componentes de Administración
import AdminDashboard from '../pages/AdminDashboard';
import AdminProductsPage from '../pages/AdminProductsPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminEventsPage from '../pages/AdminEventsPage';
import AdminBlogPage from '../pages/AdminBlogPage';
import AdminVideosPage from '../pages/AdminVideosPage';
import AdminRewardsPage from '../pages/AdminRewardsPage';

const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* Rutas Públicas y de Autenticación */}
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/comunidad" element={<CommunityPage />} />
            <Route path="/recompensas" element={<RewardsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />

            {/* Nuevas páginas estáticas */}
            <Route path="/sobre-nosotros" element={<AboutUsPage />} />
            <Route path="/politica-privacidad" element={<PrivacyPolicyPage />} />
            <Route path="/terminos-servicio" element={<TermsOfServicePage />} />
            
            {/* Rutas de Sesión y Perfil */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Rutas de Compra y Pedidos */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/myorders" element={<MyOrdersPage />} />

            {/* Rutas Protegidas para Administradores */}
            <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="videos" element={<AdminVideosPage />} />
                <Route path="rewards" element={<AdminRewardsPage />} />
            </Route>

            {/* Ruta 404 (Not Found) */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;
