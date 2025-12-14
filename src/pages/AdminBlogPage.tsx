// src/pages/AdminBlogPage.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import {
    Container,
    Table,
    Alert,
    Spinner,
    Badge,
    Button,
    Modal,
    Row,
    Col,
    Form,
    Card,
    ButtonGroup
} from 'react-bootstrap';
import { Edit, Trash, ArrowLeft, PlusCircle, AlertTriangle } from 'react-feather';
import { Link } from 'react-router-dom';
// Eliminamos: import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';

// Importamos tipos y servicio
import { BlogPost, PostFormData } from '../types/Blog';
import { StatusMessage } from '../types/StatusMessage';
import AdminBlogService from '../services/AdminBlogService';


// ----------------------------------------------------
// PÁGINA PRINCIPAL DE ADMINISTRACIÓN DE BLOG
// ----------------------------------------------------

const AdminBlogPage: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Usamos el tipo StatusMessage importado
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

    // Estados para búsqueda y ordenamiento
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | ''>('newest');

    // ** Función de Servicio Refactorizada **
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await AdminBlogService.fetchPosts();
            setPosts(data);
            setError(null);
        } catch (err) {
            setError("Error al cargar los posts. Verifica el backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Usamos el tipo StatusMessage importado
    const showStatus = (msg: string, type: 'success' | 'danger') => {
        setStatusMessage({ msg, type });
        setTimeout(() => setStatusMessage(null), 4000);
    };

    const confirmDelete = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setShowDeleteModal(true);
    };

    // ** Lógica de Eliminación Refactorizada **
    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            await AdminBlogService.deletePost(itemToDelete.id);
            setPosts(posts.filter(post => post.id !== itemToDelete.id));

            showStatus(`Artículo "${itemToDelete.name}" eliminado.`, "success");
        } catch (err) {
            showStatus("Error al eliminar el artículo.", "danger");
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
    };

    // Lógica para filtrar y ordenar los posts (sin cambios)
    const filteredAndSortedPosts = React.useMemo(() => {
        let filtered = [...posts];

        // 1. Filtrar por título
        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Ordenar por fecha
        if (sortOrder) {
            filtered.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                if (sortOrder === 'newest') {
                    return dateB - dateA;
                }
                return dateA - dateB; // 'oldest'
            });
        }
        return filtered;
    }, [posts, searchTerm, sortOrder]);

    if (loading)
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
            </Container>
        );

    if (error)
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );

    return (
        <AdminLayout>
            <style>{`
                .admin-search-input::placeholder {
                    color: #999;
                    opacity: 1;
                }
            `}</style>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">

                <Link to="/admin">
                    <Button variant="outline-secondary" size="sm">
                        <ArrowLeft size={16} className="me-2" /> Volver
                    </Button>
                </Link>

                <h1 style={{ color: "#1E90FF" }}>Gestión de Blog / Noticias</h1>

                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <PlusCircle size={18} className="me-2" /> Nuevo Artículo
                </Button>
            </div>

            {/* Fila de filtros */}
            <Row className="mb-4 align-items-center">
                <Col md={5}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por título..."
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
                <Alert
                    variant={statusMessage.type}
                    dismissible
                    onClose={() => setStatusMessage(null)}
                    className="mb-4"
                >
                    {statusMessage.msg}
                </Alert>
            )}

            {/* Vista Escritorio */}
            <div className="table-responsive d-none d-md-block">
                <Table
                    striped
                    bordered
                    hover
                    className="table-dark"
                    style={{ backgroundColor: "#0d0d0d" }}
                >
                    <thead style={{ backgroundColor: "#1a1a1a", color: "#c5cfc3ff" }}>
                        <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAndSortedPosts.map(post => (
                            <tr key={post.id}>
                                <td style={{ color: "white" }}>{post.title}</td>
                                <td>{post.author}</td>
                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>

                                <td>
                                    <Button
                                        variant="info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(post)}
                                    >
                                        <Edit size={14} />
                                    </Button>

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => confirmDelete(post.id, post.title)}
                                    >
                                        <Trash size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Vista Móvil */}
            <Row className="d-block d-md-none g-3">
                {filteredAndSortedPosts.map(post => (
                    <Col xs={12} key={post.id}>
                        <Card style={{ backgroundColor: "#222", border: "1px solid #1E90FF", color: "white" }}>
                            <Card.Body>
                                <Card.Title style={{ color: "#39FF14" }}>{post.title}</Card.Title>

                                <Card.Subtitle className="mb-2 text-muted small">
                                    {post.excerpt.slice(0, 50)}...
                                </Card.Subtitle>

                                <hr style={{ borderColor: "#444" }} />

                                <p className="mb-1">Autor: <strong>{post.author}</strong></p>

                                <p className="mb-3">
                                    Fecha:{' '}
                                    <Badge bg="secondary">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </Badge>
                                </p>

                                <div className="d-grid gap-2">
                                    <Button variant="info" size="sm" onClick={() => handleEdit(post)}>
                                        <Edit size={14} className="me-1" /> Editar
                                    </Button>

                                    <Button variant="danger" size="sm" onClick={() => confirmDelete(post.id, post.title)}>
                                        <Trash size={14} className="me-1" /> Eliminar
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal Create/Edit */}
            <PostModal
                post={selectedPost}
                show={showCreateModal || !!selectedPost}
                handleClose={() => {
                    setSelectedPost(null);
                    setShowCreateModal(false);
                }}
                fetchPosts={fetchPosts}
                showStatus={showStatus}
            />

            {/* Modal Delete */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
                itemName={itemToDelete?.name || "este artículo"}
            />
        </AdminLayout>
    );
};

export default AdminBlogPage;

/* =====================================================================================
    COMPONENTES MODAL AUXILIARES
    ===================================================================================== */

interface ConfirmDeleteModalProps {
    show: boolean;
    handleClose: () => void;
    handleDelete: () => void;
    itemName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    show,
    handleClose,
    handleDelete,
    itemName
}) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#111", borderBottomColor: "#FF4444" }}>
            <Modal.Title style={{ color: "#FF4444" }}>
                <AlertTriangle size={24} className="me-2" /> Confirmar Eliminación
            </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: "#222", color: "white" }}>
            ¿Eliminar <strong style={{ color: "#39FF14" }}>{itemName}</strong>?
            <Alert variant="warning" className="mt-3">
                Esta acción no se puede deshacer.
            </Alert>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: "#111" }}>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </Modal.Footer>
    </Modal>
);

// Usa las interfaces BlogPost, PostFormData y StatusMessage
interface PostModalProps {
    post: BlogPost | null; 
    show: boolean;
    handleClose: () => void;
    fetchPosts: () => void;
    showStatus: (msg: string, type: 'success' | 'danger') => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, show, handleClose, fetchPosts, showStatus }) => {
    const isEditing = !!post;

    // Usamos el tipo PostFormData
    const [formData, setFormData] = useState<PostFormData>({
        title: post?.title || "",
        excerpt: post?.excerpt || "",
        content: post?.content || "",
        imageUrl: post?.imageUrl || "",
        author: post?.author || "Admin"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(post?.imageUrl || null);

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                imageUrl: post.imageUrl,
                author: post.author
            });
            setPreviewUrl(post.imageUrl || null);
        } else {
            setFormData({
                title: "",
                excerpt: "",
                content: "",
                imageUrl: "", // Inicializamos vacío para permitir carga de archivo
                author: "Admin"
            });
            setPreviewUrl(null);
        }
        setError(null);
    }, [post, show]);

    const updateFormData = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFormData(prev => ({ ...prev, imageUrl: base64 }));
                setPreviewUrl(base64);
            };
            reader.readAsDataURL(e.target.files[0]);
        } else {
            // Si no se selecciona archivo, restablecer a la URL original o vacío
            setPreviewUrl(post?.imageUrl || null);
            setFormData(prev => ({ ...prev, imageUrl: post?.imageUrl || "" }));
        }
    };

    // ** Lógica de Submit Refactorizada **
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.imageUrl) {
            setError("Debe proporcionar una imagen.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                await AdminBlogService.updatePost(post!.id, formData);
            } else {
                await AdminBlogService.createPost(formData);
            }
            
            fetchPosts();
            handleClose();

            showStatus(
                `Artículo "${formData.title}" ${isEditing ? "actualizado" : "creado"} correctamente.`,
                "success"
            );
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || "Error al guardar el artículo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton style={{ backgroundColor: "#111", borderBottomColor: "#1E90FF" }}>
                <Modal.Title style={{ color: "#39FF14" }}>
                    {isEditing ? "Editar Artículo" : "Crear Nuevo Artículo"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: "#222", color: "white" }}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={updateFormData}
                            required
                            style={{ backgroundColor: "#333", color: "white" }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Resumen</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={updateFormData}
                            required
                            style={{ backgroundColor: "#333", color: "white" }}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Autor</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={updateFormData}
                                    style={{ backgroundColor: "#333", color: "white" }}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Contenido (HTML permitido)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    name="content"
                                    value={formData.content}
                                    onChange={updateFormData}
                                    required
                                    style={{ backgroundColor: "#333", color: "white" }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mb-3 mt-4 border-top pt-3" style={{ color: "#39FF14" }}>
                        Imagen
                    </h6>

                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Cargar Archivo</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>URL Imagen</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={updateFormData}
                                    // Deshabilitar si se usó la carga de archivo (base64)
                                    disabled={formData.imageUrl?.startsWith("data:image")}
                                    style={{ backgroundColor: "#333", color: "white" }}
                                />
                            </Form.Group>
                        </Col>

                        {previewUrl && (
                            <Col xs={12} className="text-center mt-3">
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    style={{ maxWidth: "150px", borderRadius: "6px" }}
                                />
                            </Col>
                        )}
                    </Row>

                    <Button type="submit" variant="success" className="w-100" disabled={loading}>
                        {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Artículo"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
