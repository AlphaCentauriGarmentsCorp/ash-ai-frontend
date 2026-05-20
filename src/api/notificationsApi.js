import api from "./axios";

/**
 * Phase 2 — Notifications API.
 *
 * Mirrors backend NotificationsController endpoints under /v2/notifications.
 *
 * All endpoints are scoped to the current authenticated user automatically;
 * no need to pass a user id from the client.
 */
export const notificationsApi = {
    /**
     * Paginated inbox for the dedicated notifications page.
     *
     * @param {{page?: number, perPage?: number}} params
     * @returns { data, current_page, last_page, per_page, total, unread_count }
     */
    list: async ({ page = 1, perPage = 20 } = {}) => {
        const { data } = await api.get("/notifications", {
            params: { page, per_page: perPage },
        });
        return data;
    },

    /**
     * Top N most recent notifications, used by the bell dropdown.
     *
     * @param {number} limit
     * @returns { data: Notification[], unread_count: number }
     */
    recent: async (limit = 10) => {
        const { data } = await api.get("/notifications/recent", {
            params: { limit },
        });
        return data;
    },

    /**
     * Just returns { unread_count }. Cheap call for polling.
     */
    unreadCount: async () => {
        const { data } = await api.get("/notifications/unread-count");
        return data;
    },

    markRead: async (id) => {
        const { data } = await api.post(`/notifications/${id}/read`);
        return data;
    },

    markAllRead: async () => {
        const { data } = await api.post("/notifications/read-all");
        return data;
    },

    destroy: async (id) => {
        const { data } = await api.delete(`/notifications/${id}`);
        return data;
    },
};

export default notificationsApi;
