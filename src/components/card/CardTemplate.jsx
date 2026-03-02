import React from "react";

/**
 * Card Component
 * A flexible container for grouping related content.
 */
const CardTemplate = ({
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
        <div className={`bg-primary px-6 py-4 relative ${headerClass}`}>
          {/* Action Buttons (top right) */}
          {actionButtons && (
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {actionButtons}
            </div>
          )}
          
          <div className="flex items-start gap-6">
            {/* Icon - Large circular white background */}
            {icon && (
              <div className="bg-white rounded-full p-5 flex-shrink-0 self-center">
                {icon}
              </div>
            )}
            
            {/* Content Section */}
            <div className="flex-1">
              {/* Title and Description */}
              <div className="pr-16">
                {title && <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>}
                {subtitle && <p className="text-sm text-gray-200 leading-relaxed">{subtitle}</p>}
              </div>

              {/* Stats Section */}
              {stats && (
                <div className="flex items-center mt-4">
                  <div className="flex items-center justify-between flex-1 pr-24">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-2 text-white">
                        {stat.icon && <span className="text-sm">{stat.icon}</span>}
                        <span className="text-sm font-medium">{stat.label}: {stat.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* View Link - inline with stats */}
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
          <div className={`px-6 py-4 ${bodyClass}`}>
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
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
        <div className={`px-6 py-4 border-b border-gray-100 ${headerClass}`}>
          {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Main Content (The "Body") */}
      <div className={`px-6 py-4 ${bodyClass}`}>
        {children}
      </div>

      {/* Footer Section (optional, like your customButtons) */}
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default CardTemplate;
