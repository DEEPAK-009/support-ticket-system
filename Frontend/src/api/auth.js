import axios from "./axios";

export const loginUser = async (credentials) => {
  const response = await axios.post("/auth/login", credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get("/auth/me");
  return response.data;
};

export const changePassword = async (passwords) => {
  const response = await axios.post("/auth/change-password", passwords);
  return response.data;
};
