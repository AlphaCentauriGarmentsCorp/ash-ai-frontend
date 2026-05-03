import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import Textarea from "../../components/form/Textarea";
import FileUpload from "../../components/form/FileUpload";
import FormActions from "../../components/form/FormActions";
import AlertMessage from "../../components/common/AlertMessage";
import ticketService from "../../services/ticketService";

const STATUS_OPTIONS = ["open", "pending", "resolved", "closed"];

export default function TicketForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    request_type: "",
    quotation_id: "",
    order_id: "",
    from_role: "",
    to_role: "",
    message: "",
    status: "open",
    attachments: [],
  });
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isEdit) load();
  }, [id]);

  const load = async () => {
    try {
      const res = await ticketService.get(id);
      const data = res.data || res;
      setForm((f) => ({ ...f, ...{
        request_type: data.request_type || "",
        quotation_id: data.quotation_id || "",
        order_id: data.order_id || "",
        from_role: data.from_role || "",
        to_role: data.to_role || "",
        message: data.message || "",
        status: data.status || "open",
      }}));
      setExistingAttachments(data.attachments || []);
    } catch (err) {
      console.error(err);
      setServerError(err?.response?.data?.message || "Failed to load");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFiles = (name, files) => {
    setForm((s) => ({ ...s, [name]: files }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("request_type", form.request_type);
    if (form.quotation_id) fd.append("quotation_id", form.quotation_id);
    if (form.order_id) fd.append("order_id", form.order_id);
    fd.append("from_role", form.from_role);
    fd.append("to_role", form.to_role);
    fd.append("message", form.message);
    fd.append("status", form.status);

    (form.attachments || []).forEach((f) => fd.append("attachments[]", f));

    try {
      if (isEdit) {
        await ticketService.update(id, fd);
        setSubmitSuccess(true);
        setTimeout(() => navigate(`/tickets/${id}`), 900);
      } else {
        const res = await ticketService.create(fd);
        setSubmitSuccess(true);
        const newId = res.data?.id || res.id;
        setTimeout(() => navigate(`/tickets/${newId || ""}`), 900);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setServerError(err?.response?.data?.message || "Save failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      pageTitle={isEdit ? "Edit Ticket" : "New Ticket"}
      path={isEdit ? `/tickets/${id}/edit` : "/tickets/new"}
      links={[{ label: "Home", href: "/" }, { label: "Tickets", href: "/tickets" }]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage type="success" title="Saved" message="Ticket saved successfully." />
        )}

        {serverError && (
          <AlertMessage type="error" title={serverError} message="Please check the form and try again." />
        )}

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Request Type"
            name="request_type"
            value={form.request_type}
            onChange={handleChange}
            error={errors.request_type}
            required
          />

          <Input label="Quotation ID (optional)" name="quotation_id" value={form.quotation_id} onChange={handleChange} />

          <Input label="Order ID (optional)" name="order_id" value={form.order_id} onChange={handleChange} />

          <Input label="From Role" name="from_role" value={form.from_role} onChange={handleChange} error={errors.from_role} required />

          <Input label="To Role" name="to_role" value={form.to_role} onChange={handleChange} error={errors.to_role} required />

          <Textarea label="Message" name="message" value={form.message} onChange={handleChange} error={errors.message} required rows={8} />

          <div>
            <FileUpload
              label="Attachments"
              name="attachments"
              value={form.attachments}
              onChange={handleFiles}
              acceptedTypes="image/jpg,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/octet-stream"
              multiple={true}
              error={errors.attachments}
            />

            {existingAttachments.length > 0 && (
              <div className="mt-2">
                <label className="text-sm font-semibold">Existing</label>
                <ul className="list-disc pl-5">
                  {existingAttachments.map((a, i) => (
                    <li key={i}><a href={a} target="_blank" rel="noreferrer" className="text-blue-600">{a}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Input label="Status" name="status" value={form.status} onChange={handleChange} type="select" options={STATUS_OPTIONS} />

          <FormActions
            onSubmit={() => {}}
            onReset={() => navigate(-1)}
            isSubmitting={isSubmitting}
            submitText={isEdit ? "Update" : "Save"}
            resetText="Cancel"
            submittingText={isEdit ? "Updating..." : "Saving..."}
          />
        </form>
      </div>
    </AdminLayout>
  );
}
