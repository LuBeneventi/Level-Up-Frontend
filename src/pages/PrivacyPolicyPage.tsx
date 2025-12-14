// level-up-gaming-frontend/src/pages/PrivacyPolicyPage.tsx

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="text-center mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>Política de Privacidad</h1>
                    <p style={{ color: 'var(--color-gris-claro)' }}>Última actualización: 03 de Noviembre de 2025</p>

                    <p>
                        En Level-Up Gaming ("nosotros", "nuestro"), respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
                        Esta política de privacidad te informará sobre cómo cuidamos tus datos personales cuando visitas nuestro sitio web y te informará sobre tus derechos de privacidad.
                    </p>

                    <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>1. Datos que recopilamos</h4>
                    <p>
                        Recopilamos varios tipos de información, incluyendo:
                        <ul>
                            <li><strong>Información de Identificación Personal:</strong> Nombre, RUT, correo electrónico, fecha de nacimiento (para verificar la mayoría de edad).</li>
                            <li><strong>Información de Contacto:</strong> Dirección de envío.</li>
                            <li><strong>Información de Cuenta:</strong> Preferencias de compra, historial de pedidos, puntos LevelUp acumulados y códigos de referidos.</li>
                            <li><strong>Información Especial:</strong> Si te registras con un correo electrónico de Duoc para acceder a descuentos, almacenaremos esa afiliación.</li>
                        </ul>
                    </p>

                    <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>2. Cómo usamos tus datos</h4>
                    <p>
                        Utilizamos tus datos para:
                        <ul>
                            <li>Procesar y gestionar tus pedidos.</li>
                            <li>Administrar tu cuenta y el programa de fidelización (puntos LevelUp).</li>
                            <li>Verificar tu edad y aplicar descuentos especiales (ej. Duoc).</li>
                            <li>Personalizar tu experiencia de compra con recomendaciones de productos.</li>
                            <li>Comunicarnos contigo sobre tu pedido o con fines de marketing, si has dado tu consentimiento.</li>
                        </ul>
                    </p>

                    <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>3. Seguridad de los datos</h4>
                    <p>
                        Hemos implementado medidas de seguridad adecuadas para evitar que tus datos personales se pierdan, usen o accedan de forma no autorizada. 
                        El acceso a tus datos personales está limitado a aquellos empleados o agentes que tienen una necesidad comercial de conocerlos.
                    </p>

                    <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>4. Tus derechos</h4>
                    <p>
                        Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento a través de la sección "Mi Perfil" de tu cuenta.
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default PrivacyPolicyPage;
