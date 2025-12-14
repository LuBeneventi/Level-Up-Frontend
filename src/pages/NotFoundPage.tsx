// level-up-gaming-frontend/src/pages/NotFoundPage.tsx

import React from 'react';
import { Container } from 'react-bootstrap';

const NotFoundPage: React.FC = () => {
    return (
        <Container className="py-5 text-center">
            <h1>404: Página no encontrada</h1>
            <p>El recurso que buscas no existe en Level-Up Gaming.</p>
        </Container>
    );
};

export default NotFoundPage;
