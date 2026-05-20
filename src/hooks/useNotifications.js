import { useEffect, useRef, useState, useCallback } from "react";
import { notificationsApi } from "../api/notificationsApi";

/**
 * Phase 2 — useNotifications hook.
 *
 * Polls the backend for new notifications every `pollInterval` ms. Keeps
 * the bell dropdown's unread count and recent list in sync without
 * needing WebSockets (we'll add real-time push in a later phase if it
 * turns out to be needed).
 *
 * Usage in the bell dropdown component:
 *
 *     const { recent, unreadCount, refresh, markRead, markAllRead, destroy }
 *       = useNotifications({ mode: "recent", limit: 10 });
 *
 * Usage in a full inbox page:
 *
 *     const { items, total, unreadCount, page, setPage, refresh, ... }
 *       = useNotifications({ mode: "list", perPage: 20 });
 *
 * The hook stops polling automatically when:
 *   - The browser tab is hidden (resumes on focus)
 *   - `pollInterval` is set to 0 / null
 *   - The component unmounts
 *
 * @param {object} opts
 * @param {"recent" | "list"} opts.mode  – data shape we want
 * @param {number} opts.limit            – `recent` mode page size (default 10)
 * @param {number} opts.perPage          – `list` mode page size (default 20)
 * @param {number} opts.pollInterval     – ms between background polls (default 30000)
 */
export const useNotifications = ({
    mode = "recent",
    limit = 10,
    perPage = 20,
    pollInterval = 30000,
} = {}) => {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const pollRef = useRef(null);
    const isMounted = useRef(true);

    // Avoid race conditions: ignore stale responses if a newer fetch
    // started after we issued ours.
    const fetchSeq = useRef(0);

    // ---- Fetch ---------------------------------------------------------
    const fetchData = useCallback(
        async (showLoader = true) => {
            const seq = ++fetchSeq.current;
            if (showLoader) setIsLoading(true);

            try {
                let res;
                if (mode === "list") {
                    res = await notificationsApi.list({ page, perPage });
                } else {
                    res = await notificationsApi.recent(limit);
                }

                if (!isMounted.current || seq !== fetchSeq.current) return;

                if (mode === "list") {
                    setItems(res.data || []);
                    setTotal(res.total || 0);
                    setLastPage(res.last_page || 1);
                    setUnreadCount(res.unread_count ?? 0);
                } else {
                    setItems(res.data || []);
                    setUnreadCount(res.unread_count ?? 0);
                }

                setError(null);
            } catch (err) {
                if (!isMounted.current || seq !== fetchSeq.current) return;
                setError(err?.response?.data?.message || err?.message || "Could not load notifications.");
            } finally {
                if (isMounted.current && seq === fetchSeq.current) {
                    setIsLoading(false);
                }
            }
        },
        [mode, limit, perPage, page],
    );

    // Lightweight count-only refresh, used by polling.
    const fetchCountOnly = useCallback(async () => {
        try {
            const res = await notificationsApi.unreadCount();
            if (isMounted.current) {
                setUnreadCount(res.unread_count ?? 0);
            }
        } catch {
            // silent — we don't surface polling errors
        }
    }, []);

    // ---- Initial load + page change ------------------------------------
    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    // ---- Polling -------------------------------------------------------
    useEffect(() => {
        if (!pollInterval) return;

        const tick = () => {
            // When the tab is hidden, skip the network call to save battery.
            if (typeof document !== "undefined" && document.hidden) return;
            // For dropdown ('recent') mode we refetch full list each time so
            // a new notification shows up immediately. For inbox ('list') mode
            // polling only refreshes the unread badge — list refreshes are
            // user-initiated to avoid breaking the user's scroll position.
            if (mode === "recent") {
                fetchData(false);
            } else {
                fetchCountOnly();
            }
        };

        pollRef.current = setInterval(tick, pollInterval);

        // Refresh immediately when the tab regains focus
        const onVisibility = () => {
            if (typeof document !== "undefined" && !document.hidden) {
                tick();
            }
        };
        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", onVisibility);
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (typeof document !== "undefined") {
                document.removeEventListener("visibilitychange", onVisibility);
            }
        };
    }, [pollInterval, mode, fetchData, fetchCountOnly]);

    // ---- Track mount/unmount ------------------------------------------
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // ---- Mutations -----------------------------------------------------
    const markRead = useCallback(async (id) => {
        // Optimistic update
        setItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));

        try {
            const res = await notificationsApi.markRead(id);
            if (isMounted.current && typeof res?.unread_count === "number") {
                setUnreadCount(res.unread_count);
            }
        } catch (err) {
            // Roll back on error and refresh
            setError(err?.response?.data?.message || "Couldn't mark as read.");
            fetchData(false);
        }
    }, [fetchData]);

    const markAllRead = useCallback(async () => {
        // Optimistic
        setItems((prev) =>
            prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })),
        );
        setUnreadCount(0);

        try {
            await notificationsApi.markAllRead();
        } catch (err) {
            setError(err?.response?.data?.message || "Couldn't mark all as read.");
            fetchData(false);
        }
    }, [fetchData]);

    const destroy = useCallback(async (id) => {
        const removed = items.find((n) => n.id === id);
        setItems((prev) => prev.filter((n) => n.id !== id));
        if (removed && !removed.read_at) {
            setUnreadCount((c) => Math.max(0, c - 1));
        }

        try {
            await notificationsApi.destroy(id);
        } catch (err) {
            setError(err?.response?.data?.message || "Couldn't delete.");
            fetchData(false);
        }
    }, [items, fetchData]);

    return {
        items,
        total,
        unreadCount,
        page,
        lastPage,
        setPage,
        isLoading,
        error,
        refresh: () => fetchData(true),
        markRead,
        markAllRead,
        destroy,
    };
};

export default useNotifications;
