// level-up-gaming-frontend/src/pages/CommunityPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { Users, Trello, MapPin, Gift, Clock, Hash, Calendar } from 'react-feather'; // 🚨 Importar Hash para Notas
import { mockLevels } from '../data/mockData'; 
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

// Interfaces (deben coincidir con el Backend)
interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    location: string;
    mapEmbed: string;
    mapUrl : string;
    notes?: string; // 🚨 NUEVO CAMPO DE NOTAS
}

const API_URL = '/api/events';


// ----------------------------------------------------
// COMPONENTE AUXILIAR: TARJETA DE NIVEL (LevelCard) 
// ----------------------------------------------------
const LevelCard: React.FC<{ level: typeof mockLevels[0] }> = ({ level }) => (
    <Card className="h-100 shadow-sm border-primary" style={{ backgroundColor: '#111', color: 'white', border: '1px solid var(--color-azul-electrico)' }}>
        <Card.Header style={{ backgroundColor: 'var(--color-azul-electrico)', color: 'black', fontWeight: 'bold' }}>
            <h5 className="mb-0" style={{ color: 'black' }}>{level.name}</h5>
        </Card.Header>
        <Card.Body>
            <Card.Text style={{ color: 'var(--color-gris-claro)' }}>Puntos requeridos: <Badge bg="warning" text="dark">{level.minPoints}</Badge></Card.Text>
            <h6>Beneficios:</h6>
            <ListGroup variant="flush">
                {level.benefits.map((benefit, index) => (
                    <ListGroup.Item 
                        key={index} 
                        style={{ backgroundColor: 'transparent', color: 'var(--color-gris-claro)' }} 
                        className="d-flex align-items-center"
                    >
                        <Gift size={16} className="me-2" color="var(--color-verde-neon)" /> {benefit}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Card.Body>
    </Card>
);


const CommunityPage: React.FC = () => {
    const { user, isLoggedIn } = useAuth(); 
    
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Conectar a la API de Eventos
    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(API_URL); 
            console.log('Eventos recibidos de la API:', data); // <-- AÑADE ESTA LÍNEA PARA DEPURAR
            setEvents(data);
        } catch (err: any) {
            setError('Fallo al cargar los eventos. Intenta recargar la página.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchEvents();
    }, []);


    // Determinación del código de referido
    const referralCode = isLoggedIn && user ? user.referralCode : 'Inicia sesión para ver tu código';


    return (
        <Container className="py-5">
            <h1 className="text-center mb-5 display-4" style={{ color: 'var(--color-azul-electrico)' }}>🎮 Comunidad Level-Up</h1>

            {/* SECCIÓN: PROGRAMA DE REFERIDOS (DINÁMICO) */}
            <Card className="mb-5 shadow" style={{ backgroundColor: '#111', color: 'white', border: '1px solid var(--color-verde-neon)' }}>
                <Card.Body>
                    <h2 className="border-bottom pb-2 mb-3" style={{ color: 'var(--color-verde-neon)' }}><Users className="me-2"/> Programa de Referidos</h2>
                    <p className="lead" style={{ color: 'var(--color-gris-claro)' }}>¡Gana puntos y sube de nivel compartiendo Level-Up Gaming!</p>
                    <p style={{ color: 'var(--color-gris-claro)' }}>Tu código de referido actual: <Badge bg="info" className="p-2 fs-6">{referralCode}</Badge></p>
                </Card.Body>
            </Card>

            {/* SECCIÓN: SISTEMA DE NIVELES */}
            <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-azul-electrico)' }}><Trello className="me-2"/> Sistema de Niveles (Loyalty)</h2>
            <Row xs={1} md={2} lg={4} className="g-4 mb-5">
                {mockLevels.map(level => (<Col key={level.id}><LevelCard level={level} /></Col>))}
            </Row>

            {/* SECCIÓN: PRÓXIMOS EVENTOS (Dinámico de la API) */}
            <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-verde-neon)' }}><MapPin className="me-2"/> Próximos Eventos Gaming</h2>
            
            {loading ? (
                <Container className="py-3 text-center"><Spinner animation="border" /></Container>
            ) : error ? (
                <Alert variant="danger" className="text-center">{error}</Alert>
            ) : events.length === 0 ? (
                 <Alert variant="info" className="text-center">No hay eventos programados.</Alert>
            ) : (
                <Row xs={1} md={1} lg={2} className="g-4 mb-5">
                    {events.map(event => (
                        <Col key={event.id}>
                            <Card className="h-100 shadow-sm" style={{ backgroundColor: '#222', color: 'white', border: '1px solid var(--color-azul-electrico)' }}>
                                <Card.Body>
                                    <Card.Title style={{ color: 'var(--color-azul-electrico)' }}>{event.title}</Card.Title>
                                    {/* 🚨 CORRECCIÓN: Usar toLocaleDateString y mostrar la hora */}
                                    <Card.Subtitle className="mb-2 text-muted">
                                        <Calendar size={16} className="me-1"/> {new Date(event.date).toLocaleDateString()}
                                        <Clock size={16} className="ms-3 me-1"/> {event.time} hrs
                                    </Card.Subtitle>
                                    <Card.Text style={{ color: 'var(--color-gris-claro)' }}><MapPin size={16} className="me-1"/> Ubicación: <strong>{event.location}</strong></Card.Text>
                                    
                                    {/* 🚨 MOSTRAR NOTAS LOGÍSTICAS SI EXISTEN */}
                                    {event.notes && (
                                        <Card.Text className="text-warning small fst-italic border-top pt-2 mt-2" style={{ color: 'var(--color-gris-claro)' }}>
                                            <Hash size={14} className="me-1"/> Indicaciones: {event.notes}
                                        </Card.Text>
                                    )}
                                    
                                    <div className="d-flex justify-content-start mt-3">
                                        {event.mapUrl && ( 
                                            <Button variant="primary" size="sm" as="a" href={event.mapUrl as string} target="_blank" className="mt-2 me-2">Ver Mapa</Button>
                                        )}
                                        {/* 🚨 Botón estático, el admin tiene que ver más detalles desde el panel */}
                                    </div>
                                    
                                </Card.Body>
                                
                                {event.mapEmbed && (
                                    <div className="ratio ratio-16x9">
                                        <iframe src={event.mapEmbed} style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer" title={`Mapa de ${event.title}`}></iframe>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default CommunityPage;