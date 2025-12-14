// level-up-gaming-frontend/src/components/AdminSidebar.tsx

import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Package, ShoppingCart, Users, MapPin, BookOpen, Video, Award } from 'react-feather';

// Lista de enlaces del menú
const adminLinks = [
    { name: 'Dashboard Principal', icon: Settings, to: '/admin' },
    { name: 'Gestión de Productos', icon: Package, to: '/admin/products' },
    { name: 'Gestión de Órdenes', icon: ShoppingCart, to: '/admin/orders' },
    { name: 'Gestión de Usuarios', icon: Users, to: '/admin/users' },
    { name: 'Gestión de Eventos', icon: MapPin, to: '/admin/events' },
    { name: 'Gestión de Recompensas', icon: Award, to: '/admin/rewards' },
    { name: 'Gestión de Blog/Noticias', icon: BookOpen, to: '/admin/blog' },
    { name: 'Gestión de Videos', icon: Video, to: '/admin/videos' },
];

const AdminSidebar: React.FC = () => {
    const location = useLocation(); // Hook para saber qué ruta está activa

    return (
        <div 
            style={{ 
                height: '100%', 
                minHeight: '85vh', 
                backgroundColor: '#111', 
                borderRight: '1px solid #1E90FF',
                paddingTop: '20px'
            }}
        >
            <h6 className="text-center mb-4 px-3" style={{ color: '#39FF14' }}>
                PANEL DE NAVEGACIÓN
            </h6>
            
            <Nav className="flex-column" defaultActiveKey={location.pathname}>
                {adminLinks.map(link => {
                    // Determinar si la ruta actual es la activa para aplicar el estilo
                    const isActive = location.pathname === link.to;

                    return (
                        <Nav.Link 
                            key={link.to}
                            as={Link}
                            to={link.to}
                            style={{
                                color: isActive ? '#000' : '#DDD',
                                backgroundColor: isActive ? '#1E90FF' : 'transparent',
                                borderLeft: isActive ? '4px solid #39FF14' : '4px solid transparent',
                                padding: '10px 15px',
                                transition: 'all 0.2s',
                            }}
                            className={!isActive ? 'text-decoration-none' : ''}
                        >
                            <link.icon size={18} className="me-2" style={{ color: isActive ? '#000' : '#1E90FF' }}/>
                            {link.name}
                        </Nav.Link>
                    );
                })}
            </Nav>
        </div>
    );
};

export default AdminSidebar;