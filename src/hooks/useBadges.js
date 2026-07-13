import { useContext } from "react";
import { BadgeContext } from "../context/BadgeContext";

/**
 * Read the app-wide badge counts and the optimistic bump helpers.
 *
 * Unlike useAuth, this does NOT throw when used outside <BadgeProvider>. A
 * badge is cosmetic: a component rendered outside the provider (Login, a
 * future standalone portal shell, a test harness) should keep working with
 * zeroes rather than blow up the whole tree. Every consumer here treats a
 * missing count as "no badge", which is exactly the fallback below.
 */
const FALLBACK = Object.freeze({
    portals: Object.freeze({}),
    awaiting: 0,
    pendingApprovals: 0,
    tick: 0,
    refresh: () => { },
    bumpPortal: () => { },
    bumpAwaiting: () => { },
    bumpPendingApprovals: () => { },
    setPendingApprovals: () => { },
});

export const useBadges = () => useContext(BadgeContext) ?? FALLBACK;

export default useBadges;
