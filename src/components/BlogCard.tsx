// level-up-gaming-frontend/src/components/BlogCard.tsx

import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Interfaces (puedes importarlas desde src/data/blogData si las tienes ahí)
interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    imageUrl: string;
    author: string;
    createdAt: string;
}

interface BlogCardProps {
    post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    return (
        <Card className="h-100 shadow-sm border-0" style={{ backgroundColor: '#111', color: 'white' }}>
            <Card.Img variant="top" src={post.imageUrl} alt={post.title} style={{ height: '180px', objectFit: 'cover' }} />
            <Card.Body className="d-flex flex-column">
                <Card.Title style={{ fontSize: '1.2rem', color: '#1E90FF' }}>
                    <Link to={`/blog/${post.id}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                        {post.title}
                    </Link>
                </Card.Title>
                <Card.Text className="text-muted flex-grow-1">{post.excerpt}</Card.Text>
                <footer className="blockquote-footer mt-auto">
                    {post.author} - {new Date(post.createdAt).toLocaleDateString()}
                </footer>
            </Card.Body>
        </Card>
    );
};

// 🚨 CORRECCIÓN CLAVE: Usar export default
export default BlogCard;