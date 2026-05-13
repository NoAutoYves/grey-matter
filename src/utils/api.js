// utils/api.js
let csrfToken = null;

// Get CSRF token from backend
export async function fetchCSRFToken() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/csrf-token`, {
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

// Handle session expiration
function handleSessionExpired() {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear any stored user data in sessionStorage
    sessionStorage.clear();
    
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/signup') &&
        !window.location.pathname.includes('/reset-password')) {
        
        // Show message to user
        const message = 'Your session has expired. Please login again.';
        sessionStorage.setItem('sessionExpiredMessage', message);
        
        // Redirect to login
        window.location.href = '/login';
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
    
    const response = await fetch(url, {
        ...options,
        credentials: 'include'
    });
    
    // Handle session expiration (401 Unauthorized)
    if (response.status === 401) {
        handleSessionExpired();
        throw new Error('Session expired');
    }
    
    // If CSRF token expired (400 error), refresh and retry once
    if (response.status === 400) {
        const text = await response.text();
        if (text.includes('CSRF')) {
            await fetchCSRFToken();
            options.headers['X-CSRFToken'] = csrfToken;
            const retryResponse = await fetch(url, { ...options, credentials: 'include' });
            
            // Check for session expiration on retry
            if (retryResponse.status === 401) {
                handleSessionExpired();
                throw new Error('Session expired');
            }
            return retryResponse;
        }
    }
    
    return response;
}