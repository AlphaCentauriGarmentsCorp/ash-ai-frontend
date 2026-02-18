import React, { useState } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import { useNavigate } from "react-router-dom";

const AddSizeLabel = () => {
  const [formData, setFormData] = useState({
    sizeLabelTitle: "",
    description: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
    navigate("/admin/settings/size-label");
  };

  const handleCancel = () => {
    navigate("/admin/settings/size-label");
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Add Size Label"
      path="/admin/settings/size-label/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Size Label", href: "/admin/settings/size-label" },
        { label: "Add Size Label", href: "#" },
      ]}
    >
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Size Label Details Card */}
          <div 
            className="rounded-lg p-6 md:p-8"
            style={{ backgroundColor: "#EBF6FF" }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Size Label Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Size Label Title Field */}
              <div>
                <label 
                  htmlFor="sizeLabelTitle" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Size Label Title
                </label>
                <input
                  type="text"
                  id="sizeLabelTitle"
                  name="sizeLabelTitle"
                  value={formData.sizeLabelTitle}
                  onChange={handleChange}
                  placeholder="Enter additional dropdown"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label 
                  htmlFor="description" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description here..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddSizeLabel;
