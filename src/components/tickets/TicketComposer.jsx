import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Input from "../form/Input";
import Textarea from "../form/Textarea";
import FileUpload from "../form/FileUpload";
import ticketService from "../../services/ticketService";
import { roleApi } from "../../api/roleApi";
import { extractUserPrimaryRole } from "../../utils/authz";

// A compact ticket composer component intended to be mounted behind buttons.
// - request_type: shown but not editable (default 'Request')
// - quotation_id / order_id: hidden but can be passed as props to prefill
// - from_role: prefilled from current user's role
// - to_role: fetched from roleApi
// - status: hidden and set to 'open'

export default function TicketComposer({
  quotationId = null,
  orderId = null,
  requestType = "Request",
  onCreated,
  forceOpen = false,
  hideTrigger = false,
  initialToRole = "",
  initialAttachmentUrls = [],
  initialAttachments = [],
}) {
  const { user } = useAuth();
  const requestTypeOptions = ["Request", "Quotation", "Order"];
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toRoles, setToRoles] = useState([]);
  const [form, setForm] = useState({
    request_type: requestType,
    quotation_id: quotationId,
    order_id: orderId,
    from_role: "",
    to_role: "",
    message: "",
    attachments: [],
    status: "open",
  });
  const [errors, setErrors] = useState({});
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "";
    const timer = setTimeout(() => setIsAnimating(false), 220);
    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    // derive from_role from logged-in user
    if (user) {
      const roleStr = extractUserPrimaryRole(user);
      setForm((f) => ({ ...f, from_role: roleStr }));
    }
  }, [user]);

  useEffect(() => {
    setForm((f) => ({ ...f, request_type: requestType }));
  }, [requestType]);

  useEffect(() => {
    if (initialToRole) {
      setForm((f) => ({ ...f, to_role: initialToRole }));
    }
  }, [initialToRole]);

  useEffect(() => {
    if (Array.isArray(initialAttachmentUrls) && initialAttachmentUrls.length > 0) {
      // keep a readonly preview list of attachment URLs
      setForm((f) => ({ ...f }));
    }
  }, [initialAttachmentUrls]);

  const isImageUrl = (u) => {
    if (!u) return false;
    if (typeof u !== "string") return false;
    if (u.startsWith("data:")) return true;
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(u);
  };

  const getFilenameFromUrl = (u) => {
    if (!u) return "file";
    try {
      const parsed = new URL(u, window.location.origin);
      return (parsed.pathname || u).split("/").pop().split("?")[0];
    } catch {
      return u.split("/").pop().split("?")[0];
    }
  };

  useEffect(() => {
    if (forceOpen) setVisible(true);
  }, [forceOpen]);

  useEffect(() => {
    const loadRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await roleApi.index();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setToRoles(list.map((r) => (typeof r === "string" ? r : r.name || r.title || r.id)));
      } catch (err) {
        console.error("Failed to load roles", err);
      } finally {
        setLoadingRoles(false);
      }
    };
    loadRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFiles = (name, files) => {
    setForm((s) => ({ ...s, [name]: files }));
  };

  const submit = async (e) => {
    e && e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const fd = new FormData();
    fd.append("request_type", form.request_type);
    if (form.quotation_id) fd.append("quotation_id", form.quotation_id);
    if (form.order_id) fd.append("order_id", form.order_id);
    fd.append("from_role", form.from_role);
    fd.append("to_role", form.to_role);
    fd.append("message", form.message);
    fd.append("status", form.status);
    (form.attachments || []).forEach((f) => fd.append("attachments[]", f));
    if (Array.isArray(initialAttachments) && initialAttachments.length > 0) {
      initialAttachments.forEach((a) => a?.url && fd.append("attachment_urls[]", a.url));
    }
    if (Array.isArray(initialAttachmentUrls) && initialAttachmentUrls.length > 0) {
      initialAttachmentUrls.forEach((u) => fd.append("attachment_urls[]", u));
    }

    try {
      const res = await ticketService.create(fd);
      setVisible(false);
      setForm((f) => ({ ...f, message: "", attachments: [] }));
      onCreated && onCreated(res.data || res);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setErrors({ _global: err.response?.data?.message || "Failed to create ticket" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closeComposer = () => {
    setVisible(false);
  };

  const modalButtonClass =
    "inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-secondary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-secondary/30";

  if (!isAnimating && !visible) {
    if (hideTrigger) return null;
    return (
      <button type="button" className={modalButtonClass} onClick={() => setVisible(true)}>
        <i className="fa-solid fa-pen-to-square"></i>
        <span>Compose Ticket</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-2 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={closeComposer}
        aria-label="Close ticket composer"
      />

      <form
        onSubmit={submit}
        className={`relative z-10 w-full max-w-[min(95vw,720px)] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 ${
          visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
        }`}
      >
        <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <i className="fa-solid fa-ticket"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">Compose Ticket</p>
              <p className="mt-0.5 text-[11px] text-white/70 truncate">Send a new request without leaving the page</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeComposer}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          {errors._global && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {errors._global}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-primary flex items-center text-sm font-semibold">
                Request Type
                <span className="ml-1 text-red-500">*</span>
              </label>
              <select
                name="request_type"
                value={form.request_type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 transition-colors duration-200 hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                {requestTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* hidden ids kept in state, not rendered */}

            <div>
              <Input
                label="From Role"
                name="from_role"
                value={form.from_role}
                onChange={handleChange}
                disabled
              />
            </div>

            <div>
              <label className="text-primary text-sm font-semibold flex items-center">
                To Role
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="to_role"
                value={form.to_role}
                onChange={handleChange}
                className="text-sm mt-2 border rounded-lg py-2 px-4 w-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary bg-white text-gray-800 border-gray-300 hover:border-gray-400"
              >
                <option value="">Select role</option>
                {loadingRoles ? (
                  <option value="">Loading...</option>
                ) : (
                  toRoles.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))
                )}
              </select>
              {errors.to_role && <div className="mt-1 text-xs text-red-500">{errors.to_role[0]}</div>}
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                error={errors.message}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-primary text-sm font-semibold">Attachments</label>
              {Array.isArray(initialAttachments) && initialAttachments.length > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {initialAttachments.map((a, i) => {
                    const url = a.url;
                    const isImg = isImageUrl(url);
                    const filename = a.label || getFilenameFromUrl(url);
                    const ext = (filename.split(".").pop() || "").toLowerCase();
                    const iconClass = ext === "pdf" ? "fa-file-pdf text-red-500" : "fa-file-alt text-gray-500";
                    return (
                      <div key={i} className="flex flex-col items-start">
                        <a href={url} target="_blank" rel="noreferrer" className="inline-block">
                          {isImg ? (
                            <img src={url} alt={filename} className="h-16 w-16 rounded border border-gray-200 object-cover bg-white" />
                          ) : (
                            <div className="h-16 w-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
                              <i className={`fas ${iconClass} text-2xl`}></i>
                            </div>
                          )}
                        </a>
                        <div className="mt-1 text-xs text-gray-700 break-all max-w-full">{filename}</div>
                      </div>
                    );
                  })}
                </div>
              ) : Array.isArray(initialAttachmentUrls) && initialAttachmentUrls.length > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {initialAttachmentUrls.map((u, i) => {
                    const isImg = isImageUrl(u);
                    const filename = getFilenameFromUrl(u);
                    const ext = (filename.split(".").pop() || "").toLowerCase();
                    const iconClass = ext === "pdf" ? "fa-file-pdf text-red-500" : "fa-file-alt text-gray-500";
                    return (
                      <div key={i} className="flex flex-col items-start">
                        <a href={u} target="_blank" rel="noreferrer" className="inline-block">
                          {isImg ? (
                            <img src={u} alt={filename} className="h-16 w-16 rounded border border-gray-200 object-cover bg-white" />
                          ) : (
                            <div className="h-16 w-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
                              <i className={`fas ${iconClass} text-2xl`}></i>
                            </div>
                          )}
                        </a>
                        <div className="mt-1 text-xs text-gray-700 break-all max-w-full">{filename}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <FileUpload
                  label="Attachments"
                  name="attachments"
                  value={form.attachments}
                  onChange={handleFiles}
                  multiple
                  acceptedTypes="image/*,application/pdf,image/vnd.adobe.photoshop"
                  error={errors.attachments}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2.5 sm:px-5">
          <p className="text-xs text-gray-500">Your ticket will be created with status open.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              onClick={closeComposer}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-secondary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
