let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Ensure apiUrl ends with /api
if (!apiUrl.endsWith('/api')) {
    // Remove trailing slash if present then append /api
    apiUrl = apiUrl.replace(/\/$/, "") + "/api";
}

export default apiUrl;

// Export base URL for static file serving
export const API_BASE_URL = apiUrl.replace(/\/api$/, "");
