import api from "../api/axios";

export async function getTrainingSessions() {
  const response = await api.get("/training-sessions/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.results)) {
    return response.data.results;
  }

  return [];
}

export async function getTrainingSessionDetail(sessionId) {
  const response = await api.get(`/training-sessions/${sessionId}/`);
  return response.data;
}