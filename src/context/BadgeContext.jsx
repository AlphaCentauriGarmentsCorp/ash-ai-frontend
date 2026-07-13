import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { badgesApi } from "../api/badgesApi";
import { onDataChanged } from "../utils/ashEvents";

/**
 * BadgeContext — ONE clock for every badge in the app.
 *
 * Mounted once above <BrowserRouter> in App.jsx, so it survives navigation.
 * (Sidebar and Navbar unmount/remount on every route change because all 118
 * pages wrap <AdminLayout> individually; state kept inside them was refetched
 * from zero on every nav and lost in between. State lives here instead.)
 *
 * Responsibilities
 * ----------------
 *   1. Own the single `setInterval`. Nothing else in the app should poll for
 *      badge data — subscribers watch `tick` and refetch when it changes.
 *   2. Refresh immediately when the tab regains focus (backgrounded tabs get
 *      their timers throttled to ~1/min by the browser, so a plain interval
 *      is stale the moment you switch back).
 *   3. Refresh immediately when any mutation lands, via the `ash:data-changed`
 *      bus (fired by the axios interceptor). This is what makes a badge move
 *      "on the spot" instead of at the next tick.
 *   4. Expose optimistic bumps so the number changes on the click itself; the
 *      refresh that follows ~300ms later reconciles against the server.
 *
 * What it fetches (CP-3)
 * ----------------------
 * A single GET /badges returns every sidebar/dashboard count in one payload,
 * replacing the old per-poll pair (/portal/badge-counts + /csr/payments/awaiting)
 * — one request per tick instead of two for CSR/admin users. The endpoint
 * self-scopes each field to the caller's gates and omits the ones they can't
 * see, so we always ask and just read whatever comes back:
 *
 *   - portals            always present (oversight roles see every station).
 *   - awaiting           only when the user can open the CSR awaiting list.
 *   - pending_approvals  only for payment approvers. The Dashboard widget also
 *                        publishes this from its own queue fetch; both agree
 *                        because they read the same server state.
 *
 * Notifications stay in useNotifications (it owns the list + markRead); it polls
 * off `tick` rather than running a second timer.
 */
export const BadgeContext = createContext(null);

/** Same cadence as the old per-component timers. One request per tick. */
const POLL_MS = 45000;

/** Collapse a burst of mutations (multipart upload + follow-ups) into one GET. */
const DEBOUNCE_MS = 300;

/** Nav paths are hyphenated (`/portal/graphic-artist`); badge keys are not. */
const normalizeRole = (role) => String(role || "").replace(/-/g, "_");

const clamp = (n) => (n < 0 ? 0 : n);

export const BadgeProvider = ({ children, pollInterval = POLL_MS }) => {
    const { user } = useAuth();

    const [portals, setPortals] = useState({});
    const [awaiting, setAwaiting] = useState(0);
    const [pendingApprovals, setPendingApprovals] = useState(0);

    // Bumped after every refresh attempt. Subscribers (the bell, the Dashboard
    // widget) watch this instead of owning a timer.
    const [tick, setTick] = useState(0);

    const mounted = useRef(true);
    const inFlight = useRef(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const refresh = useCallback(async () => {
        if (!user) return;
        if (inFlight.current) return;
        if (typeof document !== "undefined" && document.hidden) return;

        inFlight.current = true;
        try {
            // CP-3 — one call for every count. Fields the user isn't allowed to
            // see are omitted by the backend, so a missing key reads as 0.
            const res = await badgesApi.all();
            if (!mounted.current) return;
            if (res) {
                setPortals(res.portals || {});
                setAwaiting(res.awaiting ?? 0);
                setPendingApprovals(res.pending_approvals ?? 0);
            }
        } catch {
            // transient failure — keep the last good values
        } finally {
            inFlight.current = false;
            // Fire even on failure: subscribers get a chance to retry their own
            // fetch rather than being stranded behind ours.
            if (mounted.current) setTick((t) => t + 1);
        }
    }, [user]);

    // Clear everything on logout so the next user never sees stale numbers.
    useEffect(() => {
        if (user) return;
        setPortals({});
        setAwaiting(0);
        setPendingApprovals(0);
    }, [user]);

    // ---- The single clock ------------------------------------------------
    useEffect(() => {
        if (!user || !pollInterval) return undefined;

        refresh();
        const id = setInterval(refresh, pollInterval);

        return () => clearInterval(id);
    }, [user, pollInterval, refresh]);

    // ---- Refresh the moment the tab comes back ---------------------------
    useEffect(() => {
        if (!user || typeof document === "undefined") return undefined;

        const onVisibility = () => {
            if (!document.hidden) refresh();
        };
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("focus", onVisibility);

        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("focus", onVisibility);
        };
    }, [user, refresh]);

    // ---- Refresh the moment anything mutates -----------------------------
    useEffect(() => {
        if (!user) return undefined;

        const unsubscribe = onDataChanged(() => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(refresh, DEBOUNCE_MS);
        });

        return () => {
            unsubscribe();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [user, refresh]);

    // ---- Optimistic bumps ------------------------------------------------
    // Move the number on the click. `refresh()` lands milliseconds later and
    // overwrites with server truth, so a wrong guess self-corrects; a missed
    // signal self-corrects on the next poll.

    const bumpPortal = useCallback((role, delta) => {
        const key = normalizeRole(role);
        if (!key) return;
        setPortals((prev) => ({ ...prev, [key]: clamp((prev[key] || 0) + delta) }));
    }, []);

    const bumpAwaiting = useCallback((delta) => {
        setAwaiting((n) => clamp(n + delta));
    }, []);

    const bumpPendingApprovals = useCallback((delta) => {
        setPendingApprovals((n) => clamp(n + delta));
    }, []);

    const value = useMemo(
        () => ({
            portals,
            awaiting,
            pendingApprovals,
            tick,
            refresh,
            bumpPortal,
            bumpAwaiting,
            bumpPendingApprovals,
            setPendingApprovals,
        }),
        [
            portals,
            awaiting,
            pendingApprovals,
            tick,
            refresh,
            bumpPortal,
            bumpAwaiting,
            bumpPendingApprovals,
        ],
    );

    return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
};

export default BadgeProvider;
