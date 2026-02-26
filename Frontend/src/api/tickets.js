import axios from "./axios";

export const getTickets = async (params = {}) => {
  const response = await axios.get("/tickets", {
    params,
  });

  return response.data;
};