import { useCallback, useRef, useState } from "react";

/**
 * Promise-based confirm / alert dialogs — styled in-app replacements for
 * window.confirm and window.alert.
 *
 * Usage:
 *   const { confirm, alert, dialog } = useConfirm();
 *   const ok = await confirm({ title, message, confirmLabel, tone }); // -> boolean
 *   await alert({ title, message, tone });                            // -> void (OK)
 *   // ...render {dialog} somewhere in the component's JSX.
 *
 * confirm() resolves true (confirmed) or false (cancelled / dismissed).
 * alert() resolves once the user dismisses it. tone: "primary" | "danger".
 */
export default function useConfirm() {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        mode: "confirm",
        title: opts.title || "Please confirm",
        message: opts.message || "Are you sure?",
        confirmLabel: opts.confirmLabel || "Confirm",
        cancelLabel: opts.cancelLabel || "Cancel",
        tone: opts.tone === "danger" ? "danger" : "primary",
      });
    });
  }, []);

  const alert = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        mode: "alert",
        title: opts.title || "Notice",
        message: opts.message || "",
        confirmLabel: opts.confirmLabel || "OK",
        tone: opts.tone === "danger" ? "danger" : "primary",
      });
    });
  }, []);

  const settle = useCallback((result) => {
    setState(null);
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  }, []);

  const dialog = state ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden"
      onClick={() => settle(state.mode === "alert" ? undefined : false)}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <h3 className="text-base font-semibold text-gray-800">{state.title}</h3>
          {state.message && (
            <p className="mt-2 text-sm text-gray-600">{state.message}</p>
          )}
        </div>
        <div className="px-5 py-3 bg-light/30 border-t border-gray-200 flex justify-end gap-3">
          {state.mode === "confirm" && (
            <button
              type="button"
              onClick={() => settle(false)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {state.cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => settle(state.mode === "alert" ? undefined : true)}
            className={
              "px-4 py-2 text-sm rounded-lg text-white " +
              (state.tone === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/90")
            }
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, alert, dialog };
}
