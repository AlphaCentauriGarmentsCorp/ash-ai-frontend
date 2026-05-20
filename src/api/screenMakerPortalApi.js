import api from "./axios";

/**
 * Phase 5-F — Screen Maker portal API client.
 *
 * Read-only context endpoint. Notes + mark-as-done go through the
 * existing orderStagesApi (setNotes, complete, etc).
 */
export const screenMakerPortalApi = {
  context: async (orderStageId) => {
    const { data } = await api.get(`/portal/screen-maker/context/${orderStageId}`);
    return data;
  },
};

export default screenMakerPortalApi;
