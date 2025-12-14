// level-up-gaming-frontend/src/pages/TermsOfServicePage.tsx

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const TermsOfServicePage: React.FC = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="text-center mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>Términos de Servicio</h1>
                    <p style={{ color: 'var(--color-gris-claro)' }}>Última actualización: 03 de Noviembre de 2025</p>

                    <p>
                        Bienvenido a Level-Up Gaming. Estos términos y condiciones describen las reglas y regulaciones para el uso de nuestro sitio web.
                    </p>

                    <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>1. Cuentas de Usuario</h4>
                    <p>
                        <ul>
                            <li>Para registrarte en nuestro sitio, debes ser mayor de 18 años. Nos reservamos el derecho de solicitar una verificación de edad.</li>
                            <li>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</li>
                            <li>Toda la información proporcionada debe ser precisa y actualizada.</li>
                        </ul>
                    </p>

                    <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>2. Programa de Descuentos y Puntos</h4>
                    <p>
                        <ul>
                            <li><strong>Descuento Duoc:</strong> Los usuarios que se registren con un correo electrónico institucional de Duoc (@duoc.cl o @profesor.duoc.cl) recibirán un 20% de descuento de por vida en productos seleccionados. Este beneficio es personal e intransferible.</li>
                            <li><strong>Puntos LevelUp:</strong> Los usuarios pueden ganar "Puntos LevelUp" a través de compras, referidos y participación en eventos. Estos puntos pueden ser canjeados por productos y descuentos según las condiciones del programa de fidelización.</li>
                            <li>Nos reservamos el derecho de modificar o terminar los programas de descuentos y puntos en cualquier momento.</li>
                        </ul>
                    </p>

                    <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>3. Reseñas y Contenido Generado por el Usuario</h4>
                    <p>
                        Al publicar reseñas u otro contenido, otorgas a Level-Up Gaming una licencia no exclusiva para usar, reproducir y editar dicho contenido. No debes publicar contenido que sea ilegal, obsceno, amenazante o difamatorio.
                    </p>

                     <h4 className="mt-4" style={{ color: 'var(--color-azul-electrico)' }}>4. Envíos y Devoluciones</h4>
                    <p>
                        Realizamos despachos a todo Chile. Los tiempos y costos de envío se detallarán durante el proceso de compra. Para información sobre devoluciones, por favor contacta a nuestro servicio al cliente.
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default TermsOfServicePage;
