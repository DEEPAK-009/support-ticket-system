import axios from "./axios";

export const getAdminAnalytics = async () => {
  const response = await axios.get("/admin/analytics");
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await axios.get("/admin/users");
  return response.data;
};

export const updateAdminUserRole = async (userId, role) => {
  const response = await axios.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const toggleAdminUserStatus = async (userId) => {
  const response = await axios.patch(`/admin/users/${userId}/toggle-active`);
  return response.data;
};

export const getAgentsByCategory = async (categoryId) => {
  const response = await axios.get(`/admin/agents?categoryId=${categoryId}`);
  return response.data;
};
