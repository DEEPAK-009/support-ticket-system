import axios from "./axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

const getApiOrigin = () => apiBaseUrl.replace(/\/api$/, "");

export const getTickets = async (params = {}) => {
  const response = await axios.get("/tickets", { params });
  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await axios.get(`/tickets/${ticketId}`);
  return response.data;
};

export const createTicket = async (payload) => {
  const response = await axios.post("/tickets", payload);
  return response.data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const response = await axios.patch(`/tickets/${ticketId}/status`, { status });
  return response.data;
};

export const updateTicketPriority = async (ticketId, priority) => {
  const response = await axios.patch(`/tickets/${ticketId}/priority`, { priority });
  return response.data;
};

export const assignTicket = async (ticketId, agentId) => {
  const response = await axios.patch(`/tickets/${ticketId}/assign`, { agentId });
  return response.data;
};

export const startTicket = async (ticketId) => {
  const response = await axios.patch(`/tickets/${ticketId}/start`);
  return response.data;
};

export const getMessages = async (ticketId) => {
  const response = await axios.get(`/tickets/${ticketId}/messages`);
  return response.data;
};

export const sendMessage = async (ticketId, message) => {
  const response = await axios.post(`/tickets/${ticketId}/messages`, { message });
  return response.data;
};

export const openTicketMessageStream = (ticketId, handlers = {}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }
  const streamUrl = `${getApiOrigin()}/messages/stream/${ticketId}?token=${encodeURIComponent(token || "")}`;
  const eventSource = new EventSource(streamUrl);

  eventSource.addEventListener("connected", (event) => {
    handlers.onConnected?.(event);
  });

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      handlers.onMessage?.(payload);
    } catch (error) {
      handlers.onError?.(error);
    }
  };

  eventSource.onerror = (error) => {
    handlers.onError?.(error);
  };

  return eventSource;
};
