import React from "react";
import Select from "./Select";
import { RoleAccess } from "../../constants/formOptions/accountOptions";

/**
 * Role assignment control for Issue 16 (primary + secondary roles).
 *
 * Storage convention: the parent keeps a single `roles` array where
 * index 0 is the PRIMARY role and the remaining entries are secondary.
 * This component reads/writes that array via `value` / `onChange` and
 * never changes the backend contract — it just shapes the UX.
 *
 * Props:
 *   value:    string[]  current roles array ([primary, ...secondaries])
 *   onChange: (string[]) => void
 *   error:    string     validation message for the roles field
 *   disabled: boolean
 */
const RoleAssignment = ({ value = [], onChange, error = "", disabled = false }) => {
  const roles = Array.isArray(value) ? value : [];
  const primary = roles[0] || "";
  const secondaries = roles.slice(1);

  const emit = (nextPrimary, nextSecondaries) => {
    const combined = nextPrimary
      ? [nextPrimary, ...nextSecondaries.filter((r) => r !== nextPrimary)]
      : [];
    onChange(combined);
  };

  const handlePrimaryChange = (e) => {
    const newPrimary = e.target.value;
    // If the chosen primary was previously a secondary, drop it from secondaries.
    emit(
      newPrimary,
      secondaries.filter((r) => r !== newPrimary),
    );
  };

  const handleSecondaryToggle = (roleValue, checked) => {
    const next = checked
      ? [...secondaries, roleValue]
      : secondaries.filter((r) => r !== roleValue);
    emit(primary, next);
  };

  // The primary role is excluded from the secondary choices so it can't be
  // selected twice.
  const secondaryOptions = RoleAccess.filter((r) => r.value !== primary);

  return (
    <div className="mx-4 mb-5">
      <h1 className="text-primary text-sm font-semibold flex items-center mb-3">
        Role Assignment<span className="text-red-500 ml-1">*</span>
      </h1>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items-center">
          <i className="fa-solid fa-exclamation-circle text-red-500 mr-2"></i>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-300 rounded p-4 sm:p-6">
        {/* Primary role */}
        <div className="mb-5">
          <Select
            label="Primary Role"
            name="primaryRole"
            options={RoleAccess}
            value={primary}
            onChange={handlePrimaryChange}
            placeholder="Select the main role"
            required
            disabled={disabled}
            searchable
          />
          <p className="text-xs text-gray-400 mt-1">
            The staff member&#39;s main role. Determines how their tasks are
            grouped in their portal.
          </p>
        </div>

        {/* Secondary roles */}
        <div>
          <h2 className="text-primary/70 text-xs font-semibold mb-3">
            Secondary Roles{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </h2>

          {!primary ? (
            <p className="text-gray-400 text-sm italic">
              Select a primary role first to add secondary roles.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {secondaryOptions.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`secondary-${role.value}`}
                    value={role.value}
                    disabled={disabled}
                    checked={secondaries.includes(role.value)}
                    onChange={(e) =>
                      handleSecondaryToggle(role.value, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`secondary-${role.value}`}
                    className="text-sm text-gray-700"
                  >
                    {role.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleAssignment;
