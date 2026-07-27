import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Loader from "../../components/common/Loader";
import { materialsApi } from "../../api/materialsApi";

// Formats a numeric value as Philippine peso, e.g. 1320 -> "P1,320.00".
const formatPeso = (value) => {
  const num = Number(value);
  if (value === null || value === undefined || value === "" || Number.isNaN(num)) {
    return null;
  }
  return `\u20b1${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// One labelled stat tile in the details grid.
const InfoTile = ({ icon, label, value, accent }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
    <div className="w-9 h-9 border border-gray-200 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
      <i className={`fa-solid ${icon} text-gray-500 text-sm`}></i>
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {value ? (
        <p
          className={`text-sm font-semibold wrap-break-word ${
            accent ?? "text-gray-900"
          }`}
        >
          {value}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">Not set</p>
      )}
    </div>
  </div>
);

const ViewMaterials = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const links = [
    { label: "Home", href: "/" },
    { label: "Materials", href: "/supplier/materials" },
    { label: "Details", href: "#" },
  ];

  useEffect(() => {
    fetchMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setIsLoading(true);
      const response = await materialsApi.show(id);
      setMaterial(response.data ?? response);
      setError("");
    } catch (err) {
      console.error("Error fetching material:", err);
      setError("Failed to load material details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader icon="fa-cube" pageTitle="Material Details" path="/" links={links} />;
  }

  if (error || !material) {
    return (
      <AdminLayout icon="fa-cube" pageTitle="Material Details" path="/" links={links}>
        <div className="bg-light p-4 sm:p-7 rounded-lg border border-gray-300">
          <div className="text-center py-8 sm:py-12">
            <i className="fa-solid fa-exclamation-circle text-4xl sm:text-5xl text-red-500 mb-4"></i>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">
              {error || "Material not found"}
            </p>
            <Link
              to="/supplier/materials"
              className="px-4 sm:px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center text-sm sm:text-base"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Materials
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stock = Number(material.stock_on_hand ?? 0);
  const addedOn = formatDate(material.created_at);
  const updatedOn = formatDate(material.updated_at);

  return (
    <AdminLayout
      icon="fa-cube"
      pageTitle="Material Details"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Materials", href: "/supplier/materials" },
        { label: material.name || "Material", href: "#" },
      ]}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-light p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-gray-300">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4 md:gap-5 w-full lg:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-linear-to-br from-secondary/20 to-secondary/5 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm ring-2 sm:ring-4 ring-secondary/5">
                <i className="fa-solid fa-cube text-secondary text-xl sm:text-2xl md:text-3xl"></i>
              </div>

              <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight wrap-break-word">
                    {material.name}
                  </h1>
                  {material.material_type && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold bg-secondary/10 text-secondary rounded-full border border-secondary/20 shadow-sm">
                      {material.material_type}
                    </span>
                  )}
                  {stock <= 0 && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-200 shadow-sm flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation" />
                      No Stock
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <i className="fa-regular fa-building text-gray-500 text-xs sm:text-sm"></i>
                    </div>
                    {material.supplier ? (
                      <Link
                        to={`/supplier/${material.supplier_id}/view`}
                        className="truncate font-medium text-secondary hover:underline"
                      >
                        {material.supplier.name}
                      </Link>
                    ) : (
                      <span className="truncate font-medium text-gray-400 italic">
                        No Supplier
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <i className="fa-regular fa-calendar text-gray-500 text-xs sm:text-sm"></i>
                    </div>
                    <span className="font-medium truncate">
                      {addedOn ? `Added ${addedOn}` : "\u2014"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full lg:w-auto lg:ml-auto lg:self-center">
              <Link
                to={`/admin/settings/materials/edit/${material.id}`}
                className="flex-1 lg:flex-none px-3 sm:px-5 py-2 sm:py-3 bg-secondary text-white rounded-lg sm:rounded-xl hover:bg-secondary/90 transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold group"
              >
                <i className="fa-solid fa-pen group-hover:scale-110 transition-transform duration-200 text-xs sm:text-sm"></i>
                <span>Edit Material</span>
              </Link>
              <Link
                to="/supplier/materials"
                className="flex-1 lg:flex-none px-3 sm:px-5 py-2 sm:py-3 bg-white border border-gray-200 sm:border-2 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold"
              >
                <i className="fa-solid fa-arrow-left text-xs sm:text-sm"></i>
                <span>Back</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="bg-light p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-gray-300">
          <h2 className="font-semibold text-lg sm:text-xl border-b text-primary border-gray-300 pb-2 mb-4">
            Material Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <InfoTile
              icon="fa-tag"
              label="Material Type"
              value={material.material_type}
            />
            <InfoTile
              icon="fa-peso-sign"
              label="Price"
              value={
                formatPeso(material.price)
                  ? `${formatPeso(material.price)}${
                      material.unit ? ` / ${material.unit}` : ""
                    }`
                  : null
              }
            />
            <InfoTile icon="fa-ruler" label="Unit" value={material.unit} />
            <InfoTile
              icon="fa-boxes-stacked"
              label="Stock on Hand"
              value={stock.toLocaleString("en-PH", { maximumFractionDigits: 2 })}
              accent={stock > 0 ? "text-gray-900" : "text-amber-600"}
            />
            <InfoTile
              icon="fa-cart-shopping"
              label="Minimum Units"
              value={material.minimum}
            />
            <InfoTile icon="fa-clock" label="Lead Time" value={material.lead} />
          </div>

          {updatedOn && (
            <p className="text-xs text-gray-400 mt-4">
              Last updated {updatedOn}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="bg-light p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-gray-300">
          <h2 className="font-semibold text-lg sm:text-xl border-b text-primary border-gray-300 pb-2 mb-4">
            Notes
          </h2>
          {material.notes ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
              {material.notes}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No Notes</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewMaterials;
