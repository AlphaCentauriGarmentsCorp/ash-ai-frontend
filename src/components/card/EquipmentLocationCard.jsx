import React from "react";

/**
 * EquipmentLocationCard Component
 * A flexible container for grouping related content.
 */
const EquipmentLocationCard = ({
  title,
  subtitle,
  children,
  footer,
  image,
  icon,
  stats,
  actionButtons,
  viewLink,
  containerClass = "",
  bodyClass = "",
  headerClass = "",
  shadow = "shadow-md",
  isHoverable = false,
  variant = "default", // "default" or "dark-header"
}) => {
  
  const hoverClasses = isHoverable 
    ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg" 
    : "";

  // Dark header variant (like the Office card)
  if (variant === "dark-header") {
    return (
      <div className={`bg-white rounded-lg overflow-hidden ${shadow} ${hoverClasses} ${containerClass}`}>
        
        {/* Dark Header with Icon, Title, Description, and Action Buttons */}
        <div className={`bg-primary px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 relative ${headerClass}`}>
          {/* Action Buttons (top right) */}
          {actionButtons && (
            <div className="absolute top-3 sm:top-4 lg:top-5 right-3 sm:right-4 lg:right-5 flex gap-1.5 sm:gap-2 z-10">
              {actionButtons}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 lg:gap-7">
            {/* Icon - Large circular white background */}
            {icon && (
              <div className="bg-white rounded-full p-3 sm:p-4 lg:p-5 flex-shrink-0 self-start sm:self-center">
                {icon}
              </div>
            )}
            
            {/* Content Section */}
            <div className="flex-1 min-w-0">
              {/* Title and Description */}
              <div className="pr-12 sm:pr-14 lg:pr-16">
                {title && <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-1.5 break-words">{title}</h3>}
                {subtitle && <p className="text-xs text-gray-200 leading-relaxed font-light">{subtitle}</p>}
              </div>

              {/* Stats Section */}
              {stats && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 md:gap-8 lg:gap-30 mt-4 sm:mt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4 flex-1 flex-wrap">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-white">
                        {stat.icon && <span className="text-xs">{stat.icon}</span>}
                        <span className="text-xs font-extralight whitespace-nowrap">{stat.label}: {stat.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* View Link - wraps naturally */}
                  {viewLink && (
                    <div className="flex-shrink-0">
                      {viewLink}
                    </div>
                  )}
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

        {/* Footer */}
        {footer && (
          <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 bg-gray-50 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    );
  }

  // Default variant (original design)
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${shadow} ${hoverClasses} ${containerClass}`}>
      
      {/* Optional Top Image */}
      {image && (
        <img src={image} alt={title} className="w-full h-48 object-cover" />
      )}

      {/* Header Section */}
      {(title || subtitle) && (
        <div className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 ${headerClass}`}>
          {title && <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Main Content (The "Body") */}
      <div className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 ${bodyClass}`}>
        {children}
      </div>

      {/* Footer Section (optional, like your customButtons) */}
      {footer && (
        <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default EquipmentLocationCard;
