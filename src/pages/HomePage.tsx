// level-up-gaming-frontend/src/pages/HomePage.tsx

import React, { useState, useEffect } from 'react'; 
import { Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import ProductCard from '../components/ProductCard'; 
import HeroSection from '../components/HeroSection';
import { Product } from '../types/Product'; 
import { Video } from 'react-feather';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Interfaces (deben coincidir con las APIs consumidas)
interface BlogPost {
    id: string; title: string; excerpt: string; imageUrl: string; author: string; createdAt: string;
}
interface VideoItem { 
    id: string; title: string; embedUrl: string; isFeatured: boolean; 
}


// 🚨 COMPONENTE NewsCard CORREGIDO (Permite que el texto se adapte al tema)
const NewsCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <Card 
        className="h-100 shadow-sm" 
        // 🚨 APLICAMOS ESTILOS INICIALES DEL TEMA OSCURO
        style={{ 
            backgroundColor: 'var(--color-fondo-secundario)', // Usamos el color de card
            color: 'var(--color-blanco)', // Texto principal en blanco
            border: '1px solid var(--color-azul-electrico)' 
        }}
    >
        {/* IMAGEN AÑADIDA */}
        <Card.Img 
            variant="top" 
            src={post.imageUrl} 
            alt={post.title} 
            style={{ height: '180px', objectFit: 'cover' }}
        />
        
        <Card.Body>
            {/* 🚨 TITULO: Color verde neón en Dark Mode (se invierte por el CSS global) */}
            <Card.Title style={{ color: 'var(--color-verde-neon)' }}>
                <Link to={`/blog/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link>
            </Card.Title>
            
            {/* 🚨 CORRECCIÓN: El color de texto principal se hereda de la Card.Body o del CSS global de .card-text 
               NO usamos style={{ color: 'white' }} aquí para que el CSS en Light Mode pueda cambiarlo a negro. */}
            <Card.Text className="text-muted">{post.excerpt}</Card.Text>
        </Card.Body>
    </Card>
);


const HomePage: React.FC = () => {
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [loadingTop, setLoadingTop] = useState(true);
    
    const [latestNews, setLatestNews] = useState<BlogPost[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    
    const [featuredVideos, setFeaturedVideos] = useState<VideoItem[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(true);


    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await fetch('/api/products/top'); 
                const data: Product[] = await response.json();
                // 🚨 CAMBIO CLAVE: Filtrar para mostrar solo productos activos
                const activeTopProducts = data.filter(product => product.active);
                setTopProducts(activeTopProducts);
            } catch (error) {
                console.error("Error al cargar productos destacados:", error);
            } finally {
                setLoadingTop(false);
            }
        };
        
        const fetchLatestNews = async () => {
            try {
                const response = await axios.get('/api/blog');
                setLatestNews(response.data.slice(0, 3)); 
            } catch (error) {
                console.error("Error al cargar noticias:", error);
            } finally {
                setLoadingNews(false);
            }
        };

        const fetchFeaturedVideos = async () => {
            try {
                const response = await axios.get('/api/videos/featured'); 
                setFeaturedVideos(response.data.slice(0, 2)); 
            } catch (error) {
                console.error("Error al cargar videos destacados:", error);
            } finally {
                setLoadingVideos(false);
            }
        };

        fetchTopProducts();
        fetchLatestNews();
        fetchFeaturedVideos();
    }, []);

    return (
        <>
            <HeroSection />
            
            <Container className="py-5">
                {/* 2. SECCIÓN: PRODUCTOS MÁS VENDIDOS */}
                <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-azul-electrico)' }}>🔥 Más Vendidos</h2>
                
                {loadingTop ? (<div className="text-center mb-5"><Spinner animation="grow" size="sm" /></div>) : (
                    <Row xs={1} md={2} lg={4} className="g-4 mb-5">
                        {topProducts.map((product) => (<Col key={product.id}><ProductCard product={product} /></Col>))}
                    </Row>
                )}

                {/* 3. SECCIÓN: NOTICIAS GAMING (Dinámicas de la API) */}
                <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-azul-electrico)' }}>📰 Últimas Noticias Gaming</h2>
                
                {loadingNews ? (<Container className="py-3 text-center"><Spinner animation="border" /></Container>) : (
                    latestNews.length === 0 ? (
                        <Alert variant="secondary" className="text-center">No hay noticias destacadas.</Alert>
                    ) : (
                        <Row xs={1} md={3} className="g-4 mb-5">
                            {latestNews.map((post) => (<Col key={post.id}><NewsCard post={post} /></Col>))}
                        </Row>
                    )
                )}

                {/* 4. SECCIÓN: VIDEOS (Renderizado Iframe Completo) */}
                <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-azul-electrico)' }}><Video className="me-2"/> Tutoriales y Reviews</h2>
                
                {loadingVideos ? (
                    <Container className="py-3 text-center"><Spinner animation="border" /></Container>
                ) : featuredVideos.length === 0 ? (
                    <Alert variant="secondary" className="text-center">No hay videos destacados para mostrar.</Alert>
                ) : (
                    <Row xs={1} md={2} className="g-4 mb-5">
                        {featuredVideos.map((video) => (
                            <Col key={video.id}>
                                <Card className="h-100 shadow-sm" style={{ backgroundColor: '#111', color: 'white', border: '1px solid var(--color-azul-electrico)' }}>
                                    <Card.Body>
                                        <Card.Title style={{ color: 'var(--color-azul-electrico)' }}>{video.title}</Card.Title>
                                        
                                        <div 
                                            className="ratio ratio-16x9 mb-3" 
                                            dangerouslySetInnerHTML={{ __html: video.embedUrl }} 
                                        />
                                        
                                        <p className="mt-2 text-center text-muted">{video.title}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </>
    );
};

export default HomePage;
