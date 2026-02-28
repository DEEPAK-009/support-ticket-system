import { useParams } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import Layout from "../components/Layout";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { startTicket, sendMessage } from "../api/tickets";

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  useEffect(() => {
  console.log("AUTH USER:", user);
}, [user]);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [pendingChanges, setPendingChanges] = useState({
    status: "",
    priority: "",
    assigned_to: ""
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ---------------- FETCH TICKET ----------------

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`/tickets/${id}`);
      const ticketData = res.data;
      setTicket(ticketData);

      setPendingChanges({
        status: ticketData.status,
        priority: ticketData.priority,
        assigned_to: ticketData.assigned_to || ""
      });

      if (user?.role === "admin") {
        const categoryParam = ticketData.category_id
          ? `?categoryId=${ticketData.category_id}`
          : "";
        const agentRes = await axios.get(`/admin/agents${categoryParam}`);
        setAgents(agentRes.data);
      }
    } catch (err) {
      console.error("Error loading ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH INITIAL MESSAGES ----------------

  const fetchInitialMessages = async () => {
    try {
      const res = await axios.get(`/tickets/${id}/messages`);

      const unique = Array.from(
        new Map(res.data.map((m) => [m.id, m])).values()
      );

      setMessages(unique);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  // ---------------- MAIN EFFECT ----------------

  useEffect(() => {
    if (!user) return; // 🚨 CRITICAL FIX

    let mounted = true;
    setLoading(true);

    const init = async () => {
      await fetchTicket();

      if (user.role !== "admin") {
        await fetchInitialMessages();

        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found for SSE");
          return;
        }

        const es = new EventSource(
          `http://localhost:5050/api/messages/stream/${id}?token=${token}`
        );

        eventSourceRef.current = es;

        es.onmessage = (event) => {
          if (!mounted) return;

          const newMsg = JSON.parse(event.data);

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg].sort((a, b) => a.id - b.id);
          });
        };

        es.onerror = (err) => {
          console.error("SSE error:", err);
        };
      }
    };

    init();

    return () => {
      mounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(id, newMessage);
      setNewMessage("");
    } catch (err) {
      setFeedback({ message: "Failed to send message", type: "error" });
    }
  };

  // ---------------- ADMIN ACTIONS ----------------

  const handleConfirmAllChanges = async () => {
    try {
      const agentIdValue =
        pendingChanges.assigned_to === ""
          ? null
          : Number(pendingChanges.assigned_to);

      const requests = [];

      if (pendingChanges.status !== ticket.status) {
        requests.push(
          axios.patch(`/tickets/${id}/status`, {
            status: pendingChanges.status
          })
        );
      }

      if (pendingChanges.priority !== ticket.priority) {
        requests.push(
          axios.patch(`/tickets/${id}/priority`, {
            priority: pendingChanges.priority
          })
        );
      }

      if (agentIdValue !== ticket.assigned_to) {
        requests.push(
          axios.patch(`/tickets/${id}/assign`, {
            agentId: agentIdValue
          })
        );
      }

      if (requests.length > 0) {
        await Promise.all(requests);
        setFeedback({
          message: "Changes saved successfully!",
          type: "success"
        });
        fetchTicket();
      }
    } catch (err) {
      setFeedback({
        message: "Update failed",
        type: "error"
      });
    }

    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  };

  const handleStart = async () => {
    try {
      await startTicket(id);
      setTicket((prev) => ({ ...prev, status: "In Progress" }));
      setFeedback({ message: "Ticket started!", type: "success" });
    } catch (err) {
      setFeedback({ message: "Failed to start", type: "error" });
    }

    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  };

  if (loading)
    return (
      <Layout>
        <p className="p-6">Loading ticket details...</p>
      </Layout>
    );

  if (!ticket)
    return (
      <Layout>
        <p className="p-6 text-red-600">Ticket not found.</p>
      </Layout>
    );

  // Format Date Label (Today / Yesterday / Full Date)
  const getDateLabel = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      messageDate.toDateString() === today.toDateString();

    const isYesterday =
      messageDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return messageDate.toLocaleDateString();
  };

  // Format Time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Layout>
      <div className="h-screen overflow-hidden flex justify-center">
        <div className="w-full max-w-5xl p-4 flex flex-col space-y-6 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              Ticket #{ticket.id}
            </h1>
            <p className="text-gray-600">{ticket.title}</p>
          </div>

          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            {ticket.status}
          </span>
        </div>

        {/* INFO CARD */}
        <div className="bg-white p-6 rounded-lg shadow border grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p><strong>Category:</strong> {ticket.category_name}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Assigned To:</strong> {ticket.assigned_to_name || "Unassigned"}</p>
          </div>

          <div>
            <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* AGENT START BUTTON */}
        {ticket.status === "Assigned" && user?.id === ticket.assigned_to && (
          <button
            onClick={handleStart}
            className="bg-green-600 text-white px-6 py-2 rounded-md font-bold"
          >
            Start Working on Ticket
          </button>
        )}

        {/* ✅ MESSAGING - HIDDEN FOR ADMIN */}
        {user?.role !== "admin" && (ticket.status === "In Progress" || ticket.status === "Awaiting User Response" || ticket.status === "Resolved") && (
          <div className="bg-white rounded-lg shadow border flex flex-col flex-1 overflow-hidden">

            <div className="p-4 border-b font-semibold bg-gray-50">
              Conversation
            </div>

            {/* SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => {
                console.log("FULL MESSAGE OBJECT:", msg);
              const isCurrentUser = Number(msg.sender_id) === Number(user.id);

              const showDate =
                index === 0 ||
                new Date(msg.created_at).toDateString() !==
                  new Date(messages[index - 1].created_at).toDateString();

              const showHeader =
                index === 0 ||
                msg.sender_id !== messages[index - 1].sender_id;

              return (
                <div key={msg.id}>
                  
                  {showDate && (
                    <div className="text-center text-gray-400 text-sm my-4">
                      {getDateLabel(msg.created_at)}
                    </div>
                  )}

                  <div
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {showHeader && (
                        <p className="text-xs font-bold mb-1 opacity-80">
                          {msg.full_name} ({msg.role})
                        </p>
                      )}

                      <p className="text-sm whitespace-pre-wrap">
                        {msg.message_text}
                      </p>

                      <p className="text-[10px] mt-1 opacity-70 text-right">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t flex gap-2"
            >
              <input
                type="text"
                className="flex-1 border rounded px-4 py-2"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                }
              />
              <button className="bg-blue-600 text-white px-5 py-2 rounded">
                Send
              </button>
            </form>
          </div>
        )}

        {/* ADMIN CONTROLS */}
        {user?.role === "admin" && (
          <div className="bg-gray-50 p-6 rounded-lg border shadow space-y-4">
            <h2 className="font-semibold text-gray-800">Admin Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Select */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                <select
                  value={pendingChanges.status}
                  onChange={(e) => setPendingChanges({...pendingChanges, status: e.target.value})}
                  className="w-full border p-2 rounded bg-white text-sm"
                >
                  <option>Open</option>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Awaiting User Response</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Priority</label>
                <select
                  value={pendingChanges.priority}
                  onChange={(e) => setPendingChanges({...pendingChanges, priority: e.target.value})}
                  className="w-full border p-2 rounded bg-white text-sm"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              {/* ✅ RESTORED: Agent Assignment Select */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Assign Agent</label>
                <select
                  value={pendingChanges.assigned_to}
                  onChange={(e) => setPendingChanges({...pendingChanges, assigned_to: e.target.value})}
                  className="w-full border p-2 rounded bg-white text-sm"
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {/* Ensure agent.full_name matches your database column name */}
                      {agent.full_name || agent.name || `Agent ID: ${agent.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm">
                {feedback.message && (
                  <span className={feedback.type === "success" ? "text-green-600" : "text-red-600"}>
                    {feedback.message}
                  </span>
                )}
              </div>
              <button
                onClick={handleConfirmAllChanges}
                className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition"
              >
                Confirm All Changes
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetails;

