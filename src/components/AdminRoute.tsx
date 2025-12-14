// src/components/AdminRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Container } from 'react-bootstrap';

const AdminRoute: React.FC = () => {
    const { user, isLoggedIn } = useAuth();
    
    // 1. No Logueado o Sin Usuario
    if (!isLoggedIn || !user) {
        // Redirige al login. 'replace' evita que el usuario pueda volver con el botón 'atrás'
        return <Navigate to="/login" replace />;
    }
    
    // 2. Logueado pero Sin Rol de Administrador
    if (user.role !== 'admin') {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    Acceso Denegado. No tienes permisos de administrador.
                </Alert>
            </Container>
        );
    }
    
    // 3. Permiso Concedido: Renderiza la ruta hija (Outlet)
    return <Outlet />;
};

export default AdminRoute;