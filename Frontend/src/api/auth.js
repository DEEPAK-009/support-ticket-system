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

export const verifyAdminPassword = async (adminPassword) => {
  const response = await axios.post("/auth/admin/verify", { adminPassword });
  return response.data;
};

export const adminCreateUser = async ({
  email,
  password,
  full_name,
  role,
  department_id,
  level,
  employee_id,
  adminToken
}) => {
  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  const response = await axios.post(
    "/auth/admin/create-user",
    {
      email,
      password,
      full_name,
      role,
      department_id,
      level,
      employee_id,
      adminToken
    },
    { headers }
  );
  return response.data;
};

export const getDepartments = async () => {
  const response = await axios.get("/auth/departments");
  return response.data;
};
