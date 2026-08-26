import { useParams, useNavigate } from "react-router-dom";
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
  updateTicketStatus,
} from "../api/tickets";
import { getAgentsByCategory } from "../api/admin";
import {
  Ticket,
  ArrowLeft,
  Clock,
  User,
  Tag,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  Shield,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  Sparkles,
  Sliders,
  Radio,
} from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "Open":
      return {
        color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        dot: "bg-emerald-400 animate-pulse",
      };
    case "Assigned":
      return {
        color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        dot: "bg-amber-400",
      };
    case "In Progress":
      return {
        color: "bg-sky-500/10 text-sky-300 border-sky-500/30",
        dot: "bg-sky-400 animate-pulse",
      };
    case "Awaiting User Response":
      return {
        color: "bg-violet-500/10 text-violet-300 border-violet-500/30",
        dot: "bg-violet-400",
      };
    case "Resolved":
      return {
        color: "bg-teal-500/10 text-teal-300 border-teal-500/30",
        dot: "bg-teal-400",
      };
    case "Closed":
    default:
      return {
        color: "bg-slate-800/80 text-slate-400 border-slate-700",
        dot: "bg-slate-500",
      };
  }
};

function getAvailableAdminStatuses(currentStatus, hasAssignee) {
  const statusMap = {
    Open: hasAssignee
      ? ["Open", "Assigned", "Resolved", "Closed"]
      : ["Open", "Resolved", "Closed"],
    Assigned: hasAssignee
      ? ["Assigned", "In Progress", "Resolved", "Closed"]
      : ["Open"],
    "In Progress": hasAssignee
      ? ["In Progress", "Awaiting User Response", "Resolved", "Closed"]
      : ["Open"],
    "Awaiting User Response": hasAssignee
      ? ["Awaiting User Response", "In Progress", "Resolved", "Closed"]
      : ["Open"],
    Resolved: ["Resolved", "Closed"],
    Closed: ["Closed"],
  };

  return statusMap[currentStatus] || [currentStatus];
}

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [agents, setAgents] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [pendingChanges, setPendingChanges] = useState({
    status: "",
    priority: "",
    assigned_to: "",
  });
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const isAssignedAgent =
    user?.role === "agent" && Number(user?.id) === Number(ticket?.assigned_to);
  const canChat = Boolean(user) && !isAdmin;
  const isChatUnlocked = ticket && !["Open", "Assigned"].includes(ticket.status);
  const nextAssignedTo =
    pendingChanges.assigned_to === "" ? null : Number(pendingChanges.assigned_to);
  const availableAdminStatuses = ticket
    ? getAvailableAdminStatuses(
        ticket.status,
        Boolean(nextAssignedTo || ticket.assigned_to)
      )
    : [];

  const loadTicket = async () => {
    const ticketData = await getTicketById(id);
    setTicket(ticketData);
    setPendingChanges({
      status: ticketData.status,
      priority: ticketData.priority,
      assigned_to: ticketData.assigned_to || "",
    });

    if (isAdmin && ticketData.category_id) {
      try {
        const agentList = await getAgentsByCategory(ticketData.category_id);
        setAgents(agentList);
      } catch (_error) {
        setAgents([]);
      }
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
        await Promise.all([
          loadTicket(),
          canChat ? loadMessages() : Promise.resolve(),
        ]);
        setPageError("");
      } catch (error) {
        if (mounted) {
          setPageError(
            error.response?.data?.message || "Unable to load ticket details."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    if (canChat) {
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
            setFeedback((current) =>
              current.message
                ? current
                : {
                    message:
                      "Live updates stream reconnecting...",
                    type: "error",
                  }
            );
          }
        },
      });

      eventSourceRef.current = stream;
    }

    return () => {
      mounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [id, user, canChat, isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!ticket || !isAdmin || availableAdminStatuses.length === 0) {
      return;
    }

    if (!availableAdminStatuses.includes(pendingChanges.status)) {
      setPendingChanges((current) => ({
        ...current,
        status: availableAdminStatuses[0],
      }));
    }
  }, [availableAdminStatuses, isAdmin, pendingChanges.status, ticket]);

  const setFlashMessage = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 3500);
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
      const createdMessage = await sendMessage(id, newMessage.trim());
      setMessages((current) => {
        if (current.some((entry) => entry.id === createdMessage.id)) {
          return current;
        }

        return [...current, createdMessage].sort(
          (left, right) => left.id - right.id
        );
      });
      setNewMessage("");
      await refreshDetails();
    } catch (error) {
      setFlashMessage(
        error.response?.data?.message || "Failed to send message.",
        "error"
      );
    }
  };

  const handleConfirmAllChanges = async () => {
    try {
      const currentAssignedTo =
        ticket.assigned_to === null ? null : Number(ticket.assigned_to);

      if (pendingChanges.status === "Assigned" && !nextAssignedTo) {
        setFlashMessage(
          "Please assign an agent before moving ticket to Assigned status.",
          "error"
        );
        return;
      }

      if (
        ["In Progress", "Awaiting User Response"].includes(
          pendingChanges.status
        ) &&
        !nextAssignedTo
      ) {
        setFlashMessage(
          `An assigned agent is required for ${pendingChanges.status}.`,
          "error"
        );
        return;
      }

      const hasAssignmentChanged = nextAssignedTo !== currentAssignedTo;
      const hasStatusChanged = pendingChanges.status !== ticket.status;
      const hasPriorityChanged = pendingChanges.priority !== ticket.priority;

      if (!hasAssignmentChanged && !hasStatusChanged && !hasPriorityChanged) {
        setFlashMessage("No changes detected to save.", "success");
        return;
      }

      if (hasAssignmentChanged) {
        await assignTicket(id, nextAssignedTo);
      }

      if (hasStatusChanged) {
        await updateTicketStatus(id, pendingChanges.status);
      }

      if (hasPriorityChanged) {
        await updateTicketPriority(id, pendingChanges.priority);
      }

      await refreshDetails();
      setFlashMessage("Ticket properties updated successfully.", "success");
    } catch (error) {
      setFlashMessage(
        error.response?.data?.message || "Update failed.",
        "error"
      );
    }
  };

  const handleStart = async () => {
    try {
      await startTicket(id);
      await refreshDetails();
      setFlashMessage("Ticket moved to In Progress.", "success");
    } catch (error) {
      setFlashMessage(
        error.response?.data?.message || "Failed to start ticket.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading ticket details...</span>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
          <h3 className="text-base font-semibold text-rose-300">
            {pageError || "Ticket not found"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Check that the ticket exists and that your account has permission to view it.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const statusMeta = getStatusBadge(ticket.status);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Ticket Hero Banner */}
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                    #{ticket.id}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-400">
                    Opened by{" "}
                    <strong className="text-slate-200 font-medium">
                      {ticket.created_by_name || "Unknown"}
                    </strong>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {ticket.title}
                </h1>
                <p className="text-xs text-slate-400 mt-2">
                  Created on {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusMeta.color}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                  <span>{ticket.status}</span>
                </span>
              </div>
            </div>

            {/* 4 Quick Metadata Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Category</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white truncate">
                  {ticket.category_name || "General"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Priority</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {ticket.priority}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assignee</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white truncate">
                  {ticket.assigned_to_name || "Unassigned"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Updated</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white truncate">
                  {new Date(
                    ticket.updated_at || ticket.created_at
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Feedback Alert */}
        {feedback.message ? (
          <div
            className={`rounded-xl px-4 py-3 text-xs border flex items-center gap-2 animate-fadeIn ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div className="space-y-6">
            {/* Ticket Description */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl shadow-black/30">
              <h2 className="text-sm font-semibold text-white mb-3">
                Issue Description
              </h2>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {ticket.description}
              </div>

              {isAssignedAgent && ticket.status === "Assigned" ? (
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Working on Ticket</span>
                  </button>
                </div>
              ) : null}
            </section>

            {/* Admin Management Controls */}
            {isAdmin ? (
              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl shadow-black/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Admin Dispatch & Controls
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Assign agents and transition ticket states according to SLA rules.
                    </p>
                  </div>
                  <Sliders className="w-4 h-4 text-indigo-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Status
                    </label>
                    <select
                      value={pendingChanges.status}
                      onChange={(e) =>
                        setPendingChanges({
                          ...pendingChanges,
                          status: e.target.value,
                        })
                      }
                      className="w-full appearance-none bg-slate-950/70 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 cursor-pointer"
                    >
                      {availableAdminStatuses.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="bg-slate-900"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Priority
                    </label>
                    <select
                      value={pendingChanges.priority}
                      onChange={(e) =>
                        setPendingChanges({
                          ...pendingChanges,
                          priority: e.target.value,
                        })
                      }
                      className="w-full appearance-none bg-slate-950/70 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 cursor-pointer"
                    >
                      <option value="Urgent" className="bg-slate-900">Urgent</option>
                      <option value="High" className="bg-slate-900">High</option>
                      <option value="Medium" className="bg-slate-900">Medium</option>
                      <option value="Low" className="bg-slate-900">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Assign Agent
                    </label>
                    <select
                      value={pendingChanges.assigned_to}
                      onChange={(e) =>
                        setPendingChanges({
                          ...pendingChanges,
                          assigned_to: e.target.value,
                        })
                      }
                      className="w-full appearance-none bg-slate-950/70 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        Unassigned
                      </option>
                      {agents.map((agent) => (
                        <option
                          key={agent.id}
                          value={agent.id}
                          className="bg-slate-900"
                        >
                          {agent.full_name} ({agent.level || "Agent"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleConfirmAllChanges}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                  >
                    <span>Save Dispatch Changes</span>
                  </button>
                </div>
              </section>
            ) : null}

            {/* Live Conversation Stream or Acceptance Gate (User / Agent) */}
            {canChat ? (
              isChatUnlocked ? (
                <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-black/30 overflow-hidden">
                  <div className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        Conversation Thread
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Real-time live messaging between requester and assigned agent.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>Live</span>
                    </div>
                  </div>

                  {/* Message Log */}
                  <div className="max-h-[420px] min-h-[220px] overflow-y-auto bg-slate-950/40 p-5 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        No messages yet. Send a message to communicate with support.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isCurrentUser =
                          (msg.sender_id != null &&
                            Number(msg.sender_id) === Number(user?.id)) ||
                          (msg.full_name &&
                            user?.full_name &&
                            msg.full_name.trim().toLowerCase() ===
                              user.full_name.trim().toLowerCase());

                        return (
                          <div
                            key={msg.id}
                            className={`flex w-full ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-md ${
                                isCurrentUser
                                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none ml-auto"
                                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none mr-auto"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 mb-1.5 opacity-80 text-[10px]">
                                <span className="font-semibold">
                                  {isCurrentUser ? "You" : msg.full_name}
                                </span>
                                <span className="capitalize font-mono">
                                  {msg.role}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {msg.message_text}
                              </p>
                              <p className="text-[10px] mt-2 opacity-60 text-right font-mono">
                                {new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-slate-800/80 p-3 bg-slate-900/60 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type your response..."
                      className="flex-1 bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition cursor-pointer shrink-0 shadow-md shadow-indigo-600/25"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </section>
              ) : isAssignedAgent && ticket.status === "Assigned" ? (
                <section className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl shadow-black/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Ticket Assigned — Accept to Unlock Chat
                      </h3>
                      <p className="text-xs text-slate-400">
                        Assigned to your queue
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    Click <strong>Accept & Start Working</strong> to change the ticket status to <em>In Progress</em> and unlock live communication with the requester.
                  </p>
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Accept & Start Working</span>
                  </button>
                </section>
              ) : (
                <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl shadow-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Waiting for Technician to Accept
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Status: <span className="text-indigo-300 font-medium">{ticket.status}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Live chat will unlock automatically once a support technician accepts this ticket and starts working on it.
                  </p>
                </section>
              )
            ) : null}
          </div>

          {/* Right Sidebar: Rules & Workflow */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl shadow-black/30">
              <h2 className="text-sm font-semibold text-white mb-4">
                Workflow Rules
              </h2>
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <p className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                    Requester Account
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {ticket.created_by_name || "Unknown"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <p className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                    Assigned Technician
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {ticket.assigned_to_name || "Pending agent assignment"}
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5">
                  <p className="text-[10px] uppercase tracking-wider font-mono text-indigo-400">
                    Chat & SLA Policy
                  </p>
                  <p className="mt-1.5 leading-relaxed text-slate-300">
                    Live chat unlocks once the assigned technician accepts the ticket and begins work.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetails;
