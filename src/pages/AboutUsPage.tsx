// level-up-gaming-frontend/src/pages/AboutUsPage.tsx

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AboutUsPage: React.FC = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="text-center mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>Sobre Nosotros</h1>
                    
                    <div className="mb-5">
                        <h2 style={{ color: 'var(--color-azul-electrico)', fontFamily: 'Orbitron, sans-serif' }}>Nuestra Misión</h2>
                        <p style={{ color: 'var(--color-gris-claro)', fontSize: '1.1rem' }}>
                            Proporcionar productos de alta calidad para gamers en todo Chile, ofreciendo una experiencia de 
                            compra única y personalizada, con un enfoque en la satisfacción del cliente y el crecimiento de la 
                            comunidad gamer.
                        </p>
                    </div>

                    <div className="mb-5">
                        <h2 style={{ color: 'var(--color-verde-neon)', fontFamily: 'Orbitron, sans-serif' }}>Nuestra Visión</h2>
                        <p style={{ color: 'var(--color-gris-claro)', fontSize: '1.1rem' }}>
                            Ser la tienda online líder en productos para gamers en Chile, reconocida por su innovación, servicio 
                            al cliente excepcional, y un programa de fidelización basado en gamificación que recompense a 
                            nuestros clientes más fieles.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontFamily: 'Orbitron, sans-serif' }}>Impacto Comunitario</h2>
                        <p style={{ color: 'var(--color-gris-claro)', fontSize: '1.1rem' }}>
                            En Level-Up Gaming, creemos en el poder de la comunidad. Cada compra que realizas apoya directamente 
                            eventos locales de videojuegos y nos ayuda a fomentar un espacio inclusivo y vibrante para todos los 
                            gamers en Chile. ¡Juntos, llevamos el juego al siguiente nivel!
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AboutUsPage;
