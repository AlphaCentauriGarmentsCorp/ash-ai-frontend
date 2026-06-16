import React from "react";

const ACTION_STYLES = {
  started:        "bg-blue-50 text-blue-700 border-blue-200",
  completed:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  for_approval:   "bg-amber-50 text-amber-700 border-amber-200",
  delayed:        "bg-red-50 text-red-700 border-red-200",
  on_hold:        "bg-zinc-50 text-zinc-700 border-zinc-200",
  resumed:        "bg-blue-50 text-blue-700 border-blue-200",
  note_added:     "bg-gray-50 text-gray-700 border-gray-200",
  assigned:       "bg-purple-50 text-purple-700 border-purple-200",
};

const ACTION_ICONS = {
  started:        "fa-play",
  completed:      "fa-check",
  for_approval:   "fa-hourglass-half",
  delayed:        "fa-triangle-exclamation",
  on_hold:        "fa-pause",
  resumed:        "fa-play",
  note_added:     "fa-pen",
  assigned:       "fa-user-plus",
};

const ActivityLogSection = ({ activityLog = [] }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-clock-rotate-left text-[11px]" />
        </span>
        Activity Log
      </h2>

      {activityLog.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang activity sa stage na ito.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {activityLog.map((entry) => {
            const cls = ACTION_STYLES[entry.action] || ACTION_STYLES.note_added;
            const icon = ACTION_ICONS[entry.action] || "fa-circle-info";
            return (
              <div
                key={entry.id}
                className={`flex items-start gap-3 p-2 border rounded ${cls}`}
              >
                <i className={`fa-solid ${icon} mt-0.5 text-xs`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-medium capitalize">
                      {String(entry.action).replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  {entry.from_status && entry.to_status && (
                    <p className="text-[11px] opacity-80 mt-0.5">
                      <span className="capitalize">
                        {String(entry.from_status).replace(/_/g, " ")}
                      </span>{" "}
                      → <span className="capitalize font-medium">
                        {String(entry.to_status).replace(/_/g, " ")}
                      </span>
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-[11px] opacity-90 italic mt-0.5">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ActivityLogSection;
