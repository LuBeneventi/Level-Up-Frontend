import axios from 'axios';
import React, { useState, FormEvent, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    // 🚨 Usamos useState sin valor por defecto si es la versión final
    const [loginIdentifier, setLoginIdentifier] = useState('admin@levelup.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // 🚨 CORRECCIÓN CLAVE: Redirigir el usuario LOGUEADO SÓLO después del renderizado
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    // Si ya está logueado, retornamos null para evitar el renderizado
    if (isLoggedIn) {
        return null;
    }

    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const success = await login(loginIdentifier, password);

        if (success) {
            // El estado 'isLoggedIn' en useAuth cambiará, lo que activará el useEffect de arriba
            // y ejecutará navigate('/') de forma segura.
        } else {
            setError('Credenciales incorrectas. Intenta de nuevo.');
        }

        setLoading(false);
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-md-center">
                <Col xs={12} md={6}>
                    <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
                        <h2 className="text-center mb-4">Iniciar Sesión</h2>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={submitHandler}>
                            <Form.Group className="mb-3" controlId="loginIdentifier">
                                <Form.Label>Email o Nombre de Usuario</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingresa email o nombre"
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    required
                                    style={{ backgroundColor: '#222', color: 'white' }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="password">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ backgroundColor: '#222', color: 'white' }}
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-100"
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Iniciar Sesión'}
                            </Button>
                        </Form>

                        <Row className="py-3">
                            <Col className="text-center text-muted">
                                ¿No tienes cuenta? <Link to="/register" style={{ color: '#39FF14' }}>Regístrate</Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center">
                                <Button variant="link" onClick={() => setShowForgotModal(true)} style={{ color: '#1E90FF' }}>
                                    ¿Olvidaste tu contraseña?
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <ForgotPasswordModal show={showForgotModal} handleClose={() => setShowForgotModal(false)} />
        </Container>
    );
};

interface ForgotPasswordModalProps {
    show: boolean;
    handleClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, handleClose }) => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'Las contraseñas no coinciden.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await axios.post('/api/users/reset-password', { email, newPassword });
            setMessage({ type: 'success', text: 'Contraseña restablecida con éxito. Ahora puedes iniciar sesión.' });
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            setMessage({ type: 'danger', text: err.response?.data || 'Error al restablecer la contraseña.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#1E90FF' }}>Recuperar Contraseña</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Alert variant="info">
                    Por motivos de demostración, puedes restablecer tu contraseña directamente aquí ingresando tu correo.
                </Alert>
                {message && <Alert variant={message.type}>{message.text}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="resetEmail">
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Ingresa tu correo registrado"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="resetNewPassword">
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="resetConfirmPassword">
                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirma nueva contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default LoginPage;