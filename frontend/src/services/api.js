export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// In-memory cache for Zero-Latency navigation (SWR Pattern)
const apiCache = new Map();

/**
 * Core fetch implementation
 */
async function executeFetch(url, options) {
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

  try {
    const response = await fetch(url, {
      headers,
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        try {
          errorMessage = await response.text();
        } catch {
          // Fallback
        }
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/csv")) {
      return response.blob();
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please check your internet connection or try again later.", { cause: error });
    }
    throw error;
  }
}

/**
 * Helper to perform HTTP requests with SWR Caching
 */
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const method = options.method || "GET";

  // Invalidate cache immediately on any mutation to ensure fresh data
  if (method !== "GET") {
    apiCache.clear();
    return executeFetch(url, options);
  }

  // Stale-While-Revalidate (SWR) logic for GET requests
  const cacheKey = url;
  
  // If we have cached data, return it instantly for zero-latency UI
  if (apiCache.has(cacheKey)) {
    // Silently re-fetch in the background to update the cache for the next time
    executeFetch(url, options)
      .then(freshData => {
        apiCache.set(cacheKey, freshData);
      })
      .catch(err => console.error("SWR background refresh failed:", err));
      
    // Return stale data immediately (resolves instantly)
    return apiCache.get(cacheKey);
  }

  // If no cache exists, fetch, cache, and return
  const data = await executeFetch(url, options);
  apiCache.set(cacheKey, data);
  return data;
}

export const api = {
  /**
   * Submit corporate enquiry form
   */
  createEnquiry: (data) => {
    return request("/api/create", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Fetch list of enquiries with optional filters
   */
  getEnquiries: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return request(`/api/list${queryString}`);
  },

  /**
   * Fetch specific enquiry details, quotation, logs
   */
  getEnquiryDetail: (id) => {
    return request(`/api/detail/${id}`);
  },

  /**
   * Move status or update details
   */
  processEnquiry: (id, processData) => {
    return request(`/api/process/${id}`, {
      method: "POST",
      body: JSON.stringify(processData),
    });
  },

  /**
   * Fetch dashboard aggregated numbers
   */
  getDashboardCounts: () => {
    return request("/api/dashboard");
  },

  /**
   * Save or update proposed quotation
   */
  saveQuotation: (id, quotationData) => {
    return request(`/api/quotation/${id}`, {
      method: "POST",
      body: JSON.stringify(quotationData),
    });
  },

  /**
   * Process follow up message and optional email trigger
   */
  saveFollowup: (id, followupData) => {
    return request(`/api/followup/${id}`, {
      method: "POST",
      body: JSON.stringify(followupData),
    });
  },

  /**
   * Trigger AI recommendation suggest
   */
  getGeminiSuggestion: (id, force = false) => {
    return request(`/api/gemini-suggestion/${id}`, {
      method: "POST",
      body: JSON.stringify({ force }),
    });
  },

  /**
   * Returns CSV Export link URL
   */
  getExportCsvUrl: () => {
    return `${API_BASE_URL}/api/export/csv`;
  },

  // --- New Advanced Features APIs ---

  // Personalizations
  createPersonalization: (formData) => {
    return request("/api/personalizations", {
      method: "POST",
      body: formData, // FormData directly handles headers properly
    });
  },
  getPersonalizations: (status = "") => {
    return request(`/api/personalizations${status ? '?status='+status : ''}`);
  },
  updatePersonalizationStatus: (id, status) => {
    return request(`/api/personalizations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },

  // Design Approvals
  uploadDesignMockup: (formData) => {
    return request("/api/design_approvals", {
      method: "POST",
      body: formData,
    });
  },
  getDesignApprovals: (personalizationId = "") => {
    return request(`/api/design_approvals${personalizationId ? '?personalization_id='+personalizationId : ''}`);
  },
  updateDesignApproval: (id, updateData) => {
    return request(`/api/design_approvals/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData)
    });
  },

  // Inventory
  addInventoryProduct: (data) => {
    return request("/api/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getInventory: () => {
    return request("/api/inventory");
  },
  updateInventoryProduct: (id, data) => {
    return request(`/api/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteInventoryProduct: (id) => {
    return request(`/api/inventory/${id}`, {
      method: "DELETE"
    });
  },

  // Occasions Calendar
  addOccasion: (data) => {
    return request("/api/occasions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getOccasions: () => {
    return request("/api/occasions");
  },
  getOccasionReminders: () => {
    return request("/api/occasions/reminders");
  },
  updateOccasion: (id, data) => {
    return request(`/api/occasions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteOccasion: (id) => {
    return request(`/api/occasions/${id}`, {
      method: "DELETE"
    });
  },

  // Returns
  submitReturn: (formData) => {
    return request("/api/returns", {
      method: "POST",
      body: formData,
    });
  },
  getReturns: (status = "") => {
    return request(`/api/returns${status ? '?status='+status : ''}`);
  },
  updateReturn: (id, data) => {
    return request(`/api/returns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
};
