// level-up-gaming-frontend/src/components/ReviewsSection.tsx

import React, { useState, FormEvent } from 'react';
import { Card, ListGroup, Row, Col, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Star, MessageSquare } from 'react-feather';

// 🚨 Interfaces (deben coincidir con el Backend/Context)
interface Review {
    id: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface ReviewsSectionProps {
    productId: string;
    averageRating: number;
    numReviews: number;
    reviews: Review[];
    onReviewSubmit: (rating: number, comment: string) => void; // 🚨 Función de inserción
}

// Renderiza estrellas basado en el número
const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(
            <Star 
                key={i} 
                size={18} 
                fill={i < Math.floor(rating) ? "#FFC107" : "none"} 
                stroke="#FFC107" 
                className="me-1"
            />
        );
    }
    return stars;
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ averageRating, numReviews, reviews, onReviewSubmit }) => {
    // 🚨 Estado para controlar el modal de formulario
    const [showReviewModal, setShowReviewModal] = useState(false);
    
    // Función de simulación para enviar el formulario
    const handleReviewSubmit = (rating: number, comment: string) => {
        // 🚨 Llamamos a la función del padre para actualizar el estado del producto
        onReviewSubmit(rating, comment); 
        // Cerramos el modal
        setShowReviewModal(false);
    };

    return (
        <Card className="shadow-lg mt-5" style={{ backgroundColor: '#111', border: '1px solid var(--color-azul-electrico)', color: 'white' }}>
            <Card.Body>
                <h3 className="mb-3" style={{ color: 'var(--color-verde-neon)' }}><MessageSquare size={24} className="me-2"/> Valoraciones de Clientes</h3>
                
                {/* Resumen de Rating */}
                <Row className="align-items-center border-bottom pb-3 mb-4">
                    <Col md={4} className="text-center">
                        <h1 className="display-4 mb-0" style={{ color: 'var(--color-azul-electrico)' }}>{averageRating.toFixed(1)}</h1>
                        <div className="d-flex justify-content-center">{renderStars(averageRating)}</div>
                        <p className="text-primary mb-0 mt-1">Basado en {numReviews} opiniones</p>
                    </Col>
                    <Col md={8} className="text-end">
                        <Button variant="success" onClick={() => setShowReviewModal(true)}>
                            Escribir una Opinión
                        </Button> 
                    </Col>
                </Row>

                {/* Lista de Comentarios */}
                <h4 style={{ color: 'var(--color-azul-electrico)' }}>Comentarios Recientes</h4>
                
                {reviews.length === 0 ? (
                    <Alert variant="info" style={{ backgroundColor: '#222', border: 'none' }}>
                        Sé el primero en dejar una opinión sobre este producto.
                    </Alert>
                ) : (
                    <ListGroup variant="flush">
                        {reviews.map((review) => (
                            <ListGroup.Item key={review.id} style={{ backgroundColor: 'transparent', borderBottom: '1px solid #333', color: '#D3D3D3' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <strong style={{ color: 'white' }}>{review.name}</strong>
                                    <small className="text-primary">{new Date(review.createdAt).toLocaleDateString()}</small>
                                </div>
                                <div className="mb-2">{renderStars(review.rating)}</div>
                                <p className="mb-0">{review.comment}</p>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
            
            {/* 🚨 MODAL DEL FORMULARIO */}
            <ReviewFormModal 
                show={showReviewModal}
                handleClose={() => setShowReviewModal(false)}
                handleSubmit={handleReviewSubmit} // 🚨 Pasamos la función de inserción
            />
        </Card>
    );
};

export default ReviewsSection;


// ----------------------------------------------------
// COMPONENTE MODAL DE FORMULARIO DE OPINIÓN
// ----------------------------------------------------

interface ReviewModalProps {
    show: boolean;
    handleClose: () => void;
    handleSubmit: (rating: number, comment: string) => void;
}

const ReviewFormModal: React.FC<ReviewModalProps> = ({ show, handleClose, handleSubmit }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulación: Usamos un setTimeout para simular el tiempo de envío de la API (2 segundos)
        setTimeout(() => {
            // 1. Ejecutar el handler principal (que en la realidad llamaría a la API)
            handleSubmit(rating, comment);
            
            // 2. Cerrar el modal y limpiar estados
            setLoading(false);
            setRating(5);
            setComment('');

        }, 1000); // Simula 1 segundo de latencia
    };
    
    // Función para renderizar el selector de estrellas en el modal
    const renderRatingSelector = () => {
        return (
            <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star 
                        key={starValue} 
                        size={24} 
                        fill={starValue <= rating ? "#FFC107" : "none"} 
                        stroke="#FFC107" 
                        className="me-1 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRating(starValue)}
                    />
                ))}
                <span className="ms-3">{rating} Estrellas</span>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#111', borderBottomColor: '#39FF14' }}>
                <Modal.Title style={{ color: '#39FF14' }}><Star size={20} className="me-2"/> Deja tu Opinión</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#222', color: 'white' }}>
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-4">
                        <Form.Label>Tu Calificación</Form.Label>
                        {renderRatingSelector()}
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                        <Form.Label>Comentario</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required 
                            style={{ backgroundColor: '#333', color: 'white' }}
                        />
                    </Form.Group>
                    
                    <Button type="submit" variant="success" className="w-100" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Opinión'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};