// src/layouts/AdminLayout.tsx
import React from 'react';
import { Container } from 'react-bootstrap';
import AdminSidebar from '../components/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ marginLeft: "260px" }}>
        <Container fluid>
          {children}
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout;