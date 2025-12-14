// level-up-gaming-frontend/src/pages/MyOrdersPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Calendar, Download } from 'react-feather'; 
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; 

import InvoiceModal from '../components/InvoiceModal';

// Interfaces de la Orden (deben coincidir con el Backend)
interface ShippingAddress { street: string; city: string; region: string; zipCode?: string; }
interface CartItem { product: { name: string; price: number }; quantity: number; }

interface Order {
    id: string; 
    userId: string; 
    items: CartItem[]; 
    shippingAddress: ShippingAddress; 
    paymentMethod: 'webpay' | 'transferencia' | 'efectivo';
    totalPrice: number;
    shippingPrice: number;
    isPaid: boolean;
    status: string; // Estado: Pendiente, Preparacion, Enviada, Entregada
    createdAt: string;
}


const MyOrdersPage: React.FC = () => {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    // Redirigir si no está logueado
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                try {
                    const { data } = await axios.get(`/api/orders/myorders?userId=${user.id}`); 
                    setOrders(data.reverse()); 
                    setError(null);
                } catch (err: any) {
                    setError('Error al cargar tu historial de compras. Asegúrate de que el Backend esté corriendo.');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [user]);

    // Función que simula la descarga de la boleta (para el botón de la tabla)
    const handleDownloadInvoice = (order: Order) => {
        setSelectedOrder(order);
        setShowInvoiceModal(true);
    };

    // Función auxiliar para el color del Badge
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Entregada': return 'success';
            case 'Enviada': return 'warning';
            case 'Preparacion': return 'primary';
            case 'Pendiente': return 'danger';
            default: return 'secondary';
        }
    };


    if (!isLoggedIn || !user) return null; 
    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

    return (
        <Container className="py-5">
            <h1 className="mb-5" style={{ color: '#1E90FF' }}><ShoppingBag className="me-2"/> Mis Compras</h1>

            {error && <Alert variant="danger">{error}</Alert>}
            
            {orders.length === 0 ? (
                <Alert variant="info" style={{ backgroundColor: '#333', border: '1px solid #1E90FF', color: 'white' }}>
                    Aún no tienes órdenes registradas.
                </Alert>
            ) : (
                <Table striped bordered hover className="table-dark" responsive style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th># ORDEN</th>
                            <th>FECHA</th>
                            <th>TOTAL</th>
                            <th>ESTADO</th>
                            <th>BOLETA</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td style={{ fontSize: '0.85rem', color: '#1E90FF' }}>{order.id.slice(0, 8)}...</td>
                                <td><Calendar size={14} className="me-1 text-muted"/> {new Date(order.createdAt).toLocaleDateString('es-CL')}</td>
                                <td style={{ color: '#39FF14' }}>${order.totalPrice.toFixed(2)}</td>
                                <td>
                                    {order.status && (
                                        <Badge bg={getStatusVariant(order.status)}>
                                            {order.status.toUpperCase()}
                                        </Badge>
                                    )}
                                </td>
                                
                                <td>
                                    {/* 🚨 CORRECCIÓN: Botón activo si la orden existe */}
                                    <Button variant="outline-success" size="sm" onClick={() => handleDownloadInvoice(order)}>
                                        <Download size={14} className="me-1" /> Descargar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <InvoiceModal 
                show={showInvoiceModal}
                handleClose={() => setShowInvoiceModal(false)}
                order={selectedOrder}
            />
        </Container>
    );
};

export default MyOrdersPage;