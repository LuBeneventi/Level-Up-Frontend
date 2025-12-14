// level-up-gaming-frontend/src/utils/constants.ts

/**
 * Constantes compartidas de la aplicación
 */

// Estados de órdenes
export const ORDER_STATUS_OPTIONS = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

// Tipos de recompensas
export const REWARD_TYPES = ['Producto', 'Descuento', 'Envio'];

// Temporadas de recompensas
export const REWARD_SEASONS = ['Standard', 'Halloween', 'Navidad', 'BlackFriday', 'Verano'];

// Categorías de productos
export const PRODUCT_CATEGORIES = ['Gaming', 'Accesorios', 'Periféricos', 'Software', 'Otro'];

// Roles de usuario
export const USER_ROLES = ['admin', 'seller', 'customer'];

// Límites de validación
export const MAX_PRODUCT_STOCK = 999;
export const MAX_PRODUCT_PRICE_CLP = 9999999;

// Errores comunes
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Por favor, intenta más tarde.',
    VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
};

export default {
    ORDER_STATUS_OPTIONS,
    REWARD_TYPES,
    REWARD_SEASONS,
    PRODUCT_CATEGORIES,
    USER_ROLES,
    MAX_PRODUCT_STOCK,
    MAX_PRODUCT_PRICE_CLP,
    ERROR_MESSAGES,
};
