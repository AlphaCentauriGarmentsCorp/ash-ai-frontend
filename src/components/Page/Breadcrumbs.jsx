import React from "react";

export default function Breadcrumbs({
  icon,
  pageTitle,
  path = "/",
  links = [],
}) {
  return (
    <section className="flex items-center justify-between py-2 px-4 md:px-6 border-gray-300 border-b">
      <div className="flex items-center space-x-2">
        <a
          href={path}
          className="flex items-center text-primary hover:text-primary/90 transition-colors"
        >
          <div className="rounded-full flex items-center justify-center border border-primary p-2 w-8 h-8 md:w-9 md:h-9">
            <i
              className={`fas ${icon ?? "fa-arrow-left"} text-sm md:text-md`}
            />
          </div>
          <span className="ml-2 text-sm font-medium hidden md:inline">
            {pageTitle}
          </span>
        </a>
      </div>

      <div className="flex items-center text-gray-700">
        {links.map((item, index) => (
          <React.Fragment key={index}>
            <a
              href={item.href}
              className="text-xs md:text-sm font-medium hover:text-primary"
            >
              {item.label}
            </a>

            {index < links.length - 1 && (
              <span className="text-xs font-medium mx-1 md:mx-2">/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
