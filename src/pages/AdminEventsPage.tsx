// level-up-gaming-frontend/src/pages/AdminEventsPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Alert, Spinner, Badge, Button, Modal, Row, Col, Form, Card, ButtonGroup } from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, Calendar, MapPin, AlertTriangle, Eye, Hash } from 'react-feather'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';


// Interfaces (deben coincidir con el Backend)
interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    location: string;
    mapEmbed: string;
    mapUrl?: string; // 🚨 NUEVO: URL para el botón "Ver Mapa"
    notes?: string;
}

const API_URL = '/api/events';

import { ALL_REGIONS_DATA, getCommunesByRegionName } from '../utils/regionUtils';


// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE EVENTOS
// ----------------------------------------------------

const AdminEventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); 
    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [statusMessage, setStatusMessage] = useState<{ msg: string, type: 'success' | 'danger' } | null>(null);
    
    // ESTADOS PARA MODALES
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<{ id: string, title: string } | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // 🚨 NUEVO: Estados para búsqueda y ordenamiento
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | ''>('newest');


    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL); 
            setEvents(data.reverse()); 
            setError(null);
        } catch (err: any) {
            setError('Error al cargar los eventos. Asegúrate de que el Backend esté corriendo en :5000.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);
    
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 5000); 
    };

    const confirmDelete = (id: string, title: string) => {
        setEventToDelete({ id, title });
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!eventToDelete) return;
        
        try {
            await axios.delete(`${API_URL}/${eventToDelete.id}/admin`); 
            setEvents(events.filter(e => e.id !== eventToDelete.id));
            showStatus(`Evento "${eventToDelete.title}" eliminado con éxito.`, 'success');
            
        } catch (err: any) {
            showStatus('Fallo al eliminar el evento.', 'danger');
        } finally {
            setShowDeleteModal(false);
            setEventToDelete(null);
        }
    };
    
    const handleEdit = (event: Event) => {
        setSelectedEvent(event);
    };
    
    const handleShowDetails = (event: Event) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    // 🚨 NUEVO: Lógica para filtrar y ordenar eventos
    const filteredAndSortedEvents = React.useMemo(() => {
        let filtered = [...events];

        // 1. Filtrar por título
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Ordenar por fecha
        if (sortOrder) {
            filtered.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (sortOrder === 'newest') {
                    return dateB - dateA;
                } else { // 'oldest'
                    return dateA - dateB;
                }
            });
        }

        return filtered;
    }, [events, searchTerm, sortOrder]);


    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    
    return (
        <AdminLayout>
            <style>{`.admin-search-input::placeholder { color: #999; opacity: 1; }`}</style>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2" /> Volver al Panel
                    </Button>
                </Link>
                <div style={{ visibility: 'hidden', width: '150px' }}></div> 
                <h1 style={{ color: '#1E90FF' }}>Gestión de Eventos</h1>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2"/> Nuevo Evento
                </Button>
            </div>
            
            {/* 🚨 NUEVO: Fila de filtros */}
            <Row className="mb-4 align-items-center">
                <Col md={5}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre de evento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                        style={{ backgroundColor: '#333', color: 'white', borderColor: '#555' }}
                    />
                </Col>
                <Col md={7} className="text-md-end mt-2 mt-md-0">
                    <span className="me-3 text-muted">Ordenar por Fecha:</span>
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
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage(null)} dismissible className="mb-4">
                    {statusMessage.msg}
                </Alert>
            )}

            {/* VISTA 1: TABLA COMPLETA (Escritorio/Tablet) */}
            <div className="table-responsive d-none d-md-block"> 
                <Table striped bordered hover className="table-dark" style={{ backgroundColor: '#111', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Fecha</th>
                            <th>Ubicación (Región)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedEvents.map((event) => (
                            <tr key={event.id}>
                                <td style={{ color: 'white' }}>{event.title}</td>
                                <td>{new Date(event.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })} a las {event.time} hrs</td>
                                <td><MapPin size={14} className="me-1"/>{event.location}</td>
                                <td>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(event)}><Edit size={14} /></Button>
                                    <Button variant="secondary" size="sm" className="me-2" onClick={() => handleShowDetails(event)}><Eye size={14} /></Button>
                                    <Button variant="danger" size="sm" onClick={() => confirmDelete(event.id, event.title)}><Trash size={14} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* 🚨 VISTA 2: TARJETAS APILADAS (Móvil) */}
            <Row className="d-block d-md-none g-3">
                {filteredAndSortedEvents.map((event) => (
                    <Col xs={12} key={event.id}>
                        <Card style={{ backgroundColor: '#222', border: '1px solid #1E90FF', color: 'white' }}>
                            <Card.Body>
                                <Card.Title style={{ color: '#39FF14' }}>{event.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted small">
                                    🗓️ {new Date(event.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })} a las {event.time} hrs
                                </Card.Subtitle>
                                <hr style={{ borderColor: '#444' }}/>
                                <p className="mb-3"><MapPin size={16} className="me-1"/> Ubicación: <strong>{event.location}</strong></p>

                                <div className="d-grid gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => handleShowDetails(event)}><Eye size={14} className="me-1"/> Ver Notas</Button>
                                    <Button variant="info" size="sm" onClick={() => handleEdit(event)}><Edit size={14} className="me-1"/> Editar</Button>
                                    <Button variant="danger" size="sm" onClick={() => confirmDelete(event.id, event.title)}><Trash size={14} className="me-1"/> Eliminar</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>


            {/* Modal de Creación/Edición */}
            <EventModal
                event={selectedEvent} 
                show={showCreateModal || (!!selectedEvent && !showDetailsModal)}
                handleClose={() => { setSelectedEvent(null); setShowCreateModal(false); }}
                fetchEvents={fetchEvents}
                showStatus={showStatus}
            />
            
            {/* Modal de Confirmación de Eliminación */}
            <ConfirmDeleteModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={eventToDelete?.title || 'este evento'}
            />
            
            {/* 🚨 Modal de Detalles (Muestra las Notas) */}
            <EventDetailsModal
                event={selectedEvent}
                show={showDetailsModal}
                handleClose={() => { setSelectedEvent(null); setShowDetailsModal(false); }}
            />
        </AdminLayout>
    );
};

export default AdminEventsPage;


// ----------------------------------------------------
// COMPONENTES MODAL AUXILIARES
// ----------------------------------------------------

// Modal de Confirmación de Eliminación
interface ConfirmDeleteModalProps { show: boolean; handleClose: () => void; handleDelete: () => void; itemName: string; }

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, handleClose, handleDelete, itemName }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#FF4444' }}><Modal.Title style={{ color: '#FF4444' }}><AlertTriangle size={24} className="me-2"/> Confirmar Eliminación</Modal.Title></Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}><p>¿Estás seguro de que deseas eliminar a <strong style={{ color: '#39FF14' }}>{itemName}</strong>?</p><Alert variant="warning" className="mt-3">Esta acción no se puede deshacer.</Alert></Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#111' }}><Button variant="secondary" onClick={handleClose}>Cancelar</Button><Button variant="danger" onClick={handleDelete}>Eliminar</Button></Modal.Footer>
        </Modal>
    );
};


// Modal de Detalles y Notas (Para Eventos)
interface EventDetailsModalProps { event: Event | null; show: boolean; handleClose: () => void; }

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, show, handleClose }) => {
    if (!event) return null;
    
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#39FF14' }}>
                <Modal.Title style={{ color: '#39FF14' }}><Eye size={24} className="me-2"/> Detalles del Evento: {event.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <p><strong><MapPin size={16} className="me-1"/> Ubicación Principal:</strong> {event.location}</p>
                <hr style={{ borderColor: '#444' }}/>
                
                <h6 style={{ color: '#1E90FF' }} className="mb-3"><Hash size={18} className="me-1"/> Notas Logísticas / Indicaciones</h6>
                <div 
                    style={{ 
                        backgroundColor: '#333', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        whiteSpace: 'pre-wrap', 
                        minHeight: '80px',
                        borderLeft: '3px solid #1E90FF'
                    }}
                >
                    {event.notes || 'No se han registrado notas logísticas adicionales.'}
                </div>
                
                {event.mapEmbed && (
                    <div className="mt-4">
                         <h6 style={{ color: '#1E90FF' }} className="mb-2"><MapPin size={18} className="me-1"/> Enlace de Mapa</h6>
                         <Button variant="primary" size="sm" as="a" href={event.mapEmbed} target="_blank">Abrir Mapa Embed</Button>
                    </div>
                )}
                
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#111' }}>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};


interface EventModalProps { event: Event | null; show: boolean; handleClose: () => void; fetchEvents: () => void; showStatus: (msg: string, type: 'success' | 'danger') => void; }

const EventModal: React.FC<EventModalProps> = ({ event, show, handleClose, fetchEvents, showStatus }) => {
    const isEditing = !!event;
    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    // Obtener la fecha máxima permitida (ej. 1 año a partir de ahora)
    const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);

    // Separar la ubicación guardada para inicializar los selectores
    const locationParts = event?.location.includes(',') ? event.location.split(',').map(s => s.trim()) : [event?.location || '', ''];
    const [initialCommune, initialRegion] = locationParts.length === 2 ? [locationParts[0], locationParts[1]] : ['', locationParts[0] || ''];


    const [formData, setFormData] = useState({
        title: event?.title || '',
        date: event?.date || today,
        time: event?.time || '18:00',
        location: event?.location || '', // Comuna, Región (Se auto-genera)
        mapEmbed: event?.mapEmbed || '', 
        mapUrl: event?.mapUrl || '', // 🚨 NUEVO
        notes: event?.notes || '', // Notas logísticas
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // ESTADOS PARA SELECTORES ANIDADOS
    const [regionSelected, setRegionSelected] = useState(initialRegion);
    const [communeSelected, setCommuneSelected] = useState(initialCommune);
    const [communesAvailable, setCommunesAvailable] = useState<string[]>([]);


    useEffect(() => {
        // 1. Cargar comunas disponibles
        const communes = getCommunesByRegionName(regionSelected);
        setCommunesAvailable(communes);
        
        // 2. Sincronización de Location: se actualiza cada vez que se selecciona Región o Comuna
        if (regionSelected && communeSelected && communes.includes(communeSelected)) {
            // 🚨 Auto-asigna: Comuna, Región
            setFormData(prev => ({ ...prev, location: `${communeSelected}, ${regionSelected}` }));
        } else if (regionSelected) {
            setFormData(prev => ({ ...prev, location: regionSelected })); // Muestra solo la región si la comuna no es válida o no seleccionada
        }
        
    }, [regionSelected, communeSelected]); 


    useEffect(() => {
        // Sincronizar estados al abrir/cerrar modal
        if (event) {
            const locationParts = event.location.includes(',') ? event.location.split(',').map(s => s.trim()) : [event.location, ''];
            const [commune, region] = locationParts.length === 2 ? [locationParts[0], locationParts[1]] : ['', locationParts[0]];
            
            setFormData({ title: event.title, date: event.date, time: event.time, location: event.location, mapEmbed: event.mapEmbed, mapUrl: event.mapUrl || '', notes: event.notes || '' });
            setRegionSelected(region || event.location);
            setCommuneSelected(commune || '');
        } else {
            setFormData({ title: '', date: today, time: '18:00', location: '', mapEmbed: '', mapUrl: '', notes: '' });
            setRegionSelected('');
            setCommuneSelected('');
        }
        setError(null);
    }, [event, show]);


    const updateFormData = (e: React.ChangeEvent<any>) => {
        const { name, value, type } = e.target;
        
        // Manejo especial para Región (Reset de Comuna)
        if (name === 'regionSelect') {
            setRegionSelected(value);
            setCommuneSelected(''); // Resetea comuna
            setFormData(prev => ({ ...prev, location: value })); // Temporalmente solo Región
        } 
        // Manejo especial para Comuna (Finaliza la ubicación principal)
        else if (name === 'communeSelect') {
            setCommuneSelected(value);
            // El useEffect se encarga de rellenar formData.location con "Comuna, Región"
        }
        // Manejo normal
        else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
        }
    };

    // FUNCIÓN CRÍTICA: Extrae la URL de incrustación del iframe completo
    const extractEmbedSrc = (fullCode: string): string => {
        const match = fullCode.match(/src="([^"]+)"/);
        return match ? match[1] : fullCode.includes('http') ? fullCode : ''; 
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const payload = { ...formData };
        
        // 1. Procesar el código que pegó el administrador (extraer solo la URL)
        if (payload.mapEmbed.includes('<iframe') || payload.mapEmbed.includes('http')) {
             payload.mapEmbed = extractEmbedSrc(payload.mapEmbed);
        }
        
        // 2. VALIDACIÓN DE UBICACIÓN
        if (!payload.location || payload.location.length < 5) {
             setError('Debe seleccionar una Ubicación válida (Región y Comuna).');
             setLoading(false);
             return;
        }

        const url = isEditing ? `${API_URL}/${event!.id}/admin` : `${API_URL}/admin`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            await axios({
                method: method,
                url: url,
                data: payload,
            });
            
            fetchEvents();
            handleClose();
            showStatus(`Evento "${formData.title}" ${isEditing ? 'actualizado' : 'creado'} con éxito.`, 'success');

        } catch (err: any) {
            setError(err.response?.data?.message || `Fallo al ${isEditing ? 'actualizar' : 'crear'} el evento.`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#1E90FF' }}>
                <Modal.Title style={{ color: '#39FF14' }}>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control type="text" name="title" value={formData.title} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}/>
                    </Form.Group>
                    
                    {/* RESPONSIVIDAD: Fecha y Hora en 6/6 */}
                    <Row>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date" 
                                    value={formData.date} 
                                    onChange={updateFormData} 
                                    required 
                                    // Asumiendo que today y maxDate están definidos en el scope
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Hora</Form.Label>
                                <Form.Control type="time" name="time" value={formData.time} onChange={updateFormData} required style={{ backgroundColor: '#333', color: 'white' }}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* SELECTORES DE REGIÓN/COMUNA */}
                    <h6 className="mb-3 mt-3 border-top pt-3" style={{ color: '#39FF14' }}>Ubicación Geográfica</h6>
                    <Row>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Región</Form.Label>
                                <Form.Select 
                                    name="regionSelect" 
                                    value={regionSelected} 
                                    onChange={updateFormData} 
                                    required 
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                >
                                    <option value="">Seleccionar Región</option>
                                    {ALL_REGIONS_DATA.map((reg: any) => (<option key={reg.region} value={reg.region}>{reg.region}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Comuna</Form.Label>
                                <Form.Select 
                                    name="communeSelect" 
                                    value={communeSelected} 
                                    onChange={updateFormData} 
                                    required 
                                    disabled={communesAvailable.length === 0}
                                    style={{ backgroundColor: '#333', color: 'white' }}
                                >
                                    <option value="">Seleccionar Comuna</option>
                                    {communesAvailable.map(com => (<option key={com} value={com}>{com}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Ubicación (Resultado Automático)</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            readOnly 
                            style={{ backgroundColor: '#444', color: 'white' }}
                        />
                        <Form.Text className="text-muted">Se autocompleta con: Comuna, Región.</Form.Text>
                    </Form.Group>
                    
                    {/* CAMPO DE NOTAS/COMENTARIOS */}
                    <Form.Group className="mb-3">
                        <Form.Label>Notas Logísticas (Uso interno y público en el modal de detalles)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            name="notes" 
                            value={formData.notes} 
                            onChange={updateFormData} 
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                        <Form.Text className="text-muted">
                            **Ej: Calle Esquella #245 a 5 cuadras del metro Alameda.**
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>URL Embed de Mapa (Iframe Completo)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            name="mapEmbed" 
                            value={formData.mapEmbed} 
                            onChange={updateFormData} 
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                        <Form.Text className="text-muted">
                            **Paso:** Pegue aquí el código iframe que Google Maps le proporciona.
                        </Form.Text>
                    </Form.Group>
                    
                    {/* 🚨 NUEVO CAMPO: URL para el botón "Ver Mapa" */}
                    <Form.Group className="mb-3">
                        <Form.Label>URL para el botón "Ver Mapa"</Form.Label>
                        <Form.Control 
                            type="url" 
                            name="mapUrl" 
                            value={formData.mapUrl} 
                            onChange={updateFormData} 
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                        <Form.Text className="text-muted">
                            **Paso:** Pegue aquí la URL que se abrirá en una nueva pestaña (ej: enlace de Google Maps).
                        </Form.Text>
                    </Form.Group>

                    <Button type="submit" variant="success" className="w-100 mt-3" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Evento')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};