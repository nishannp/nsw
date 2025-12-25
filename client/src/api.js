
// Environment Configuration
// 1. VITE_API_URL: Set this in Vercel (e.g. https://my-backend.com/nsw/api)
// 2. Localhost: Used during npm run dev
// 3. Fallback: Relative path for single-server deployment
export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost/nsw/api' : '/nsw/api');

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        return response.json();
    },
    post: async (endpoint, data) => {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    put: async (endpoint, data) => {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
};
