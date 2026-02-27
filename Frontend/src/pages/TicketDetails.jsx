import { useParams } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import Layout from "../components/Layout";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { startTicket, getMessages, sendMessage } from "../api/tickets";

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);
  const pollingActive = useRef(true);
  const lastMessageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* -------------------- FETCH TICKET -------------------- */
  const fetchTicket = async () => {
    try {
      const res = await axios.get(`/tickets/${id}`);
      const ticketData = res.data;
      setTicket(ticketData);

      if (user?.role === "admin" && ticketData.category_id) {
        const agentRes = await axios.get(
          `/admin/agents?categoryId=${ticketData.category_id}`
        );
        setAgents(agentRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- LONG POLLING -------------------- */
  const pollMessages = async () => {
    if (!pollingActive.current) return;

    try {
      const res = await getMessages(id, lastMessageIdRef.current);

      if (res && res.length > 0) {
        setMessages(prev => [...prev, ...res]);
        lastMessageIdRef.current = res[res.length - 1].id;
      }

      if (pollingActive.current) {
        setTimeout(pollMessages, 2000);
      }
    } catch (err) {
      if (pollingActive.current) {
        setTimeout(pollMessages, 5000);
      }
    }
  };

  useEffect(() => {
    pollingActive.current = true;
    fetchTicket();
    pollMessages();

    return () => {
      pollingActive.current = false;
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* -------------------- SEND MESSAGE -------------------- */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(id, newMessage);
      setNewMessage("");
    } catch {
      setFeedback({ message: "Failed to send message", type: "error" });
    }
  };

  /* -------------------- START TICKET -------------------- */
  const handleStart = async () => {
    try {
      await startTicket(id);
      setTicket(prev => ({ ...prev, status: "In Progress" }));
      setFeedback({ message: "Ticket started!", type: "success" });
    } catch (err) {
      setFeedback({
        message: err.response?.data?.message || "Failed to start",
        type: "error"
      });
    }

    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">Loading ticket details...</div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="p-6 text-red-600">Ticket not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Prevent page scroll overflow */}
      <div className="max-w-5xl mx-auto p-4 h-[90vh] flex flex-col space-y-6 overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Ticket #{ticket.id}</h1>
            <p className="text-gray-600">{ticket.title}</p>
          </div>

          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            {ticket.status}
          </span>
        </div>

        {/* 🔹 RESTORED INFO GRID */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong className="text-gray-600">Category:</strong>{" "}
            {ticket.category_name || "Technical"}
          </p>
          <p>
            <strong className="text-gray-600">Priority:</strong>{" "}
            {ticket.priority}
          </p>
          <p>
            <strong className="text-gray-600">Assigned To:</strong>{" "}
            {ticket.assigned_to_name ||
              (ticket.assigned_to
                ? `Agent ID: ${ticket.assigned_to}`
                : "Unassigned")}
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <p>
            <strong>Created:</strong>{" "}
            {new Date(ticket.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {new Date(ticket.updated_at).toLocaleString()}
          </p>
        </div>
      </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-3">Description</h2>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Start Button */}
        {ticket.status === "Assigned" &&
          user?.id === ticket.assigned_to && (
            <button
              onClick={handleStart}
              className="bg-green-600 text-white px-6 py-2 rounded-md"
            >
              Start Working
            </button>
          )}

        {/* ---------------- CHAT SECTION ---------------- */}
        <div className="bg-white rounded-lg border flex flex-col flex-1 overflow-hidden">

          {/* Chat Header */}
          <div className="p-4 border-b font-semibold bg-gray-50">
            Conversation
          </div>

          {/* Scrollable Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === user.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    msg.sender_id === user.id
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-bold mb-1">
                    {msg.full_name}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.message_text}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Section (fixed) */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t flex gap-2 bg-white"
          >
            <input
              type="text"
              className="flex-1 border rounded px-4 py-2"
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 rounded"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
};

export default TicketDetails;