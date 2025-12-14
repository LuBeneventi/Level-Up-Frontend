// level-up-gaming-frontend/src/pages/AdminRewardsPage.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form, Card, ButtonGroup } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, AlertTriangle, ToggleLeft, ToggleRight } from 'react-feather';
import { Link } from 'react-router-dom';
import { apiClient } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';

// ---------- Interfaces ----------
interface Reward {
    id: string;
    type: 'Producto' | 'Descuento' | 'Envio';
    name: string;
    pointsCost: number;
    description: string;
    isActive: boolean;
    season: string;
    imageUrl: string;
    discountType?: 'NONE' | 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    discountValue?: number;
    stock?: number | null;
    stockAvailable?: number | null;
}

// ---------- Constants ----------
const API_URL = '/rewards'; // Relative path, apiClient adds baseURL
const REWARD_TYPES: Reward['type'][] = ['Producto', 'Descuento', 'Envio'];
const REWARD_SEASONS = ['Standard', 'Halloween', 'Navidad', 'BlackFriday', 'Verano'];

// ---------- Main Component ----------
const AdminRewardsPage: React.FC = () => {
    // Data & UI state
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ msg: string; type: 'success' | 'danger' } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

    const [showToggleActiveModal, setShowToggleActiveModal] = useState(false);
    const [itemToToggle, setItemToToggle] = useState<{ id: string; name: string; isActive: boolean } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [pointsSortOrder, setPointsSortOrder] = useState<'asc' | 'desc' | ''>('');

    // ---------- API helpers ----------
    const fetchRewards = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get(`${API_URL}/admin`);
            setRewards(data.reverse());
            setError(null);
        } catch (err: any) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Sesión expirada o sin permisos. Por favor, recarga la página o inicia sesión nuevamente.');
            } else {
                setError('Error al cargar las recompensas. Asegúrate de que el Backend esté corriendo.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    const confirmDelete = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await apiClient.delete(`${API_URL}/${itemToDelete.id}/admin`);
            setRewards(rewards.filter(r => r.id !== itemToDelete.id));
            showStatus(`Recompensa "${itemToDelete.name}" eliminada.`, 'success');
        } catch (err: any) {
            showStatus('Fallo al eliminar la recompensa.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleEdit = (reward: Reward) => {
        setSelectedReward(reward);
    };

    const confirmToggleActive = (id: string, currentStatus: boolean, name: string) => {
        setItemToToggle({ id, name, isActive: currentStatus });
        setShowToggleActiveModal(true);
    };

    const executeToggleActive = async () => {
        if (!itemToToggle) return;
        const newStatus = !itemToToggle.isActive;
        try {
            const { data } = await apiClient.put<Reward>(`${API_URL}/${itemToToggle.id}/admin`, { isActive: newStatus });
            setRewards(prev => prev.map(r => (r.id === itemToToggle.id ? data : r)));
            showStatus(`Recompensa "${itemToToggle.name}" cambiada a: ${newStatus ? 'ACTIVA' : 'INACTIVA'}.`, 'success');
        } catch (err) {
            showStatus('Fallo al cambiar el estado de la recompensa.', 'danger');
        } finally {
            setShowToggleActiveModal(false);
            setItemToToggle(null);
        }
    };

    // ---------- Filtering & Sorting ----------
    const filteredAndSortedRewards = React.useMemo(() => {
        let filtered = [...rewards];
        if (searchTerm) {
            filtered = filtered.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (pointsSortOrder) {
            filtered.sort((a, b) => (pointsSortOrder === 'asc' ? a.pointsCost - b.pointsCost : b.pointsCost - a.pointsCost));
        }
        return filtered;
    }, [rewards, searchTerm, pointsSortOrder]);

    if (loading) return (
        <Container className="py-5 text-center"><Spinner animation="border" /></Container>
    );
    if (error) return (
        <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>
    );

    return (
        <AdminLayout>
            {/* Search & Sort */}
            <style>{`.admin-search-input::placeholder {color:#999;opacity:1;}`}</style>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin"><Button variant="outline-secondary" size="sm"><ArrowLeft size={16} className="me-2" /> Volver al Panel</Button></Link>
                <h1 style={{ color: '#1E90FF' }}>Gestión de Recompensas</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}><PlusCircle size={18} className="me-2" /> Nueva Recompensa</Button>
            </div>
            <Row className="mb-4 align-items-center">
                <Col md={5}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre de recompensa..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                        style={{ backgroundColor: '#333', color: 'white', borderColor: '#555' }}
                    />
                </Col>
                <Col md={7} className="text-md-end mt-2 mt-md-0">
                    <span className="me-3 text-muted">Ordenar por Costo:</span>
                    <ButtonGroup>
                        <Button variant={pointsSortOrder === 'asc' ? 'primary' : 'outline-secondary'} onClick={() => setPointsSortOrder(pointsSortOrder === 'asc' ? '' : 'asc')}>Ascendente</Button>
                        <Button variant={pointsSortOrder === 'desc' ? 'primary' : 'outline-secondary'} onClick={() => setPointsSortOrder(pointsSortOrder === 'desc' ? '' : 'desc')}>Descendente</Button>
                    </ButtonGroup>
                </Col>
            </Row>
            {statusMessage && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">{statusMessage.msg}</Alert>
            )}
            {/* Table for desktop */}
            <div className="table-responsive d-none d-md-block">
                <Table striped bordered hover className="table-dark" style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Costo (Ptos)</th>
                            <th>Tipo</th>
                            <th>Temporada</th>
                            <th>Activar/Desactivar</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedRewards.map(reward => (
                            <tr key={reward.id} className={!reward.isActive ? 'text-muted' : ''} style={{ opacity: reward.isActive ? 1 : 0.6 }}>
                                <td>{reward.name}</td>
                                <td>{reward.pointsCost}</td>
                                <td><Badge bg="info">{reward.type}</Badge></td>
                                <td><Badge bg={reward.season === 'Standard' ? 'secondary' : 'warning'}>{reward.season}</Badge></td>
                                <td><Badge bg={reward.isActive ? 'success' : 'secondary'}>{reward.isActive ? 'Activa' : 'Inactiva'}</Badge></td>
                                <td>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(reward)}><Edit size={14} /></Button>
                                    <Button
                                        variant={reward.isActive ? 'warning' : 'success'}
                                        size="sm"
                                        className="me-2"
                                        onClick={() => confirmToggleActive(reward.id, reward.isActive, reward.name)}
                                        title={reward.isActive ? 'Desactivar' : 'Activar'}
                                    >
                                        {reward.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => confirmDelete(reward.id, reward.name)}><Trash size={14} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            {/* Card view for mobile */}
            <Row className="d-block d-md-none g-3">
                {filteredAndSortedRewards.map(reward => (
                    <Col xs={12} key={reward.id}>
                        <Card style={{ backgroundColor: '#222', border: `1px solid ${reward.isActive ? '#1E90FF' : '#555'}`, color: 'white', opacity: reward.isActive ? 1 : 0.7 }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <h5 style={{ color: '#39FF14' }}>{reward.name}</h5>
                                    <Badge bg="info">{reward.type}</Badge>
                                </div>
                                <p className="text-muted small">{reward.description}</p>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Costo: <Badge bg="success">{reward.pointsCost} Pts</Badge></span>
                                    <span>Temporada: <Badge bg="secondary">{reward.season}</Badge></span>
                                </div>
                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => handleEdit(reward)}><Edit size={14} /> Editar</Button>
                                    <Button
                                        variant={reward.isActive ? 'warning' : 'success'}
                                        size="sm"
                                        onClick={() => confirmToggleActive(reward.id, reward.isActive, reward.name)}
                                    >
                                        {reward.isActive ? 'Desactivar' : 'Activar'}
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(reward.id, reward.name)}><Trash size={14} /> Eliminar</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            {/* Modals */}
            <RewardModal
                reward={selectedReward}
                show={showCreateModal || !!selectedReward}
                handleClose={() => { setSelectedReward(null); setShowCreateModal(false); }}
                fetchRewards={fetchRewards}
                showStatus={showStatus}
            />
            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={itemToDelete?.name || 'esta recompensa'}
            />
            <ConfirmToggleActiveModal
                show={showToggleActiveModal}
                handleClose={() => setShowToggleActiveModal(false)}
                handleConfirm={executeToggleActive}
                itemName={itemToToggle?.name || 'esta recompensa'}
                isActivating={!itemToToggle?.isActive}
            />
        </AdminLayout>
    );
};

export default AdminRewardsPage;

// ---------- Confirm Delete Modal ----------
interface ConfirmDeleteModalProps {
    show: boolean;
    handleClose: () => void;
    handleDelete: () => void;
    itemName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, handleClose, handleDelete, itemName }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#FF4444' }}>
            <Modal.Title style={{ color: '#FF4444' }}>
                <AlertTriangle size={24} className="me-2" /> Confirmar Eliminación
            </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
            <p>¿Estás seguro de que deseas eliminar <strong style={{ color: '#39FF14' }}>{itemName}</strong>?</p>
            <Alert variant="warning">Esta acción no se puede deshacer.</Alert>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#111' }}>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </Modal.Footer>
    </Modal>
);

// ---------- Confirm Toggle Active Modal ----------
interface ConfirmToggleActiveModalProps {
    show: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
    itemName: string;
    isActivating: boolean;
}

const ConfirmToggleActiveModal: React.FC<ConfirmToggleActiveModalProps> = ({ show, handleClose, handleConfirm, itemName, isActivating }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: isActivating ? '#39FF14' : '#FFC107' }}>
            <Modal.Title style={{ color: isActivating ? '#39FF14' : '#FFC107' }}>
                <AlertTriangle size={24} className="me-2" /> Confirmar {isActivating ? 'Activación' : 'Desactivación'}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
            <p>¿Estás seguro de que deseas <strong>{isActivating ? 'ACTIVAR' : 'DESACTIVAR'}</strong> la recompensa <strong style={{ color: '#39FF14' }}>{itemName}</strong>?</p>
            <Alert variant={isActivating ? 'success' : 'warning'} className="mt-3">
                {isActivating ? 'La recompensa volverá a ser visible para los usuarios.' : 'La recompensa se ocultará de la tienda de canje.'}
            </Alert>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#111' }}>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant={isActivating ? 'success' : 'warning'} onClick={handleConfirm}>Sí, {isActivating ? 'Activar' : 'Desactivar'}</Button>
        </Modal.Footer>
    </Modal>
);

// ---------- Reward Modal (Create / Edit) ----------
interface RewardModalProps {
    reward: Reward | null;
    show: boolean;
    handleClose: () => void;
    fetchRewards: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ reward, show, handleClose, fetchRewards, showStatus }) => {
    const isEditing = !!reward;
    const [formData, setFormData] = useState({
        name: reward?.name || '',
        type: reward?.type || 'Producto' as Reward['type'],
        pointsCost: reward?.pointsCost || 0,
        description: reward?.description || '',
        isActive: reward?.isActive ?? true,
        season: reward?.season || 'Standard',
        imageUrl: reward?.imageUrl || '',
        discountType: reward?.discountType || 'NONE',
        discountValue: reward?.discountValue || 0,
        stock: reward?.stock ?? null,
        stockAvailable: reward?.stockAvailable ?? null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(reward?.imageUrl || null);

    useEffect(() => {
        if (reward) {
            setFormData({
                name: reward.name,
                type: reward.type,
                pointsCost: reward.pointsCost,
                description: reward.description,
                isActive: reward.isActive,
                season: reward.season,
                imageUrl: reward.imageUrl,
                discountType: reward.discountType || 'NONE',
                discountValue: reward.discountValue || 0,
                stock: reward.stock ?? null,
                stockAvailable: reward.stockAvailable ?? null,
            });
            setPreviewUrl(reward.imageUrl || null);
        } else {
            setFormData({
                name: '',
                type: 'Producto' as Reward['type'],
                pointsCost: 0,
                description: '',
                isActive: true,
                season: 'Standard',
                imageUrl: '',
                discountType: 'NONE',
                discountValue: 0,
                stock: null,
                stockAvailable: null,
            });
            setPreviewUrl(null);
        }
        setError(null);
    }, [reward, show]);

    const updateFormData = (e: React.ChangeEvent<any>) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            const newData: any = { ...prev };

            if (type === 'checkbox') {
                newData[name] = checked;
            } else if (name === 'pointsCost') {
                newData[name] = value === '' ? 0 : parseInt(value) || 0;
            } else if (name === 'stock' || name === 'stockAvailable') {
                newData[name] = value === '' ? null : parseInt(value);
            } else if (name === 'discountValue') {
                // Handle percentage input: user types 15, we store 0.15
                const rawVal = value === '' ? 0 : parseFloat(value);
                if (prev.discountType === 'PERCENTAGE') {
                    // Avoid floating point issues by rounding if needed, but simple division is usually ok
                    newData[name] = rawVal / 100;
                } else {
                    newData[name] = rawVal;
                }
            } else {
                newData[name] = value;
            }

            // Handle Type logic changes
            if (name === 'type') {
                if (value === 'Producto') {
                    newData.discountType = 'NONE';
                    newData.discountValue = 0;
                } else if (value === 'Envio') {
                    newData.discountType = 'FREE_SHIPPING';
                    newData.discountValue = 0;
                } else if (value === 'Descuento') {
                    // If switching to Descuento, default to PERCENTAGE if it was NONE
                    if (newData.discountType === 'NONE' || newData.discountType === 'FREE_SHIPPING') {
                        newData.discountType = 'PERCENTAGE';
                        newData.discountValue = 0;
                    }
                }
            }

            // If discount type changes, reset value if it doesn't make sense
            if (name === 'discountType') {
                if (value === 'NONE' || value === 'FREE_SHIPPING') {
                    newData.discountValue = 0;
                } else {
                    // If switching between Percentage and Fixed Amount, value might need reset or keeping
                    // We'll keep it but it might look weird (e.g. 0.15 -> $0.15). User can edit.
                    // But if we switch FROM percentage (0.15) TO fixed, it becomes $0.15 which is weird.
                    // Let's reset to 0 to be safe.
                    newData.discountValue = 0;
                }
            }

            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, imageUrl: base64String }));
                setPreviewUrl(base64String);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(reward?.imageUrl || null);
            setFormData(prev => ({ ...prev, imageUrl: reward?.imageUrl || '' }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if (formData.pointsCost < 1) {
            setError('El costo debe ser mayor a 0 puntos.');
            setLoading(false);
            return;
        }
        if (formData.name.length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.');
            setLoading(false);
            return;
        }

        // Ensure stock is null if empty string (already handled in updateFormData but good to double check)
        const payload = {
            ...formData,
            stock: formData.stock === null || formData.stock === undefined ? null : formData.stock,
            stockAvailable: formData.stockAvailable === null || formData.stockAvailable === undefined ? null : formData.stockAvailable
        };

        const url = isEditing ? `${API_URL}/${reward!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';
        try {
            await apiClient({ method, url, data: payload });
            fetchRewards();
            handleClose();
            showStatus(`Recompensa "${formData.name}" ${isEditing ? 'actualizada' : 'creada'} con éxito.`, 'success');
        } catch (err: any) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('No tienes permisos para realizar esta acción o tu sesión ha expirado. Intenta iniciar sesión nuevamente.');
            } else {
                setError(err.response?.data?.message || `Fallo al ${isEditing ? 'actualizar' : 'crear'} la recompensa.`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper to get display value for discount
    const getDiscountDisplayValue = () => {
        if (formData.discountType === 'PERCENTAGE') {
            // If value is 0.15, display 15
            return formData.discountValue ? parseFloat((formData.discountValue * 100).toFixed(2)) : '';
        }
        return formData.discountValue === 0 ? '' : formData.discountValue;
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>{isEditing ? 'Editar Recompensa' : 'Crear Nueva Recompensa'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    {/* Nombre */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }} />
                    </Form.Group>
                    <Row>
                        {/* Costo */}
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Costo en Puntos</Form.Label>
                                <Form.Control type="number" name="pointsCost" value={formData.pointsCost} min={1} required onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} />
                            </Form.Group>
                        </Col>
                        {/* Tipo */}
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo de Recompensa</Form.Label>
                                <Form.Select name="type" value={formData.type} required onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }}>
                                    {REWARD_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {/* Temporada */}
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Temporada</Form.Label>
                                <Form.Select name="season" value={formData.season} required onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }}>
                                    {REWARD_SEASONS.map(s => (<option key={s} value={s}>{s}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Descripción */}
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control as="textarea" name="description" rows={3} value={formData.description} required onChange={updateFormData} style={{ backgroundColor: '#333', color: 'white' }} />
                    </Form.Group>

                    {/* Descuento Section - Only show if applicable */}
                    {(formData.type === 'Descuento' || formData.type === 'Envio') && (
                        <>
                            <h6 className="mb-3 mt-4 border-top pt-3" style={{ color: '#39FF14' }}>Configuración de Descuento</h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo de Descuento</Form.Label>
                                        <Form.Select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={updateFormData}
                                            style={{ backgroundColor: '#333', color: 'white' }}
                                            disabled={formData.type === 'Envio'} // Envio implies FREE_SHIPPING usually
                                        >
                                            {formData.type === 'Descuento' && (
                                                <>
                                                    <option value="PERCENTAGE">Porcentaje (%)</option>
                                                    <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
                                                </>
                                            )}
                                            {formData.type === 'Envio' && (
                                                <option value="FREE_SHIPPING">Envío Gratis</option>
                                            )}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Valor del Descuento</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="discountValue"
                                            value={getDiscountDisplayValue()}
                                            onChange={updateFormData}
                                            disabled={formData.discountType === 'NONE' || formData.discountType === 'FREE_SHIPPING'}
                                            style={{ backgroundColor: '#333', color: 'white' }}
                                            step="any"
                                        />
                                        <Form.Text className="text-muted">
                                            {formData.discountType === 'PERCENTAGE' ? 'Ingresa el porcentaje (Ej: 15 para 15%)' : formData.discountType === 'FIXED_AMOUNT' ? 'Ej: 5000 para $5000' : 'No aplica para este tipo'}
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* Stock */}
                    <h6 className="mb-3 mt-4 border-top pt-3" style={{ color: '#39FF14' }}>Control de Stock</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock Total</Form.Label>
                                <Form.Control type="number" name="stock" value={formData.stock ?? ''} onChange={updateFormData} placeholder="Dejar vacío para ilimitado" style={{ backgroundColor: '#333', color: 'white' }} />
                                <Form.Text className="text-muted">Cantidad total de unidades disponibles (vacío = ilimitado)</Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock Disponible</Form.Label>
                                <Form.Control type="number" name="stockAvailable" value={formData.stockAvailable ?? ''} onChange={updateFormData} placeholder="Dejar vacío para ilimitado" style={{ backgroundColor: '#333', color: 'white' }} />
                                <Form.Text className="text-muted">Cantidad actual disponible para canjear</Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Imagen */}
                    <h6 className="mb-3 mt-4 border-top pt-3" style={{ color: '#39FF14' }}>Imagen</h6>
                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Imagen (Archivo)</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
                                <Form.Text className="text-muted">Se recomienda cargar un archivo local.</Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>URL Imagen (Respaldo)</Form.Label>
                                <Form.Control type="text" name="imageUrl" value={formData.imageUrl} onChange={updateFormData} disabled={formData.imageUrl.startsWith('data:image')} style={{ backgroundColor: '#333', color: 'white' }} />
                            </Form.Group>
                        </Col>
                        {previewUrl && (
                            <Col xs={12} className="text-center mt-3">
                                <img src={previewUrl} alt="preview" style={{ maxWidth: '100px', maxHeight: '100px' }} className="rounded shadow" />
                            </Col>
                        )}
                    </Row>
                    {/* Activa */}
                    <Form.Group className="mb-4">
                        <Form.Check type="checkbox" label="Recompensa Activa" name="isActive" checked={formData.isActive} onChange={updateFormData} />
                    </Form.Group>
                    <Button type="submit" variant="success" className="w-100" disabled={loading}>
                        {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Recompensa'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
