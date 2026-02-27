import axios from "./axios";

export const getTickets = async (params = {}) => {
  const response = await axios.get("/tickets", {
    params,
  });

  return response.data;
};

export const startTicket = async (ticketId) => {
  const response = await axios.patch(`/tickets/${ticketId}/start`);
  return response.data;
};
