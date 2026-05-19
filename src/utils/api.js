// utils/api.js
let csrfToken = null;

// Base URL configuration
const BASE_URL = 'https://greymatterschool.co.za';
const API_BASE_URL = `${BASE_URL}/api`;

// Get CSRF token from backend
export async function fetchCSRFToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`, {
            credentials: 'include'
        });
        const data = await response.json();
        csrfToken = data.csrf_token;
        return csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
}

// Main API request function
export async function apiRequest(url, options = {}) {
    const method = options.method || 'GET';
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        if (!csrfToken) {
            await fetchCSRFToken();
        }
        options.headers = {
            ...options.headers,
            'X-CSRFToken': csrfToken
        };
        
        // ONLY set Content-Type to JSON if no Content-Type is specified AND body is not URLSearchParams
        if (!options.headers['Content-Type'] && !(options.body instanceof URLSearchParams) && !(options.body instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
        }
    }
    
    // Build the full URL correctly
    let fullUrl;
    if (url.startsWith('/api/')) {
        // If it's already an API path
        fullUrl = `${BASE_URL}${url}`;
    } else if (url.startsWith('/')) {
        // If it's a relative path (like /auth/login)
        fullUrl = `${BASE_URL}${url}`;
    } else {
        // If it's a relative path without leading slash
        fullUrl = `${BASE_URL}/${url}`;
    }
    
    console.log('API Request URL:', fullUrl, 'Method:', method); // Debug log
    
    const response = await fetch(fullUrl, {
        ...options,
        credentials: 'include'
    });
    
    // Handle 401 Unauthorized - just throw error without redirect
    if (response.status === 401) {
        throw new Error('Session expired');
    }
    
    // If CSRF token expired (400 error), refresh and retry once
    if (response.status === 400) {
        const text = await response.text();
        if (text.includes('CSRF')) {
            await fetchCSRFToken();
            options.headers['X-CSRFToken'] = csrfToken;
            const retryResponse = await fetch(fullUrl, { ...options, credentials: 'include' });
            
            // Check for session expiration on retry
            if (retryResponse.status === 401) {
                throw new Error('Session expired');
            }
            return retryResponse;
        }
    }
    
    return response;
}

// Convenience methods
export const api = {
    get: (url, options = {}) => apiRequest(url, { ...options, method: 'GET' }),
    post: (url, body, options = {}) => {
        const isFormData = body instanceof FormData;
        const headers = { ...options.headers };
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        if (isFormData) {
            delete headers['Content-Type'];
        }
        
        return apiRequest(url, {
            ...options,
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
            headers
        });
    },
    put: (url, body, options = {}) => apiRequest(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', ...options.headers }
    }),
    delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' })
};