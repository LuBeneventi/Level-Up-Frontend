// src/pages/BlogPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { BookOpen } from 'react-feather';
import BlogCard from '../components/BlogCard';
import axios from 'axios';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    createdAt: string;
}

const API_URL = '/api/blog';

const BlogPage: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(API_URL);
            setPosts(data.reverse()); // Mostrar los más recientes primero
            setError(null);
        } catch (err: any) {
            setError('Fallo al cargar los posts. Intenta recargar la página.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-5">
            <h1 className="text-center mb-5 display-4" style={{ color: '#1E90FF' }}>
                <BookOpen className="me-3" size={36} /> Blog Gamer Level-Up
            </h1>
            <p className="text-center lead mb-5 text-muted">
                Noticias, guías de hardware y análisis profundos para llevar tu experiencia al siguiente nivel.
            </p>

            {posts.length === 0 ? (
                <Alert variant="info" style={{ backgroundColor: '#333', border: '1px solid #1E90FF', color: 'white' }}>
                    No hay artículos publicados en este momento. ¡El administrador debe crear contenido!
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {posts.map((post) => (
                        <Col key={post.id}>
                            <BlogCard post={post} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default BlogPage;