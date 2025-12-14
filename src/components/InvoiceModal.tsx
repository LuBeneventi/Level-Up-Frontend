// level-up-gaming-frontend/src/components/InvoiceModal.tsx

import React from 'react';
import { Modal, Button, ListGroup, Alert } from 'react-bootstrap';
import { Download } from 'react-feather';

// Interfaces (pueden necesitar ser importadas desde un archivo de tipos central)
// Interfaces (pueden necesitar ser importadas desde un archivo de tipos central)
interface ShippingAddress { street: string; city: string; region: string; zipCode?: string; }
interface CartItem { name: string; price: number; quantity: number; qty?: number; }

// Props del Modal
interface InvoiceModalProps {
    show: boolean;
    handleClose: () => void;
    order: Order | null;
    // Props opcionales para el flujo de checkout
    setStep?: (step: number) => void;
    clearCart?: () => void;
}

interface Order {
    id: string;
    totalPrice: number;
    shippingAddress: ShippingAddress;
    items: CartItem[];
}

const CLP_FORMATTER = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

const InvoiceModal: React.FC<InvoiceModalProps> = ({ show, handleClose, order, setStep, clearCart }) => {

    const handleCloseAndAdvance = () => {
        if (clearCart) clearCart();
        handleClose();
        if (setStep) setStep(4);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!order) return null;

    return (
        <Modal show={show} onHide={handleCloseAndAdvance} size="lg" centered id="invoiceModal">
            <Modal.Header closeButton style={{ backgroundColor: '#000', borderBottomColor: '#39FF14' }}>
                <Modal.Title style={{ color: '#39FF14' }}>
                    <Download size={24} className="me-2" /> BOLETA ELECTRÓNICA #{order.id.slice(0, 8)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Alert variant="success" style={{ backgroundColor: '#333', border: '1px solid #39FF14', color: 'white' }}>
                    ¡Pago Exitoso! Este es tu comprobante de compra.
                </Alert>

                <h5 style={{ color: '#1E90FF' }}>Detalles de Envío</h5>
                <p className="text-muted mb-3">
                    Orden #: {order.id.slice(0, 8)}... <br />
                    Dirección: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.region}
                </p>

                <h5 style={{ color: '#1E90FF' }}>Productos</h5>
                <ListGroup className="mb-4">
                    {order.items.map((item, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: 'white', borderBottomColor: '#333' }}>
                            <span>{item.name}</span>
                            <strong>x{item.quantity || item.qty}</strong>
                            <span style={{ color: '#39FF14' }}>{formatClp(item.price * (item.quantity || item.qty || 1))}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <h3 className="text-end" style={{ color: '#1E90FF' }}>TOTAL: <span style={{ color: '#39FF14' }}>{formatClp(order.totalPrice)}</span></h3>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#000', borderTopColor: '#333' }}>
                <Button variant="secondary" onClick={handleCloseAndAdvance}>
                    Cerrar y Continuar
                </Button>
                <Button variant="success" onClick={handlePrint}>
                    Imprimir Comprobante
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InvoiceModal;
