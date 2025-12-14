// src/types/Blog.ts

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    createdAt: string;
    category?: string;
    updatedAt?: string;
}

export interface BlogFormData {
    title?: string;
    excerpt?: string;
    content?: string;
    imageUrl?: string;
    author?: string;
    category?: string;
}

export interface PostFormData {
    title?: string;
    excerpt?: string;
    content?: string;
    imageUrl?: string;
    author?: string;
    category?: string;
}

export interface StatusMessage {
    msg: string;
    type: 'success' | 'danger';
}
