import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Image, Button, Badge, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReviewsSection from '../components/ReviewsSection';
import { Product } from '../types/Product';
import { ShoppingCart, Star, ArrowLeft } from 'react-feather';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api/products';

// FORMATO CLP GLOBAL
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
});
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false); // Estado para controlar si el producto ya está en el carrito

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) { setError("ID de producto no proporcionado."); setLoading(false); return; }

            try {
                const response = await axios.get(`${API_URL}/${id}`);
                setProduct(response.data);
            } catch (err: any) {
                setError('No se pudo encontrar el producto con el ID proporcionado.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addReviewToProduct = async (newRating: number, newComment: string) => {
        if (!product) return;

        try {
            const reviewPayload = {
                name: user?.name || 'Usuario Anónimo',
                rating: newRating,
                comment: newComment
            };

            const response = await axios.post(`${API_URL}/${product.id}/reviews`, reviewPayload);

            // Update product with response from backend (includes updated rating and review count)
            setProduct(response.data);
            toast.success('¡Reseña publicada con éxito!');
        } catch (error: any) {
            console.error('Error al enviar la reseña:', error);
            toast.error('No se pudo publicar la reseña. Intenta nuevamente.');
        }
    };

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/productos"><Button variant="secondary" className="mt-3">Volver al Catálogo</Button></Link></Container>;
    if (!product) return null;

    const renderRating = () => {
        const stars = [];
        for (let i = 0; i < Math.floor(product.rating); i++) { stars.push(<Star key={i} size={18} fill="#FFC107" stroke="#FFC107" />); }
        return (
            <div className="d-flex align-items-center my-3">
                {stars}
                <span className="ms-2 text-muted">({product.numReviews} opiniones)</span>
            </div>
        );
    };

    const renderSpecifications = () => {
        try {
            const specs = JSON.parse(product.specifications);
            return (
                <ListGroup variant="flush" style={{ backgroundColor: 'transparent' }}>
                    {Object.entries(specs).map(([key, value]) => (
                        <ListGroup.Item key={key} className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: '#D3D3D3', borderBottom: '1px dashed #333' }}>
                            <strong style={{ color: '#1E90FF' }}>{key}:</strong>
                            <span>{value as string}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            );
        } catch (e) {
            return <p className="text-muted">{product.description || 'Especificaciones no disponibles.'}</p>;
        }
    };

    const handleAddToCart = () => {
        addToCart(product);
        setAddedToCart(true); // Bloquear el botón después de añadir al carrito
        toast.success(`${product.name} añadido al carrito!`);
    };

    return (
        <Container className="py-5">
            <Link to="/productos" className="text-decoration-none">
                <Button variant="outline-secondary" size="sm" className="mb-4">
                    <ArrowLeft size={16} className="me-2" /> Volver al Catálogo
                </Button>
            </Link>

            <Row>
                {/* Columna de Imagen */}
                <Col md={6}>
                    <Image
                        src={imageError ? 'https://via.placeholder.com/600x400?text=IMAGEN+NO+DISPONIBLE' : product.imageUrl}
                        alt={product.name}
                        fluid
                        rounded
                        className="shadow-lg"
                        onError={() => setImageError(true)}
                    />
                </Col>

                {/* Columna de Detalles */}
                <Col md={6} className="text-white">
                    <h1 className="mb-3" style={{ color: '#39FF14' }}>{product.name}</h1>
                    {renderRating()}
                    <p className="lead text-muted">{product.description}</p>

                    <div className="my-4 p-3 rounded" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
                        <h2 style={{ color: '#1E90FF' }}>{formatClp(product.price)}</h2>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <Badge bg={product.countInStock > 0 ? 'success' : 'danger'} className="fs-6">
                                {product.countInStock > 0 ? `${product.countInStock} en Stock` : 'Agotado'}
                            </Badge>
                            <Button
                                variant="success"
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={product.countInStock === 0 || addedToCart} // Bloquea el botón si ya fue añadido
                            >
                                <ShoppingCart size={20} className="me-2" />
                                {addedToCart ? 'Producto Añadido' : 'Añadir al Carrito'}
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col>
                    <h3 style={{ color: '#1E90FF' }}>Especificaciones Técnicas</h3>
                    {renderSpecifications()}
                </Col>
            </Row>

            <ReviewsSection
                productId={product.id}
                averageRating={product.rating}
                numReviews={product.numReviews}
                reviews={product.reviews}
                onReviewSubmit={addReviewToProduct}
            />
        </Container>
    );
};

export default ProductDetailPage;
