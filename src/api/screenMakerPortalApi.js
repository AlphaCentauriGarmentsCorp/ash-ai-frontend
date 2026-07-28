import api from "./axios";

/**
 * Phase 5-F — Screen Maker portal API client.
 *
 * Context is read-only. Notes + mark-as-done go through the existing
 * orderStagesApi (setNotes, complete, etc).
 *
 * SM Rework CP3 — added the "Screens Used" write path (CP2 backend):
 * assign/swap a physical screen to a placement/colour slot, or clear one.
 */
export const screenMakerPortalApi = {
  context: async (orderStageId) => {
    const { data } = await api.get(`/portal/screen-maker/context/${orderStageId}`);
    return data;
  },

  /**
   * Save (or swap) the screen for one placement/colour slot.
   * @param {object} fields - { order_stage_id, placement_id, color_index, screen_id }
   * @returns {Promise<{data: object, conflict: object|null}>}
   */
  assignScreen: async (fields) => {
    const { data } = await api.post("/portal/screen-maker/screens", fields);
    return data;
  },

  /**
   * Clear a slot. Frees the screen if nothing else currently holds it.
   */
  deleteScreenAssignment: async (id) => {
    const { data } = await api.delete(`/portal/screen-maker/screens/${id}`);
    return data;
  },
};

export default screenMakerPortalApi;
