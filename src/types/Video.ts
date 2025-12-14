// level-up-gaming-frontend/src/types/Video.ts

export interface Video {
    id: string;
    title: string;
    embedUrl: string;
    isFeatured: boolean;
}

export interface VideoFormData {
    title: string;
    embedUrl: string;
    isFeatured?: boolean;
}

export interface StatusMessage {
    msg: string;
    type: 'success' | 'danger';
}
