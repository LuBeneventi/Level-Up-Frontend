// level-up-gaming-frontend/src/components/Header.tsx

import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn } from 'react-feather'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import UserDropdown from './UserDropdown'; // Importar el nuevo componente

// 🚨 URL del logo, accesible desde la carpeta /public
const LOGO_URL = '/images/logo.png'; 

const Header: React.FC = () => {
    const { user, isLoggedIn, logout } = useAuth();
    const { cartCount } = useCart(); 
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Cierra la sesión
        navigate('/'); // Redirige al inicio
    };

    return (
        <Navbar bg="dark"  expand="lg" sticky="top">
            <Container>
                {/* 🚨 USO DEL LOGO EN LA MARCA DEL SITIO */}
                <Navbar.Brand as={Link} to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <img src={LOGO_URL} alt="Level-Up Logo" height="30" className="d-inline-block align-top me-2"/>
                    Level-Up Gaming
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Enlaces Principales de Navegación */}
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                        <Nav.Link as={Link} to="/productos">Productos</Nav.Link>
                        <Nav.Link as={Link} to="/comunidad">Comunidad</Nav.Link>
                        <Nav.Link as={Link} to="/recompensas">Recompensas</Nav.Link>
                        <Nav.Link as={Link} to="/blog">Blog</Nav.Link>
                    </Nav>

                    {/* Íconos y Acciones de la Derecha */}
                    <Nav>
                        {/* Enlace al Carrito */}
                        <Nav.Link as={Link} to="/carrito" className="d-flex align-items-center me-3">
                            <ShoppingCart size={20} className="me-1" />
                            Carrito ({cartCount}) 
                        </Nav.Link>

                        {/* LÓGICA CONDICIONAL: Muestra UserDropdown o Botón de Login */}
                        {isLoggedIn ? (
                            <UserDropdown user={user} onLogout={handleLogout} />
                        ) : (
                            <Link 
                                to="/login" 
                                className="btn btn-outline-primary d-flex align-items-center"
                                role="button"
                            >
                                <LogIn size={20} className="me-1" />
                                Iniciar Sesión
                            </Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;