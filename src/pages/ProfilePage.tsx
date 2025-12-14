import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Card, Row, Col, Alert, ListGroup, Button, Badge, Form, Modal } from 'react-bootstrap';
import { useAuth, User as AuthUser } from '../context/AuthContext';
import { User as UserIcon, Mail, Briefcase, Award, Zap, MapPin, Hash, Calendar } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- HELPER FUNCTIONS ---

// Helper para formatear RUT
const formatRut = (rut: string) => {
    if (!rut) return '';
    // Eliminar puntos y guión por si acaso
    let value = rut.replace(/\./g, '').replace(/-/g, '');
    if (value.length < 2) return value;

    // Separar cuerpo y dígito verificador
    const body = value.slice(0, -1);
    const dv = value.slice(-1).toUpperCase();

    // Formatear cuerpo con puntos
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
};

// --- TYPES ---

interface Address { street: string; city: string; region: string; zipCode?: string; }

// --- MAIN COMPONENT ---

const ProfilePage: React.FC = () => {
    const { user, isLoggedIn, logout, setUserFromRegistration } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    if (!isLoggedIn || !user) {
        navigate('/login');
        return null;
    }

    // Inicialización segura de la dirección
    const address = user.address ?? ({} as Address);

    return (
        <Container className="py-5" style={{ maxWidth: '900px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 style={{ color: '#1E90FF' }}>Mi Perfil</h1>
                <div>
                    <Button variant="info" onClick={() => setShowModal(true)} className="me-2">Editar Dirección</Button>
                    <Button variant="warning" onClick={() => setShowPasswordModal(true)}>Cambiar Contraseña</Button>
                </div>
            </div>

            <Card className="shadow-lg mb-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
                <Card.Body>
                    <Row>
                        {/* Columna de Datos de Sesión y Perfil */}
                        <Col md={6}>
                            <h5 className="border-bottom pb-2" style={{ color: '#39FF14' }}>Datos de la Cuenta</h5>
                            <ListGroup variant="flush" style={{ backgroundColor: 'transparent' }}>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><Mail size={16} className="me-2 text-info" /> Email: <strong>{user.email}</strong></ListGroup.Item>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><UserIcon size={16} className="me-2 text-info" /> Nombre: <strong>{user.name}</strong></ListGroup.Item>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><Hash size={16} className="me-2 text-info" /> RUT: <strong>{formatRut(user.rut)}</strong></ListGroup.Item>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><Calendar size={16} className="me-2 text-info" /> Edad: <strong>{user.age}</strong></ListGroup.Item>
                            </ListGroup>

                            <h5 className="border-bottom pb-2 mt-4" style={{ color: '#39FF14' }}>Fidelidad</h5>
                            <ListGroup variant="flush" style={{ backgroundColor: 'transparent' }}>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><Zap size={16} className="me-2 text-warning" /> Puntos Acumulados: <strong>{user.points} pts</strong></ListGroup.Item>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><Award size={16} className="me-2 text-success" /> Código de Referido: <Badge bg="info" className="ms-2" style={{ fontSize: '1em' }}>{user.referralCode || 'No asignado'}</Badge></ListGroup.Item>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><Briefcase size={16} className="me-2 text-info" /> Descuento DUOCUC: <strong>{user.hasDuocDiscount ? <Badge bg="success" className="ms-2">ACTIVO (20% OFF)</Badge> : <Badge bg="secondary" className="ms-2">Inactivo</Badge>}</strong></ListGroup.Item>
                            </ListGroup>

                        </Col>

                        {/* Columna de Dirección de Envío */}
                        <Col md={6}>
                            <h5 className="border-bottom pb-2 mt-3 mt-md-0" style={{ color: '#39FF14' }}>Dirección de Envío (Chile)</h5>
                            <ListGroup variant="flush" style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}><MapPin size={16} className="me-2 text-danger" /> Calle: <strong>{address.street || 'No especificada'}</strong></ListGroup.Item>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}>Ciudad: <strong>{address.city || 'N/A'}</strong></ListGroup.Item>
                                <ListGroup.Item style={{ backgroundColor: 'transparent', color: '#D3D3D3' }}>Región: <strong>{address.region || 'N/A'}</strong></ListGroup.Item>
                            </ListGroup>

                            {user.role === 'admin' && (<Alert variant="warning" className="mt-4">¡Eres Administrador! <Link to="/admin" style={{ color: 'black' }}>Accede al Panel</Link></Alert>)}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Button variant="danger" onClick={logout}>Cerrar Sesión</Button>

            <Alert variant="secondary" className="mt-4">
                Nota: El descuento 20% DUOCUC se aplicará automáticamente en la fase de Checkout.
            </Alert>

            {/* Modal de Edición */}
            <EditProfileModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                user={user}
                setUserFromRegistration={setUserFromRegistration}
            />

            {/* Modal de Cambio de Contraseña */}
            <ChangePasswordModal
                show={showPasswordModal}
                handleClose={() => setShowPasswordModal(false)}
                userId={user.id}
            />
        </Container>
    );
};

// --- EDIT MODAL COMPONENT ---

type UserContextType = AuthUser;

interface EditModalProps {
    show: boolean;
    handleClose: () => void;
    user: UserContextType;
    setUserFromRegistration: (userData: any) => void;
}

const EditProfileModal: React.FC<EditModalProps> = ({ show, handleClose, user, setUserFromRegistration }) => {
    // Inicializar con los datos actuales del usuario
    const initialAddress = user?.address ?? ({} as Address);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: user?.age ? user.age.toString() : '18',
        street: initialAddress.street,
        city: initialAddress.city,
        region: initialAddress.region,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Reinicializar el modal con los últimos datos al abrir
        if (show && user) {
            const currentAddress = user.address ?? ({} as Address);
            setFormData({
                name: user.name || '',
                age: user.age ? user.age.toString() : '18',
                street: currentAddress.street || '',
                city: currentAddress.city || '',
                region: currentAddress.region || '',
            });
            setError('');
        }
    }, [show, user]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            userId: user?.id,
            name: formData.name,
            age: parseInt(formData.age),
            address: {
                street: formData.street,
                city: formData.city,
                region: formData.region,
                zipCode: '',
            },
        };

        try {
            const res = await axios.put('/api/users/profile', payload);

            // Actualizar el estado global y localStorage
            setUserFromRegistration(res.data);
            handleClose();

        } catch (err: any) {
            const serverMsg = err.response?.data?.message || 'Error desconocido del servidor.';
            setError(`Error al actualizar: ${serverMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>Editar Dirección de Envío</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>

                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label>Nombre Completo</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled // 🔒 BLOQUEADO
                                    style={{ backgroundColor: '#333', color: '#aaa', cursor: 'not-allowed' }}
                                    title="El nombre no se puede editar"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="formAge">
                                <Form.Label>Edad</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min={18}
                                    disabled // 🔒 BLOQUEADO
                                    style={{ backgroundColor: '#333', color: '#aaa', cursor: 'not-allowed' }}
                                    title="La edad no se puede editar"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mt-3" style={{ color: '#39FF14' }}>Dirección de Envío (Chile)</h6>

                    <Form.Group className="mb-3" controlId="formStreet">
                        <Form.Label>Calle y Número</Form.Label>
                        <Form.Control type="text" name="street" value={formData.street} onChange={handleChange} required style={{ backgroundColor: '#333', color: 'white' }} />
                    </Form.Group>

                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="formCity">
                                <Form.Label>Ciudad</Form.Label>
                                <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required style={{ backgroundColor: '#333', color: 'white' }} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3" controlId="formRegion">
                                <Form.Label>Región</Form.Label>
                                <Form.Control type="text" name="region" value={formData.region} onChange={handleChange} required style={{ backgroundColor: '#333', color: 'white' }} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant="primary" type="submit" className="w-100 mt-4" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// --- CHANGE PASSWORD MODAL ---

interface ChangePasswordModalProps {
    show: boolean;
    handleClose: () => void;
    userId: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ show, handleClose, userId }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (show) {
            setNewPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('');
        }
    }, [show]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.put(`/api/users/${userId}/password`, { newPassword });
            setSuccess('Contraseña actualizada con éxito.');
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            setError('Error al actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>Cambiar Contraseña</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="confirmNewPassword">
                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>
                    <Button variant="warning" type="submit" className="w-100 mt-2" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ProfilePage;