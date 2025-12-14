import axios from 'axios';
import { Product } from '../types/Product'; // Assuming Product type is defined here

const API_URL = '/api/products';

export const fetchProducts = async (): Promise<Product[]> => {
    const { data } = await axios.get<Product[]>(API_URL);
    return data;
};

// Add other product-related service functions here as needed (e.g., createProduct, updateProduct, deleteProduct)
