import api from "../api/axios";

export async function getTrainingPrograms() {
  const response = await api.get("/training-programs/");
  return response.data.results || response.data;
}