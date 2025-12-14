// level-up-gaming-frontend/src/pages/AdminUsersPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form, Card, ButtonGroup } from 'react-bootstrap';
import { Edit, ArrowLeft, PlusCircle, AlertTriangle, UserX } from 'react-feather';
import { Link } from 'react-router-dom';
// Eliminamos: import axios from 'axios';
// Eliminamos: import CHILEAN_REGIONS_DATA from '../data/chile_regions.json';

import AdminLayout from '../layouts/AdminLayout';

// Importamos tipos y servicios
import { User, UserRole, UserUpdatePayload, UserCreatePayload } from '../types/User';
import { StatusMessage } from '../types/StatusMessage';
import AdminUserService from '../services/AdminUserService';
import * as UserUtils from '../utils/userUtils'; // Importamos utilidades (RUT, Regiones)


// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE USUARIOS
// ----------------------------------------------------

const AdminUsersPage: React.FC = () => {
    // Usamos el tipo User importado
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

    // ESTADOS PARA EL MODAL DE DESACTIVACIÓN
    const [showDeactivationModal, setShowDeactivationModal] = useState(false);
    const [userToToggle, setUserToToggle] = useState<User | null>(null);

    // Estados para búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');


    // Función de Servicio Refactorizada
    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await AdminUserService.fetchUsers();
            setUsers(data);
            setError(null);
        } catch (err: any) {
            setError('Error al cargar la lista. Asegúrate de estar logueado como Administrador.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    // Función que abre el modal de confirmación de desactivación
    const confirmDeactivation = (user: User) => {
        if (user.id === 'u1') { // Asumo 'u1' como ID de administrador principal no modificable
            showStatus('¡ERROR! No puedes modificar al administrador principal.', 'danger');
            return;
        }
        setUserToToggle(user);
        setShowDeactivationModal(true);
    };

    // FUNCIÓN CRÍTICA: Ejecuta la DESACTIVACIÓN (o Reactivación) - Refactorizada
    const handleToggleStatus = async () => {
        if (!userToToggle) return;

        const newStatus = !userToToggle.isActive;

        try {
            await AdminUserService.toggleUserStatus(userToToggle.id, newStatus);

            setUsers(users.map(u => u.id === userToToggle.id ? { ...u, isActive: newStatus } : u));
            showStatus(`Usuario ${userToToggle.name} ha sido ${newStatus ? 'REACTIVADO' : 'DESACTIVADO'}.`, 'success');

        } catch (err: any) {
            showStatus('Fallo al cambiar el estado del usuario.', 'danger');
        } finally {
            setShowDeactivationModal(false);
            setUserToToggle(null);
        }
    };

    // Lógica para filtrar usuarios
    const filteredUsers = React.useMemo(() => {
        let filtered = [...users];

        // 1. Filtrar por RUT (searchTerm)
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.rut.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Filtrar por rol
        if (roleFilter) {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        return filtered;
    }, [users, searchTerm, roleFilter]);


    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <AdminLayout>
            {/* Estilo para el placeholder del buscador */}
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
                <h1 style={{ color: '#1E90FF' }}>Gestión de Usuarios</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2" /> Nuevo Usuario
                </Button>
            </div>

            {/* Fila de filtros */}
            <Row className="mb-4 align-items-center">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por RUT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                        style={{ backgroundColor: '#333', color: 'white', borderColor: '#555' }}
                    />
                </Col>
                <Col md={8} className="text-md-end mt-2 mt-md-0">
                    <span className="me-3 text-muted">Filtrar por Rol:</span>
                    <ButtonGroup>
                        <Button variant={roleFilter === 'admin' ? 'danger' : 'outline-danger'} onClick={() => setRoleFilter(roleFilter === 'admin' ? '' : 'admin' as UserRole)}>
                            Admin
                        </Button>
                        <Button variant={roleFilter === 'seller' ? 'warning' : 'outline-warning'} onClick={() => setRoleFilter(roleFilter === 'seller' ? '' : 'seller' as UserRole)}>
                            Vendedor
                        </Button>
                        <Button variant={roleFilter === 'customer' ? 'primary' : 'outline-primary'} onClick={() => setRoleFilter(roleFilter === 'customer' ? '' : 'customer' as UserRole)}>
                            Cliente
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* VISTA 1: TABLA COMPLETA (Escritorio/Tablet) */}
            <div className="table-responsive d-none d-md-block">
                <Table striped bordered hover className="table-dark" style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>RUT</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Puntos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className={!user.isActive ? 'text-muted' : ''}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className="text-muted">{user.rut}</td>
                                <td><Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>{user.role.toUpperCase()}</Badge></td>
                                <td><Badge bg={user.isActive ? 'success' : 'secondary'}>{user.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                                <td>{user.points}</td>
                                <td>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => setSelectedUser(user)}><Edit size={14} /></Button>
                                    <Button variant={user.isActive ? 'danger' : 'success'} size="sm" onClick={() => confirmDeactivation(user)} disabled={user.role === 'admin'}>
                                        {user.isActive ? <UserX size={14} /> : 'Activar'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>


            {/* VISTA 2: TARJETAS APILADAS (Móvil) */}
            <Row className="d-block d-md-none g-3">
                {filteredUsers.map((user) => (
                    <Col xs={12} key={user.id}>
                        <Card style={{ backgroundColor: '#222', border: `1px solid ${user.isActive ? '#1E90FF' : '#555'}`, color: 'white' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <h5 className="mb-0" style={{ color: '#39FF14' }}>{user.name}</h5>
                                    <Badge bg={user.isActive ? 'success' : 'secondary'}>{user.isActive ? 'Activo' : 'Inactivo'}</Badge>
                                </div>
                                <p className="text-muted small mb-1">{user.email}</p>
                                <hr style={{ borderColor: '#444' }} />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Rol: <Badge bg="primary">{user.role.toUpperCase()}</Badge></span>
                                    <span>Puntos: <Badge bg="warning" text="dark">{user.points}</Badge></span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <small className="text-muted">RUT: {user.rut}</small>
                                    <small>Rol: <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>{user.role.toUpperCase()}</Badge></small>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => setSelectedUser(user)}>
                                        <Edit size={14} className="me-1" /> Editar Datos
                                    </Button>
                                    <Button variant={user.isActive ? 'danger' : 'success'} size="sm" onClick={() => confirmDeactivation(user)} disabled={user.role === 'admin'}>
                                        {user.isActive ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modales */}
            <UserEditModal
                user={selectedUser}
                handleClose={() => setSelectedUser(null)}
                fetchUsers={loadUsers}
                showStatus={showStatus}
            />

            <UserCreateModal
                show={showCreateModal}
                handleClose={() => setShowCreateModal(false)}
                fetchUsers={loadUsers}
                showStatus={showStatus}
            />

            <ConfirmDeactivationModal
                show={showDeactivationModal}
                handleClose={() => setShowDeactivationModal(false)}
                handleDeactivate={handleToggleStatus} // Llama a la función de toggle
                userName={userToToggle?.name || 'este usuario'}
                currentStatus={userToToggle?.isActive || false}
            />

        </AdminLayout>
    );
};

export default AdminUsersPage;


// ----------------------------------------------------
// COMPONENTES MODAL AUXILIARES (REFRACTORIZADOS)
// ----------------------------------------------------

// Interfaces auxiliares
interface EditModalProps { user: User | null; handleClose: () => void; fetchUsers: () => void; showStatus: (msg: string, type: 'success' | 'danger') => void; }
interface CreateModalProps { show: boolean; handleClose: () => void; fetchUsers: () => void; showStatus: (msg: string, type: 'success' | 'danger') => void; }
interface ConfirmDeactivationModalProps { show: boolean; handleClose: () => void; handleDeactivate: () => void; userName: string; currentStatus: boolean; }


// Componente de Edición (UserEditModal)
const UserEditModal: React.FC<EditModalProps> = ({ user, handleClose, fetchUsers, showStatus }) => {
    // Usamos el tipo UserRole del tipo User, pero lo redefinimos localmente para el formulario
    const [formData, setFormData] = useState<any>({
        name: user?.name || '', email: user?.email || '', role: user?.role || 'customer' as UserRole,
        rut: user?.rut || '', age: user?.age ? user.age.toString() : '0', street: user?.address?.street || '', city: user?.address?.city || '', region: user?.address?.region || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableCommunes, setAvailableCommunes] = useState<string[]>([]); // Estado para Comunas


    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                rut: user.rut,
                age: user.age?.toString() || '0',
                street: user.address?.street || '',
                city: user.address?.city || '',
                region: user.address?.region || ''
            });
            setError(null);
        }
    }, [user]);

    // EFECTO PARA CARGAR LAS COMUNAS AL CAMBIAR LA REGIÓN (Usa UserUtils)
    useEffect(() => {
        // Usamos la función de utilidad refactorizada
        const communes = UserUtils.getCommunesByRegionName(formData.region);
        setAvailableCommunes(communes);
        // Si la comuna actual no está en la nueva lista, la reseteamos
        if (formData.region && !communes.includes(formData.city)) {
            setFormData((prev: any) => ({ ...prev, city: '' }));
        }
    }, [formData.region, formData.city]); // Incluimos city para re-evaluar si se limpia

    if (!user) return null;
    const disableRoleChange = user.id === 'u1'; // Asumo 'u1' como ID de administrador principal

    // Handler que extrae name/value del evento y actualiza (Versión estable)
    const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'rut' && value.length > 9) return;
        if (name === 'age' && parseInt(value) > 95) return;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    // Lógica de Servicio Refactorizada
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); setLoading(true); setError(null);
        // Usamos la función de utilidad refactorizada
        if (!UserUtils.validateRut(formData.rut)) { setError('El RUT ingresado es inválido.'); setLoading(false); return; }
        if (parseInt(formData.age) < 18 || parseInt(formData.age) > 95) { setError('La edad debe estar entre 18 y 95 años.'); setLoading(false); return; }

        try {
            // Creamos el payload tipado
            const payload: UserUpdatePayload = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                rut: formData.rut,
                age: parseInt(formData.age),
                address: { street: formData.street, city: formData.city, region: formData.region, zipCode: '', }
            };

            // Usamos la función de servicio
            await AdminUserService.updateUser(user.id, payload);
            fetchUsers(); handleClose(); showStatus(`Usuario ${user.name} actualizado con éxito.`, 'success');
        } catch (err: any) { setError(err.response?.data?.message || 'Fallo al actualizar el usuario.'); } finally { setLoading(false); }
    };

    return (
        <Modal show={!!user} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}><Modal.Title style={{ color: '#1E90FF' }}>Editar Usuario: {user.name}</Modal.Title></Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <h6 className="mb-3" style={{ color: '#39FF14' }}>Datos Principales</h6>

                    {/* GRUPO 1: NOMBRE, EMAIL */}
                    <Row>
                        <Col md={6} xs={12}><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                        <Col md={6} xs={12}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                    </Row>

                    {/* GRUPO 2: RUT, EDAD, ROL */}
                    <Row>
                        <Col md={4} xs={12}><Form.Group className="mb-3"><Form.Label>RUT</Form.Label><Form.Control type="text" name="rut" value={formData.rut} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                        <Col md={2} xs={12}><Form.Group className="mb-3"><Form.Label>Edad</Form.Label><Form.Control type="number" name="age" value={formData.age} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Rol del Sistema</Form.Label>
                                <Form.Select name="role" value={formData.role} onChange={updateFormData} disabled={disableRoleChange} style={{ backgroundColor: '#333', color: 'white' }}>
                                    <option value="customer">Cliente</option>
                                    <option value="seller">Vendedor</option>
                                    <option value="admin">Administrador</option>
                                </Form.Select>
                                {disableRoleChange && <Form.Text className="text-danger">No puedes cambiar el rol del administrador principal.</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mb-3 mt-3" style={{ color: '#39FF14' }}>Dirección de Envío</h6>
                    <Form.Group className="mb-3"><Form.Label>Calle</Form.Label><Form.Control type="text" name="street" value={formData.street} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group>

                    {/* GRUPO 3: REGIÓN, COMUNA */}
                    <Row>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Región</Form.Label>
                                <Form.Select name="region" value={formData.region} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}>
                                    <option value="">Seleccionar Región</option>
                                    {/* Usamos la constante del servicio de utilidades */}
                                    {UserUtils.CHILEAN_REGIONS.map((reg: string) => (<option key={reg} value={reg}>{reg}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ciudad / Comuna</Form.Label>
                                <Form.Select name="city" value={formData.city} onChange={updateFormData} required disabled={availableCommunes.length === 0} style={{ backgroundColor: '#333', color: 'white' }}>
                                    <option value="">Seleccionar Comuna</option>
                                    {availableCommunes.map(city => (<option key={city} value={city}>{city}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// Componente de Creación (UserCreateModal)
const UserCreateModal: React.FC<CreateModalProps> = ({ show, handleClose, fetchUsers, showStatus }) => {
    // Usamos el tipo UserRole importado
    const [formData, setFormData] = useState<any>({ name: '', email: '', password: '', role: 'customer' as UserRole, rut: '', age: '0', street: '', city: '', region: '', });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableCommunes, setAvailableCommunes] = useState<string[]>([]); // Estado para Comunas


    useEffect(() => {
        if (!show) { setFormData({ name: '', email: '', password: '', role: 'customer', rut: '', age: '0', street: '', city: '', region: '' }); setError(null); }
    }, [show]);

    // EFECTO PARA CARGAR LAS COMUNAS AL CAMBIAR LA REGIÓN (Usa UserUtils)
    useEffect(() => {
        // Usamos la función de utilidad refactorizada
        const communes = UserUtils.getCommunesByRegionName(formData.region);
        setAvailableCommunes(communes);
    }, [formData.region]);


    // Handler que extrae name/value del evento y actualiza
    const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'rut' && value.length > 9) return;
        if (name === 'age' && parseInt(value) > 95) return;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    // Lógica de Servicio Refactorizada
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); setLoading(true); setError(null);
        // Usamos la función de utilidad refactorizada
        if (!UserUtils.validateRut(formData.rut)) { setError('El RUT ingresado es inválido.'); setLoading(false); return; }
        if (parseInt(formData.age) < 18 || parseInt(formData.age) > 95) { setError('La edad debe estar entre 18 y 95 años.'); setLoading(false); return; }
        if (formData.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }

        try {
            // Creamos el payload tipado correctamente (sin campos de dirección duplicados)
            const { street, city, region, password, ...baseData } = formData;
            const payload: UserCreatePayload = {
                ...baseData,
                password,
                age: parseInt(formData.age),
                address: { street, city, region, zipCode: '' },
            };

            // Enviamos el payload al servicio
            await AdminUserService.createUser(payload); fetchUsers(); handleClose(); showStatus(`Usuario ${formData.name} creado con éxito.`, 'success');
        } catch (err: any) { setError(err.response?.data?.message || 'Fallo al crear el usuario. El email podría estar duplicado.'); } finally { setLoading(false); }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}><Modal.Title style={{ color: '#39FF14' }}>Crear Nuevo Usuario</Modal.Title></Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <h6 className="mb-3" style={{ color: '#39FF14' }}>Información de Cuenta</h6>

                    {/* GRUPO 1: NOMBRE, EMAIL */}
                    <Row>
                        <Col md={6} xs={12}><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                        <Col md={6} xs={12}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col></Row>

                    {/* GRUPO 2: CONTRASÑA, RUT, EDAD */}
                    <Row>
                        <Col md={6} xs={12}><Form.Group className="mb-3"><Form.Label>Contraseña Inicial</Form.Label><Form.Control type="password" name="password" value={formData.password} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                        <Col md={3} xs={6}><Form.Group className="mb-3"><Form.Label>RUT</Form.Label><Form.Control type="text" name="rut" value={formData.rut} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                        <Col md={3} xs={6}><Form.Group className="mb-3"><Form.Label>Edad</Form.Label><Form.Control type="number" name="age" value={formData.age} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group></Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label>Rol</Form.Label>
                        <Form.Select name="role" value={formData.role} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }}>
                            <option value="customer">Cliente</option>
                            <option value="seller">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </Form.Select>
                    </Form.Group>

                    <h6 className="mb-3 mt-4 border-top pt-3" style={{ color: '#39FF14' }}>Dirección Inicial</h6>
                    <Form.Group className="mb-3"><Form.Label>Calle</Form.Label><Form.Control type="text" name="street" value={formData.street} onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} /></Form.Group>
                    <Row>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Región</Form.Label>
                                <Form.Select name="region" value={formData.region} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}>
                                    <option value="">Seleccionar Región</option>
                                    {/* Usamos la constante del servicio de utilidades */}
                                    {UserUtils.CHILEAN_REGIONS.map((reg: string) => (<option key={reg} value={reg}>{reg}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ciudad / Comuna</Form.Label>
                                <Form.Select name="city" value={formData.city} onChange={updateFormData} required disabled={availableCommunes.length === 0} style={{ backgroundColor: '#333', color: 'white' }}>
                                    <option value="">Seleccionar Comuna</option>
                                    {availableCommunes.map(city => (<option key={city} value={city}>{city}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant="success" className="w-100 mt-3" disabled={loading}>{loading ? 'Creando...' : 'Crear Usuario'}</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// Componente de Confirmación de Desactivación (no se toca, solo usa tipos)
const ConfirmDeactivationModal: React.FC<ConfirmDeactivationModalProps> = ({ show, handleClose, handleDeactivate, userName, currentStatus }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: currentStatus ? '#FF4444' : '#39FF14' }}>
                <Modal.Title style={{ color: currentStatus ? '#FF4444' : '#39FF14' }}>
                    <AlertTriangle size={24} className="me-2" /> Confirmar {currentStatus ? 'Desactivación' : 'Reactivación'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <p>
                    ¿Estás seguro de que deseas **{currentStatus ? 'DESACTIVAR' : 'REACTIVAR'}** la cuenta de{' '}
                    <strong style={{ color: '#39FF14' }}>{userName}</strong>?
                </p>
                <Alert variant={currentStatus ? 'danger' : 'success'} className="mt-3">
                    {currentStatus ? 'ADVERTENCIA: La cuenta no podrá iniciar sesión. (Historial se mantiene).' : 'La cuenta podrá iniciar sesión inmediatamente.'}
                </Alert>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: '#111' }}>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant={currentStatus ? 'danger' : 'success'} onClick={handleDeactivate}>
                    {currentStatus ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};