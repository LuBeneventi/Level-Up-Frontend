// level-up-gaming-frontend/src/types/Event.ts

export interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    location: string;
    mapEmbed: string;
    notes?: string;
}

export interface EventFormData {
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    mapEmbed?: string;
    notes?: string;
}

export interface StatusMessage {
    msg: string;
    type: 'success' | 'danger';
}
