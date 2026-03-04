import React from "react";

/**
 * EquipmentLocationCard Component
 * A flexible container for grouping related content.
 */
const EquipmentLocationCard = ({
  data,
  children,
  actionButtons,
  bodyClass = "",
  isHoverable = false,
  handleAction,
}) => {
  const hoverClasses = isHoverable
    ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    : "";

  const generateStatsFromData = () => {
    return [
      {
        icon: <i className="fas fa-box-open text-white"></i>,
        label: "Total Items",
        value: data?.total_items || 0,
      },
      {
        icon: <i className="fas fa-spinner text-white"></i>,
        label: "In use",
        value: data?.in_use || 0,
      },
      {
        icon: <i className="fas fa-user-check text-white"></i>,
        label: "Available",
        value: data?.available || 0,
      },
      {
        icon: <i className="fas fa-exclamation-circle text-white"></i>,
        label: "Missing",
        value: data?.missing || 0,
      },
    ];
  };

  const cardStats = generateStatsFromData();

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${hoverClasses}`}>
      <div className="bg-primary px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 relative ">
        {/* Action Buttons */}

        <div className="absolute top-3 sm:top-4 lg:top-5 right-3 sm:right-4 lg:right-5 flex gap-1.5 sm:gap-2 z-10">
          <button
            onClick={() => handleAction("edit", data)}
            className="bg-white hover:bg-gray-50 border-2 border-gray-300 w-6 h-6 flex items-center justify-center transition"
            title="Edit"
          >
            <i className="fas fa-pen text-primary text-xs"></i>
          </button>
          <button
            onClick={() => handleAction("delete", data)}
            className="bg-white hover:bg-gray-50 border-2 border-gray-300 w-6 h-6 flex items-center justify-center transition"
            title="Delete"
          >
            <i className="fas fa-trash text-primary text-xs"></i>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 lg:gap-7">
          {/* Icon */}
          <div className="bg-white rounded-full  w-12 h-12  sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center shrink-0 self-start sm:self-center">
            <i
              className={`fa-solid ${data?.icon || "fa-warehouse"} text-primary text-xl`}
            ></i>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Title and Description */}
            <div className="pr-12 sm:pr-14 lg:pr-16">
              {data?.name && (
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-1.5 break-words">
                  {data.name}
                </h3>
              )}
              {data?.description && (
                <p className="text-xs text-gray-200 leading-relaxed font-light line-clamp-2">
                  {data.description}
                </p>
              )}
            </div>

            {/* Stats Section */}
            {cardStats && cardStats.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 md:gap-8 lg:gap-30 mt-4 sm:mt-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4 flex-1 flex-wrap">
                  {cardStats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 sm:gap-2 text-white"
                    >
                      {stat.icon && (
                        <span className="text-xs">{stat.icon}</span>
                      )}
                      <span className="text-xs font-extralight whitespace-nowrap">
                        {stat.label}: {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleAction("view", data)}
                    className="text-white text-xs underline font-extralight hover:text-gray-200"
                  >
                    View contents
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body (if needed) */}
      {children && (
        <div className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 ${bodyClass}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default EquipmentLocationCard;
