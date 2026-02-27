import axios from "./axios";

// 1. Fetch Tickets
export const getTickets = async (params = {}) => {
  const response = await axios.get("/tickets", {
    params,
  });
  return response.data;
}; // <--- MAKE SURE THIS BRACE IS HERE

// 2. Start Ticket (Agent Action)
export const startTicket = async (ticketId) => {
  const response = await axios.patch(`/tickets/${ticketId}/start`);
  return response.data;
};

// 3. Get Messages (Long Polling)
export const getMessages = async (ticketId, lastId = 0) => {
  const response = await axios.get(`/tickets/${ticketId}/messages`, {
    params: { lastId }
  });
  return response.data;
};

// 4. Send Message
export const sendMessage = async (ticketId, message) => {
  const response = await axios.post(`/tickets/${ticketId}/messages`, { message });
  return response.data;
};