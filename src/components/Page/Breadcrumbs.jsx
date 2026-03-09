import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Breadcrumbs({
  icon,
  pageTitle,
  path = "/",
  links = [],
}) {
  const navigate = useNavigate();

  // Handle click for back button if no icon
  const handleBackClick = (e) => {
    e.preventDefault();
    if (!icon) {
      navigate(-1); // Go back to previous route
    }
  };

  return (
    <section className="flex flex-wrap items-center justify-between gap-y-2 py-2 px-3 sm:px-4 md:px-6 border-gray-300 border-b">
      <div className="flex items-center space-x-2 min-w-0">
        <a
          href={path}
          onClick={handleBackClick}
          className="flex items-center text-primary hover:text-primary/90 transition-colors shrink-0"
        >
          <div className="rounded-full flex items-center justify-center border border-primary p-1.5 sm:p-2 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9">
            <i
              className={`fas ${icon ?? "fa-arrow-left"} text-xs sm:text-sm md:text-md`}
            />
          </div>
          <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium truncate max-w-30 xs:max-w-[150px] sm:max-w-50 md:max-w-full hidden xs:inline md:hidden lg:inline">
            {pageTitle}
          </span>
        </a>
      </div>

      <div className="flex items-center text-gray-700 flex-wrap min-w-0 ml-auto sm:ml-0">
        {links.map((item, index) => (
          <React.Fragment key={index}>
            <Link
              to={item.href}
              className="text-xs sm:text-sm font-medium hover:text-primary truncate max-w-15 xs:max-w-[80px] sm:max-w-25 md:max-w-30"
              title={item.label}
            >
              {item.label}
            </Link>

            {index < links.length - 1 && (
              <span className="text-xs font-medium mx-1 sm:mx-1.5 md:mx-2 shrink-0">
                /
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
