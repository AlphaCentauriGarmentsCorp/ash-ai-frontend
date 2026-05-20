import api from "./axios";

export const sewerPortalApi = {
  context: async (orderStageId) => {
    const { data } = await api.get(`/portal/sewer/context/${orderStageId}`);
    return data;
  },

  createMaterialLog: async (fields) => {
    const { data } = await api.post("/portal/sewer/material-logs", fields);
    return data;
  },

  deleteMaterialLog: async (id) => {
    const { data } = await api.delete(`/portal/sewer/material-logs/${id}`);
    return data;
  },

  createSampleUpload: async (fields, photoFront, photoBack) => {
    const fd = new FormData();
    fd.append("order_id", fields.order_id);
    fd.append("order_stage_id", fields.order_stage_id);
    if (fields.remarks) fd.append("remarks", fields.remarks);
    if (fields.sample_status) fd.append("sample_status", fields.sample_status);
    if (photoFront) fd.append("photo_front", photoFront);
    if (photoBack) fd.append("photo_back", photoBack);

    const { data } = await api.post("/portal/sewer/sample-uploads", fd, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  updateSampleUpload: async (id, fields, photoFront, photoBack) => {
    const fd = new FormData();
    if (fields.remarks !== undefined) fd.append("remarks", fields.remarks);
    if (fields.sample_status) fd.append("sample_status", fields.sample_status);
    if (photoFront) fd.append("photo_front", photoFront);
    if (photoBack) fd.append("photo_back", photoBack);
    fd.append("_method", "PATCH");

    const { data } = await api.post(`/portal/sewer/sample-uploads/${id}`, fd, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  deleteSampleUpload: async (id) => {
    const { data } = await api.delete(`/portal/sewer/sample-uploads/${id}`);
    return data;
  },
};

export default sewerPortalApi;
