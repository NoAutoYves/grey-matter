// utils/api.js
let csrfToken = null;

// Session cache
let sessionCache = null;
let sessionCacheTime = 0;
const SESSION_CACHE_TTL = 60000; // 1 minute

// Base URL configuration
// export const BASE_URL = 'http://localhost:5000';
export const BASE_URL = 'https://greymatterschool.co.za';

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

// Cached session check - prevents rate limiting
export async function checkSession() {
    const now = Date.now();
    
    // Return cached result if still fresh
    if (sessionCache && (now - sessionCacheTime) < SESSION_CACHE_TTL) {
        return sessionCache;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/auth/check-session`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            sessionCache = { authenticated: true, user_id: data.user_id };
        } else {
            sessionCache = { authenticated: false };
        }
        
        sessionCacheTime = now;
        return sessionCache;
    } catch (error) {
        console.error('Session check failed:', error);
        sessionCache = { authenticated: false };
        sessionCacheTime = now;
        return sessionCache;
    }
}

// Main API request function
export async function apiRequest(url, options = {}) {
    const method = options.method || 'GET';
    
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        if (!csrfToken) {
            await fetchCSRFToken();
        }
        options.headers = {
            ...options.headers,
            'X-CSRFToken': csrfToken
        };
        
        if (!options.headers['Content-Type'] && !(options.body instanceof URLSearchParams) && !(options.body instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
        }
    }
    
    let fullUrl;
    if (url.startsWith('/api/')) {
        fullUrl = `${BASE_URL}${url}`;
    } else if (url.startsWith('/')) {
        fullUrl = `${BASE_URL}${url}`;
    } else {
        fullUrl = `${BASE_URL}/${url}`;
    }
    
    console.log('API Request URL:', fullUrl, 'Method:', method);
    
    const response = await fetch(fullUrl, {
        ...options,
        credentials: 'include'
    });
    
    if (response.status === 401) {
        throw new Error('Session expired');
    }
    
    if (response.status === 400) {
        const text = await response.text();
        if (text.includes('CSRF')) {
            await fetchCSRFToken();
            options.headers['X-CSRFToken'] = csrfToken;
            const retryResponse = await fetch(fullUrl, { ...options, credentials: 'include' });
            
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
    delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' }),

    batch: {
        getExerciseData: (exerciseId) => {
            return apiRequest(`/api/exercise/batch-data/${exerciseId}`, {
                method: 'GET',
                credentials: 'include'
            });
        },

        submitExercise: (exerciseId, answers, timeTaken, notes = "No notes taken.", breakdown = []) => {
            return apiRequest('/api/exercise/batch-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exercise_id: exerciseId,
                    answers: answers,
                    time_taken_seconds: timeTaken,
                    notes: notes,
                    breakdown: breakdown
                })
            });
        },

        getResults: (exerciseIds) => {
            return apiRequest('/api/exercise/batch-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exercise_ids: exerciseIds })
            });
        }
    }
};