import { useParams } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import {
  assignTicket,
  getMessages,
  getTicketById,
  openTicketMessageStream,
  sendMessage,
  startTicket,
  updateTicketPriority,
  updateTicketStatus
} from "../api/tickets";
import { getAgentsByCategory } from "../api/admin";

const statusBadgeMap = {
  Open: "bg-slate-100 text-slate-700",
  Assigned: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Awaiting User Response": "bg-violet-100 text-violet-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-200 text-slate-700"
};

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [pendingChanges, setPendingChanges] = useState({
    status: "",
    priority: "",
    assigned_to: ""
  });
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const isAssignedAgent = user?.role === "agent" && Number(user?.id) === Number(ticket?.assigned_to);

  const loadTicket = async () => {
    const ticketData = await getTicketById(id);
    setTicket(ticketData);
    setPendingChanges({
      status: ticketData.status,
      priority: ticketData.priority,
      assigned_to: ticketData.assigned_to || ""
    });

    if (isAdmin && ticketData.category_id) {
      const agentList = await getAgentsByCategory(ticketData.category_id);
      setAgents(agentList);
    }
  };

  const loadMessages = async () => {
    const messageList = await getMessages(id);
    setMessages(messageList);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([loadTicket(), loadMessages()]);
      } catch (error) {
        if (mounted) {
          setFeedback({
            message: error.response?.data?.message || "Unable to load ticket details.",
            type: "error"
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const stream = openTicketMessageStream(id, {
      onMessage: (message) => {
        setMessages((current) => {
          if (current.some((entry) => entry.id === message.id)) {
            return current;
          }

          return [...current, message].sort((left, right) => left.id - right.id);
        });
        loadTicket().catch(() => {});
      },
      onError: () => {
        if (mounted) {
          setFeedback((current) => current.message ? current : {
            message: "Live updates disconnected. Refresh if messages stop updating.",
            type: "error"
          });
        }
      }
    });

    eventSourceRef.current = stream;

    return () => {
      mounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [id, user, isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setFlashMessage = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 3000);
  };

  const refreshDetails = async () => {
    await loadTicket();
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    try {
      await sendMessage(id, newMessage.trim());
      setNewMessage("");
      await refreshDetails();
    } catch (error) {
      setFlashMessage(error.response?.data?.message || "Failed to send message.", "error");
    }
  };

  const handleConfirmAllChanges = async () => {
    try {
      const updates = [];

      if (pendingChanges.status !== ticket.status) {
        updates.push(updateTicketStatus(id, pendingChanges.status));
      }

      if (pendingChanges.priority !== ticket.priority) {
        updates.push(updateTicketPriority(id, pendingChanges.priority));
      }

      const nextAssignedTo = pendingChanges.assigned_to === "" ? null : Number(pendingChanges.assigned_to);
      const currentAssignedTo = ticket.assigned_to === null ? null : Number(ticket.assigned_to);

      if (nextAssignedTo !== currentAssignedTo) {
        updates.push(assignTicket(id, nextAssignedTo));
      }

      await Promise.all(updates);
      await refreshDetails();
      setFlashMessage("Changes saved successfully.", "success");
    } catch (error) {
      setFlashMessage(error.response?.data?.message || "Update failed.", "error");
    }
  };

  const handleStart = async () => {
    try {
      await startTicket(id);
      await refreshDetails();
      setFlashMessage("Ticket moved to In Progress.", "success");
    } catch (error) {
      setFlashMessage(error.response?.data?.message || "Failed to start ticket.", "error");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-sm text-slate-500">Loading ticket details...</p>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <p className="text-sm text-red-600">Ticket not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-2">
              Ticket Detail
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              #{ticket.id} · {ticket.title}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Created by {ticket.created_by_name || "Unknown"} on{" "}
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>

          <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${statusBadgeMap[ticket.status] || statusBadgeMap.Open}`}>
            {ticket.status}
          </span>
        </div>

        {feedback.message ? (
          <div
            className={`rounded-xl px-4 py-3 text-sm border ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Ticket Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Category</p>
                  <p className="font-medium text-slate-900 mt-1">{ticket.category_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Priority</p>
                  <p className="font-medium text-slate-900 mt-1">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-slate-500">Assigned To</p>
                  <p className="font-medium text-slate-900 mt-1">{ticket.assigned_to_name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Updated</p>
                  <p className="font-medium text-slate-900 mt-1">{new Date(ticket.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-slate-500 text-sm mb-2">Description</p>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>

              {isAssignedAgent && ticket.status === "Assigned" ? (
                <button
                  onClick={handleStart}
                  className="mt-6 rounded-lg bg-slate-900 px-4 py-2.5 text-white hover:bg-slate-800 transition-colors"
                >
                  Start Working
                </button>
              ) : null}
            </section>

            {isAdmin ? (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Admin Controls</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage status, priority, and assignment from one place.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">Status</label>
                    <select
                      value={pendingChanges.status}
                      onChange={(event) => setPendingChanges({ ...pendingChanges, status: event.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm"
                    >
                      <option>Open</option>
                      <option>Assigned</option>
                      <option>In Progress</option>
                      <option>Awaiting User Response</option>
                      <option>Resolved</option>
                      <option>Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">Priority</label>
                    <select
                      value={pendingChanges.priority}
                      onChange={(event) => setPendingChanges({ ...pendingChanges, priority: event.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">Assign Agent</label>
                    <select
                      value={pendingChanges.assigned_to}
                      onChange={(event) => setPendingChanges({ ...pendingChanges, assigned_to: event.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleConfirmAllChanges}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-white hover:bg-slate-800 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </section>
            ) : null}

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
              </div>

              <div className="max-h-[420px] overflow-y-auto bg-slate-50 px-6 py-5 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-500">No messages yet.</p>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = Number(message.sender_id) === Number(user?.id);

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            isCurrentUser
                              ? "bg-slate-900 text-white"
                              : "bg-white border border-slate-200 text-slate-700"
                          }`}
                        >
                          <p className="text-xs font-medium opacity-75 mb-1">
                            {message.full_name} · {message.role}
                          </p>
                          <p className="whitespace-pre-wrap">{message.message_text}</p>
                          <p className="text-[11px] mt-2 opacity-70">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4 flex gap-3">
                <input
                  type="text"
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                />
                <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800 transition-colors">
                  Send
                </button>
              </form>
            </section>
          </div>

          <aside>
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
              </div>

              <div className="max-h-[760px] overflow-y-auto p-5 space-y-4">
                {(ticket.activity || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No activity recorded yet.</p>
                ) : (
                  ticket.activity.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-slate-200 pl-4">
                      <p className="text-sm font-medium text-slate-900">{entry.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {entry.actor_name || "System"} · {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetails;
