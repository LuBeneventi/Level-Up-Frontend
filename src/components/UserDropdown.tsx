// level-up-gaming-frontend/src/components/UserDropdown.tsx

import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { User, ShoppingBag } from 'react-feather';
import { User as UserType } from '../context/AuthContext'; // Asumiendo que exportas el tipo User

interface UserDropdownProps {
    user: UserType | null;
    onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
    return (
        <NavDropdown 
            title={user ? user.name : 'Usuario'} 
            id="user-nav-dropdown"
            align="end"
            className="ms-2" 
        >
            {user && user.role === 'admin' && (
                <NavDropdown.Item as={Link} to="/admin">
                    Panel Admin
                </NavDropdown.Item>
            )}
            <NavDropdown.Item as={Link} to="/profile">
                <User size={16} className="me-2"/> Mi Perfil
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/myorders">
                <ShoppingBag size={16} className="me-2"/> Mis Órdenes
            </NavDropdown.Item>
            
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onLogout}>
                Cerrar Sesión
            </NavDropdown.Item>
        </NavDropdown>
    );
};

export default UserDropdown;
