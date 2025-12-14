// level-up-gaming-frontend/src/setupTests.ts

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// =============================================
// 🔧 COMPATIBILIDAD GLOBAL (Node / jsdom / ESM)
// =============================================
declare global {
  // Asegura que `global` exista (algunos entornos ESM no lo exponen)
  // @ts-ignore
  var global: typeof globalThis;
}
if (typeof global === 'undefined') {
  // @ts-ignore
  (global as any) = globalThis;
}

// =============================================
// 📁 MOCK: FileReader nativo
// =============================================
// Evita errores como "global.FileReader is not a constructor" o "Cannot read property 'onloadend'"
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  readAsDataURL = vi.fn(function (this: any, _file: Blob) {
    // Simulamos un retardo como el real
    setTimeout(() => {
      this.result = 'data:image/png;base64,mocked_base64_data';
      if (this.onloadend) {
        this.onloadend({ target: { result: this.result } } as any);
      }
    }, 50);
  });
}

// Reemplaza la clase global FileReader con el mock
vi.stubGlobal('FileReader', MockFileReader);

// =============================================
// 🌐 MOCK: URL API
// =============================================
// Simula las funciones del objeto URL usadas por componentes (ej. previews)
globalThis.URL.createObjectURL = vi.fn(() => 'mocked_local_url');
globalThis.URL.revokeObjectURL = vi.fn();

// =============================================
// ⚙️ MOCKS OPCIONALES (para React Router o Fetch)
// =============================================
// 👉 Estos mocks puedes moverlos a tests específicos si prefieres modularidad.

// Ejemplo (descomentarlo si lo necesitas global):
// vi.mock('react-router-dom', async () => ({
//   ...(await vi.importActual('react-router-dom')),
//   useNavigate: () => vi.fn(),
//   useParams: () => ({ id: 'mocked-id' }),
// }));

// Ejemplo de mock global para fetch (si usas peticiones HTTP):
// globalThis.fetch = vi.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve({ mocked: true }),
//   })
// );
