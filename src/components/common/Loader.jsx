import React from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";

const Loader = ({
  pageTitle = "Add Order",
  path = "/",
  links = [
    { label: "Home", href: "/" },
    { label: "Orders", href: "/orders" },
  ],
}) => {
  const loadingMessages = [
    "Sorting fabrics for your perfect design...",
    "Counting threads to ensure top quality...",
    "Measuring patterns for your style...",
    "Preparing color palettes for your prints...",
    "Checking sizes so nothing feels tight or loose...",
    "Polishing designs for a flawless look...",
    "Mixing inks for vibrant prints...",
    "Ensuring every stitch is on point...",
  ];

  const randomMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <AdminLayout pageTitle={pageTitle} path={path} links={links}>
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-600 text-sm font-medium">{randomMessage}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Loader;
