import axios from "./axios";

/**
 * Sends a request to change the current user's password.
 * @param {Object} passwords - Contains { old_password, new_password }
 */
export const changePassword = async (passwords) => {
  const response = await axios.post("/auth/change-password", passwords);
  return response.data;
};