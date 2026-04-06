import api from "../api/axios";

export async function getTrainingSessions(page = 1) {
  const response = await api.get("/training-sessions/", { params: { page } });

  if (Array.isArray(response.data)) {
    return { results: response.data, count: response.data.length };
  }

  return {
    results: response.data.results ?? [],
    count: response.data.count ?? 0,
  };
}

export async function getAllTrainingSessions() {
  const all = [];
  let page = 1;

  while (true) {
    const { results, count } = await getTrainingSessions(page);
    all.push(...results);
    if (all.length >= count || results.length === 0) break;
    page++;
  }

  return all;
}

export async function getTrainingSessionDetail(sessionId) {
  const response = await api.get(`/training-sessions/${sessionId}/`);
  return response.data;
}