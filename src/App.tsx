// level-up-gaming-frontend/src/App.tsx

import React from 'react';
import { Toaster } from 'react-hot-toast';

// Componentes del Layout
import Header from './components/Header';
import Footer from './components/Footer';
import AppRouter from './routes/AppRouter'; // Importar el nuevo enrutador

const App: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100"> 
      <Toaster />
      <Header />
      
      <main className="flex-grow-1"> 
        <AppRouter />
      </main>

      <Footer />
    </div>
  );
}

export default App;