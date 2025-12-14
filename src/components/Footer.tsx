// level-up-gaming-frontend/src/components/Footer.tsx

import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        // 🚨 CAMBIO: Usamos el fondo negro (var(--color-negro)) y texto gris claro (var(--color-gris-claro))
        <footer className="py-4 mt-5 border-top" style={{ backgroundColor: 'var(--color-negro)', borderTopColor: 'var(--color-azul-electrico)' }}>
            <Container>
                <Row>
                    <Col md={4} className="mb-3">
                        <h5 style={{ color: 'var(--color-verde-neon)' }}>Level-Up Gaming</h5>
                        <p style={{ color: 'var(--color-gris-claro)' }}>Tu destino para todo lo relacionado con videojuegos.</p>
                    </Col>

                    <Col md={4} className="mb-3">
                        <h5 style={{ color: 'var(--color-verde-neon)' }}>Enlaces</h5>
                        <Nav className="flex-column">
                            <Nav.Link as={Link} to="/sobre-nosotros" className="p-0" style={{ color: 'var(--color-gris-claro)' }}>Sobre Nosotros</Nav.Link>
                            <Nav.Link as={Link} to="/politica-privacidad" className="p-0" style={{ color: 'var(--color-gris-claro)' }}>Política de Privacidad</Nav.Link>
                            <Nav.Link as={Link} to="/terminos-servicio" className="p-0" style={{ color: 'var(--color-gris-claro)' }}>Términos de Servicio</Nav.Link>
                        </Nav>
                    </Col>

                    <Col md={4} className="mb-3">
                        <h5 style={{ color: 'var(--color-verde-neon)' }}>Contacto</h5>
                        <ul className="list-unstyled" style={{ color: 'var(--color-gris-claro)' }}>
                            <li>Email: info@levelupgaming.com</li>
                            <li>Teléfono: +123 456 7890</li>
                        </ul>
                    </Col>
                </Row>
                
                {/* Derechos de Autor */}
                <Row className="mt-3">
                    <Col className="text-center">
                        <p className="mb-0" style={{ color: 'var(--color-gris-claro)' }}>
                            &copy; {currentYear} Level-Up Gaming. Todos los derechos reservados.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;