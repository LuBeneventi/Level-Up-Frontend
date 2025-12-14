import React from 'react';
import AdminSidebar from '../../src/components/AdminSidebar';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('AdminSidebar Component', () => {

    it('1. renderiza sin fallar', () => {
        render(
            <MemoryRouter>
                <AdminSidebar />
            </MemoryRouter>
        );
        expect(screen.getByText('PANEL DE NAVEGACIÓN')).toBeInTheDocument();
    });

    it('2. muestra todos los enlaces del menú', () => {
        render(
            <MemoryRouter>
                <AdminSidebar />
            </MemoryRouter>
        );

        const menuItems = [
            'Dashboard Principal',
            'Gestión de Productos',
            'Gestión de Órdenes',
            'Gestión de Usuarios',
            'Gestión de Eventos',
            'Gestión de Recompensas',
            'Gestión de Blog/Noticias',
            'Gestión de Videos'
        ];

        menuItems.forEach(text => {
            expect(screen.getByText(text)).toBeInTheDocument();
        });
    });

    it('3. resalta correctamente el enlace activo según la ruta', () => {
        render(
            <MemoryRouter initialEntries={['/admin/products']}>
                <AdminSidebar />
            </MemoryRouter>
        );

        const activeLink = screen.getByText('Gestión de Productos');

        expect(activeLink).toHaveStyle({
            backgroundColor: '#1E90FF',
            color: '#000',
            borderLeft: '4px solid #39FF14'
        });
    });
    it('4. los enlaces inactivos no deben tener la clase activa', () => {
        render(
            <MemoryRouter initialEntries={['/admin/products']}>
                <AdminSidebar />
            </MemoryRouter>
        );

        const inactiveLink = screen.getByText('Gestión de Órdenes').closest('a');

        // Solo los inactivos tienen esta clase
        expect(inactiveLink).toHaveClass('text-decoration-none');
    });

    it('5. todos los enlaces tienen la propiedad "to" correcta', () => {
        render(
            <MemoryRouter>
                <AdminSidebar />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard Principal').closest('a'))
            .toHaveAttribute('href', '/admin');

        expect(screen.getByText('Gestión de Productos').closest('a'))
            .toHaveAttribute('href', '/admin/products');
    });
});
