let csrfToken = null;

// Session cache
let sessionCache = null;
let sessionCacheTime = 0;
const SESSION_CACHE_TTL = 60000; // 1 minute

// Relative URLs - the origin serving the app also serves /api.
//   dev      Vite server.proxy  http://localhost:5000
//   preview  Vite preview.proxy  https://greymatterschool.co.za
//   prod     nginx  http://127.0.0.1:5000
export const BASE_URL = '';
const API_URL = '';

// Body types that must be forwarded as-is (browser or caller controls Content-Type).
function isPassthroughBody(body) {
    return (
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        typeof body === 'string' ||
        body instanceof Blob ||
        body instanceof ArrayBuffer
    );
}

// Get CSRF token from backend
export async function fetchCSRFToken() {
    try {
        const response = await fetch(`${API_URL}/api/csrf-token`, {
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

    if (sessionCache && (now - sessionCacheTime) < SESSION_CACHE_TTL) {
        return sessionCache;
    }

    try {
        const response = await fetch(`${API_URL}/auth/check-session`, {
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

    // Auth endpoints legitimately return 401 for "wrong credentials".
    // Do NOT throw on those — let the caller parse the response.
    const isAuthEndpoint = url.startsWith('/auth/');

    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        if (!csrfToken) {
            await fetchCSRFToken();
        }
        options.headers = {
            ...options.headers,
            'X-CSRFToken': csrfToken
        };

        // Only auto-set Content-Type when the caller did not pass one.
        // FormData is special: never set Content-Type, the browser needs to
        // compute the multipart boundary itself.
        if (options.body instanceof FormData) {
            delete options.headers['Content-Type'];
        } else if (
            !options.headers['Content-Type'] &&
            !(options.body instanceof URLSearchParams) &&
            !(typeof options.body === 'string' && options.body.startsWith('{'))
        ) {
            options.headers['Content-Type'] = 'application/json';
        }
    }

    let fullUrl;
    if (url.startsWith('/')) {
        fullUrl = `${API_URL}${url}`;
    } else {
        fullUrl = `${API_URL}/${url}`;
    }

    const response = await fetch(fullUrl, {
        ...options,
        credentials: 'include'
    });

    // Only treat 401 as session expiry for protected endpoints, not auth.
    if (response.status === 401 && !isAuthEndpoint) {
        throw new Error('Session expired');
    }

    if (response.status === 400) {
        // Clone before reading, so the original body stays readable by the caller.
        const cloned = response.clone();
        const text = await cloned.text();
        if (text.includes('CSRF')) {
            await fetchCSRFToken();
            options.headers['X-CSRFToken'] = csrfToken;
            const retryResponse = await fetch(fullUrl, { ...options, credentials: 'include' });

            if (retryResponse.status === 401 && !isAuthEndpoint) {
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
        let finalBody;
        if (isPassthroughBody(body)) {
            finalBody = body;
        } else if (body === undefined || body === null) {
            finalBody = undefined;
        } else {
            finalBody = JSON.stringify(body);
        }

        return apiRequest(url, {
            ...options,
            method: 'POST',
            body: finalBody,
            headers: { ...options.headers }
        });
    },

    put: (url, body, options = {}) => {
        let finalBody;
        if (isPassthroughBody(body)) {
            finalBody = body;
        } else if (body === undefined || body === null) {
            finalBody = undefined;
        } else {
            finalBody = JSON.stringify(body);
        }

        const headers = { ...options.headers };
        if (
            finalBody !== undefined &&
            !headers['Content-Type'] &&
            !(finalBody instanceof URLSearchParams) &&
            !(finalBody instanceof FormData)
        ) {
            headers['Content-Type'] = 'application/json';
        }

        return apiRequest(url, {
            ...options,
            method: 'PUT',
            body: finalBody,
            headers
        });
    },

    delete: (url, body, options = {}) => {
        let finalBody;
        if (isPassthroughBody(body)) {
            finalBody = body;
        } else if (body === undefined || body === null) {
            finalBody = undefined;
        } else {
            finalBody = JSON.stringify(body);
        }

        const headers = { ...options.headers };
        if (
            finalBody !== undefined &&
            !headers['Content-Type'] &&
            !(finalBody instanceof URLSearchParams) &&
            !(finalBody instanceof FormData)
        ) {
            headers['Content-Type'] = 'application/json';
        }

        return apiRequest(url, {
            ...options,
            method: 'DELETE',
            body: finalBody,
            headers
        });
    },

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