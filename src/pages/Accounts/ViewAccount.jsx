import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import { accountService } from "../../services/accountService";

const formatRole = (role) =>
  role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function ViewAccount() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await accountService.getAccount(id);
        if (active) setAccount(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.status === 404
              ? "Account not found."
              : "Failed to load account.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const details = account?.employee_details ?? {};
  const current =
    account?.addresses?.find((a) => a.type === "current") ?? {};
  const permanent =
    account?.addresses?.find((a) => a.type === "permanent") ?? {};
  const roles = Array.isArray(account?.domain_role)
    ? account.domain_role
    : account?.domain_role
      ? [account.domain_role]
      : [];

  return (
    <AdminLayout
      icon="fa-user"
      pageTitle="View Account"
      path="/account/employee"
      links={[
        { label: "Home", href: "/" },
        { label: "Accounts", href: "/account/employee" },
        { label: "View", href: "#" },
      ]}
    >
      <div className="bg-light text-red p-3 lg:p-7 rounded-lg border border-gray-300">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            Loading account...
          </div>
        ) : error ? (
          <div className="mb-2 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b text-primary border-gray-300 pb-3 gap-3">
              <h1 className="font-semibold text-xl">Account Details</h1>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/account/employee")}
                  className="px-5 py-2 border rounded-lg border-gray-300 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                >
                  <i className="fa-solid fa-arrow-left mr-2"></i>Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/account/employee/${id}/edit`)
                  }
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm transition-colors"
                >
                  <i className="fa-solid fa-pen mr-2"></i>Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 p-4">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-3">
                  <Input label="First Name" name="v_first" value={details.first_name ?? ""} readOnly />
                  <Input label="Middle Name" name="v_middle" value={details.middle_name ?? ""} readOnly />
                  <Input label="Last Name" name="v_last" value={details.last_name ?? ""} readOnly />
                  <Input label="Username" name="v_username" value={account.username ?? ""} readOnly />
                  <Input label="Email Address" name="v_email" value={account.email ?? ""} readOnly />
                  <Input label="Contact Number" name="v_contact" value={details.contact_number ?? ""} readOnly />
                  <Input label="Gender" name="v_gender" value={details.gender ? formatRole(details.gender) : ""} readOnly />
                  <Input label="Civil Status" name="v_civil" value={details.civil_status ? formatRole(details.civil_status) : ""} readOnly />
                  <Input label="Birthdate" name="v_birth" value={details.birthdate ?? ""} readOnly />
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 bg-white rounded-lg min-h-50 w-full overflow-hidden">
                {account.avatar ? (
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-full h-full min-h-50 object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-50 flex flex-col items-center justify-center">
                    <i className="fa-solid fa-user text-3xl text-gray-300 mb-3"></i>
                    <p className="text-gray-400 text-sm">No profile image</p>
                  </div>
                )}
              </div>
            </div>

            <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
              Current Address
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-4">
              <Input label="Street" name="v_cstreet" value={current.street ?? ""} readOnly className="md:col-span-2 lg:col-span-4" />
              <Input label="Province" name="v_cprov" value={current.province ?? ""} readOnly />
              <Input label="Barangay" name="v_cbrgy" value={current.brangay ?? ""} readOnly />
              <Input label="City" name="v_ccity" value={current.city ?? ""} readOnly />
              <Input label="Postal Code" name="v_cpostal" value={current.postal ?? ""} readOnly />
            </div>

            <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
              Permanent Address
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-4">
              <Input label="Street" name="v_pstreet" value={permanent.street ?? ""} readOnly className="md:col-span-2 lg:col-span-4" />
              <Input label="Province" name="v_pprov" value={permanent.province ?? ""} readOnly />
              <Input label="Barangay" name="v_pbrgy" value={permanent.brangay ?? ""} readOnly />
              <Input label="City" name="v_pcity" value={permanent.city ?? ""} readOnly />
              <Input label="Postal Code" name="v_ppostal" value={permanent.postal ?? ""} readOnly />
            </div>

            <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
              Job Position and Roles
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4">
              <Input label="Job Position" name="v_position" value={details.position ?? ""} readOnly />
              <Input label="Department" name="v_department" value={details.department ?? ""} readOnly />
            </div>
            <div className="mx-4 mb-5">
              <h1 className="text-primary text-sm font-semibold mb-3">
                Role Assignment
              </h1>
              <div className="py-4 px-4 bg-white border border-gray-300 rounded">
                {roles.length > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <span className="block text-xs text-gray-400 mb-1">
                        Primary Role
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {formatRole(roles[0])}
                      </span>
                    </div>
                    {roles.length > 1 && (
                      <div>
                        <span className="block text-xs text-gray-400 mb-1">
                          Secondary Roles
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {roles.slice(1).map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
                            >
                              {formatRole(role)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No roles assigned</span>
                )}
              </div>
            </div>

            <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
              Documents
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4">
              <Input label="Pag-ibig No." name="v_pagibig" value={details.pagibig ?? ""} readOnly />
              <Input label="SSS No." name="v_sss" value={details.sss ?? ""} readOnly />
              <Input label="Philhealth No." name="v_philhealth" value={details.philhealth ?? ""} readOnly />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
