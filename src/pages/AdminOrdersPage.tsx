// level-up-gaming-frontend/src/pages/AdminOrdersPage.tsx (CÓDIGO COMPLETO)

import React, { useState, useEffect } from 'react';
import {
    Container, Table, Alert, Spinner, Badge, Button, Modal, ButtonGroup,
    Row, Col, Form, Card, ListGroup
} from 'react-bootstrap';
import { Edit, ArrowLeft } from 'react-feather';
import { Link } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import AdminOrderService from '../services/AdminOrderService';
import { Order, OrderStatus } from '../types/Order';
import { User } from '../types/User';
import { StatusMessage } from '../types/StatusMessage';
import { formatClp, formatDate, formatDateTime } from '../utils/formatters';
import { ORDER_STATUS_OPTIONS } from '../utils/constants';

// Componente funcional puro para estados
const StatusSelect: React.FC<{
    status: OrderStatus;
    onUpdate: (id: string, status: string) => void;
    orderId: string;
}> = ({ status, onUpdate, orderId }) => {
    const isFinal = status === 'Entregado' || status === 'Cancelado';
    const currentIndex = ORDER_STATUS_OPTIONS.indexOf(status);

    return (
        <Form.Select
            value={status}
            onChange={(e) => onUpdate(orderId, e.target.value)}
            disabled={isFinal}
            style={{
                backgroundColor: '#333',
                color: 'white',
                borderColor: '#555'
            }}
        >
            {ORDER_STATUS_OPTIONS.map((opt, idx) => (
                <option key={opt} value={opt} disabled={idx < currentIndex}>{opt}</option>
            ))}
        </Form.Select>
    );
};

// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE ÓRDENES
// ----------------------------------------------------

const AdminOrdersPage: React.FC = () => {

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | ''>('newest'); // 🚨 CAMBIO: Permitir estado sin orden
    const [searchTerm, setSearchTerm] = useState(''); // 🚨 NUEVO: Estado para el término de búsqueda
    const [userMap, setUserMap] = useState<Map<string, string>>(new Map()); // 🚨 NUEVO: Mapa de ID a RUT

    // 🚨 CAMBIO: Ahora obtenemos órdenes y usuarios usando el servicio
    const fetchData = async () => {
        setLoading(true);
        try {
            const { orders, users } = await AdminOrderService.fetchOrdersAndUsers();

            const newMap = new Map<string, string>();
            users.forEach(user => newMap.set(user.id, user.rut));
            setUserMap(newMap);

            setOrders(orders);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las órdenes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const updatedOrder = await AdminOrderService.updateOrderStatus(orderId, { status: newStatus as OrderStatus });
            setOrders(orders.map(o => (o.id === orderId ? updatedOrder : o)));
            showStatus(`Estado actualizado a ${newStatus}.`, 'success');
        } catch (err: any) {
            showStatus(err.message || 'Fallo al actualizar el estado.', 'danger');
        }
    };

    // 🚨 CAMBIO: Lógica para filtrar y luego ordenar las órdenes
    const filteredAndSortedOrders = React.useMemo(() => {
        const filtered = orders.filter(order => {
            const userRut = userMap.get(order.userId);
            if (!searchTerm) return true; // Si no hay búsqueda, mostrar todo
            return userRut?.toLowerCase().includes(searchTerm.toLowerCase());
        });

        if (sortOrder) {
            return filtered.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            });
        }
        return filtered;
    }, [orders, sortOrder, searchTerm, userMap]);

    if (loading)
        return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

    if (error)
        return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <AdminLayout>
            {/* 🚨 NUEVO: Estilo para aclarar el placeholder del buscador */}
            <style>{`
                .admin-search-input::placeholder {
                    color: #999;
                    opacity: 1;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2" /> Volver al Panel
                    </Button>
                </Link>
                <h1 style={{ color: '#1E90FF' }}>Gestión de Órdenes</h1>
                <div style={{ width: '150px' }}></div> {/* Espaciador para centrar el título */}
            </div>

            {/* 🚨 NUEVO: Fila de filtros (Buscador y Ordenamiento) */}
            <Row className="mb-4 align-items-center">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por RUT de cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input" // Clase para aplicar el estilo
                        style={{ backgroundColor: '#333', color: 'white', borderColor: '#555' }}
                    />
                </Col>
                <Col md={8} className="text-md-end mt-2 mt-md-0">
                    <span className="me-3 text-muted">Ordenar por:</span>
                    <ButtonGroup>
                        <Button variant={sortOrder === 'newest' ? 'primary' : 'outline-secondary'} onClick={() => setSortOrder(sortOrder === 'newest' ? '' : 'newest')}>
                            Más Recientes
                        </Button>
                        <Button variant={sortOrder === 'oldest' ? 'primary' : 'outline-secondary'} onClick={() => setSortOrder(sortOrder === 'oldest' ? '' : 'oldest')}>
                            Más Antiguos
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            {statusMessage && (
                <Alert variant={statusMessage.type}
                    dismissible
                    onClose={() => setStatusMessage(null)}
                    className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* TABLA ESCRITORIO */}
            <div className="table-responsive d-none d-md-block">
                <Table striped bordered className="table-dark" hover style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>RUT Cliente</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedOrders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id.slice(0, 8)}...</td>
                                <td>{formatClp(order.totalPrice)}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                {/* 🚨 CAMBIO: Mostramos el RUT desde el mapa */}
                                <td>{userMap.get(order.userId) || 'N/A'}</td>
                                <td><StatusBadge status={order.status} /></td>
                                <td>
                                    {/* 🚨 CAMBIO: Un solo botón para gestionar la orden */}
                                    <Button variant="info" size="sm"
                                        onClick={() => setSelectedOrder(order)}>
                                        <Edit size={14} className="me-1" /> Gestionar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* MÓVIL */}
            <Row className="d-block d-md-none g-3">
                {filteredAndSortedOrders.map(order => (
                    <Col xs={12} key={order.id}>
                        <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 style={{ color: '#39FF14' }}>Orden #{order.id.slice(0, 8)}...</h5>
                                    <StatusBadge status={order.status} />
                                </div>
                                <hr />
                                <p>Total: <strong>{formatClp(order.totalPrice)}</strong></p>
                                <p className="text-muted small">RUT Cliente: {userMap.get(order.userId) || 'N/A'}</p>
                                <p className="text-muted small">Fecha: {formatDate(order.createdAt)}</p>

                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => setSelectedOrder(order)}>
                                        <Edit size={14} className="me-1" /> Gestionar Orden
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* MODAL */}
            <OrderDetailsModal
                order={selectedOrder}
                show={!!selectedOrder}
                handleClose={() => setSelectedOrder(null)}
                handleUpdateStatus={handleUpdateStatus}
                userRut={selectedOrder ? userMap.get(selectedOrder.userId) : undefined}
            />

        </AdminLayout>
    );
};

export default AdminOrdersPage;

// ----------------------------------------------------
// COMPONENTES AUXILIARES (NO llevan imports extra)
// ----------------------------------------------------

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    let bg: string;
    switch (status) {
        case 'Entregado': bg = 'success'; break;
        case 'Enviado': bg = 'info'; break;
        case 'Procesando': bg = 'primary'; break;
        case 'Cancelado': bg = 'danger'; break;
        default: bg = 'secondary';
    }
    return <Badge bg={bg}>{status.toUpperCase()}</Badge>;
};

interface OrderDetailsModalProps {
    order: Order | null;
    show: boolean;
    handleClose: () => void;
    handleUpdateStatus: (id: string, status: string) => void;
    userRut?: string; // 🚨 NUEVO: Recibe el RUT para mostrarlo
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    order, show, handleClose, handleUpdateStatus, userRut
}) => {

    if (!order) return null;

    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);

    const originalIndex = ORDER_STATUS_OPTIONS.indexOf(order.status);
    const isOriginalFinal = order.status === 'Entregado' || order.status === 'Cancelado';

    const handleSaveStatus = async () => {
        // Prevent reverting to previous statuses or changing final statuses
        const selectedIndex = ORDER_STATUS_OPTIONS.indexOf(currentStatus);
        if (isOriginalFinal) {
            // Shouldn't happen due to disabled controls, but guard anyway
            return;
        }
        if (selectedIndex < originalIndex) {
            // Invalid transition
            // show a temporary alert inside modal (could be improved to use statusMessage)
            // For now, just return without saving
            return;
        }

        setLoading(true);
        try {
            await handleUpdateStatus(order.id, currentStatus);
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>
                    Detalle Orden #{order.id.slice(0, 8)}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Row>

                    <Col md={6}>
                        <h5 style={{ color: '#39FF14' }}>Detalles de Envío</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item style={{ background: 'transparent', color: 'white' }}>
                                RUT Cliente: {userRut || 'No disponible'}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ background: 'transparent', color: 'white' }}>
                                Fecha: {formatDateTime(order.createdAt)}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ background: 'transparent', color: 'white' }}>
                                Total: {formatClp(order.totalPrice)}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ background: 'transparent', color: 'white' }}>
                                Dirección: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.region}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col md={6}>
                        <h5 style={{ color: '#39FF14' }}>Actualizar Estado</h5>

                        <Form.Select
                            value={currentStatus}
                            onChange={(e) => setCurrentStatus(e.target.value as Order['status'])}
                            style={{ backgroundColor: '#333', color: 'white' }}
                            className="mb-3"
                            disabled={isOriginalFinal}
                        >
                            {ORDER_STATUS_OPTIONS.map((opt, idx) => (
                                <option key={opt} value={opt} disabled={idx < originalIndex}>{opt}</option>
                            ))}
                        </Form.Select>

                        <Button variant="success" className="w-100"
                            disabled={loading || isOriginalFinal}
                            onClick={handleSaveStatus}>
                            {loading ? 'Guardando...' : 'Guardar Estado'}
                        </Button>
                    </Col>

                </Row>

                <h5 className="mt-4" style={{ color: '#39FF14' }}>Productos Comprados</h5>
                <ListGroup variant="flush">
                    {order.items.map((item, i) => (
                        <ListGroup.Item key={i}
                            style={{ backgroundColor: '#222', color: 'white', borderBottom: '1px dashed #444' }}>
                            <div className="d-flex justify-content-between">
                                <span>{item.name}</span>
                                <strong>x{item.quantity || item.qty}</strong>
                                <span style={{ color: '#39FF14' }}>
                                    {formatClp((item.price || 0) * (item.quantity || item.qty))}
                                </span>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

            </Modal.Body>
        </Modal>
    );
};
