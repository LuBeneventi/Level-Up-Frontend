// level-up-gaming-frontend/src/pages/ProductsPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button, Form } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/Product';

const API_URL = '/api/products';
// 🚨 Lista de Categorías (Debe ser consistente con el Backend)
const CATEGORIES = ['Consolas', 'Juegos', 'Accesorios', 'Laptops', 'Computadores', 'Juegos de Mesa'];


const ProductsPage: React.FC = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]); // 🚨 NUEVO: Almacena todos los productos
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState(''); // 🚨 NUEVO: Estado para el buscador

    // 🚨 CAMBIO: Se obtienen todos los productos una sola vez
    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error('No se pudieron cargar los productos del servidor.');
                }

                const data: Product[] = await response.json();
                const activeProducts = data.filter(product => product.active); // Changed from isActive to active
                setAllProducts(activeProducts);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    // 🚨 NUEVO: Lógica para filtrar productos en el cliente
    const filteredProducts = React.useMemo(() => {
        return allProducts.filter(product => {
            const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
            const matchesSearch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return matchesCategory && matchesSearch;
        });
    }, [allProducts, selectedCategory, searchTerm]);

    const handleCategoryFilter = (category: string) => {
        setSelectedCategory(category);
    };

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-5">
            <style>{`.product-search-input::placeholder { color: #999; opacity: 1; }`}</style>
            <h1 style={{ color: 'var(--color-azul-electrico)' }}>Catálogo de Productos</h1>

            {/* 🚨 NUEVO: Buscador en su propia fila */}
            <Row className="mb-4 justify-content-center">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="product-search-input"
                        style={{ backgroundColor: '#333', color: 'white', borderColor: '#555' }}
                    />
                </Col>
            </Row>

            {/* SECCIÓN DE FILTROS DE CATEGORÍA */}
            <Row className="mb-4">
                <Col className="text-center">
                    <Button variant={selectedCategory === '' ? 'primary' : 'outline-secondary'} onClick={() => handleCategoryFilter('')} className="me-2 mb-2">
                        Todos
                    </Button>
                    {CATEGORIES.map(cat => (
                        <Button key={cat} variant={selectedCategory === cat ? 'primary' : 'outline-secondary'} onClick={() => handleCategoryFilter(cat)} className="me-2 mb-2">
                            {cat}
                        </Button>
                    ))}
                </Col>
            </Row>


            {/* LISTADO DE PRODUCTOS */}
            {filteredProducts.length === 0 ? (
                <Alert variant="info">No se encontraron productos con los filtros aplicados.</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} xl={4} className="g-4 mt-3">
                    {filteredProducts.map((product) => (
                        <Col key={product.id}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default ProductsPage;