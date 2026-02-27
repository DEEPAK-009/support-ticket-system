
import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const { user } = useContext(AuthContext);

  // 1. Buffer state to hold local changes before clicking Confirm
  const [pendingChanges, setPendingChanges] = useState({
    status: "",
    priority: "",
    assigned_to: ""
  });

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`/tickets/${id}`);
        const ticketData = res.data;
        setTicket(ticketData);

        // Sync local buffer with fetched ticket data
        setPendingChanges({
          status: ticketData.status,
          priority: ticketData.priority,
          assigned_to: ticketData.assigned_to || ""
        });

        if (ticketData.category_id) {
          const agentRes = await axios.get(`/admin/agents?categoryId=${ticketData.category_id}`);
          setAgents(agentRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  // 2. The Confirm Button Handler
  const handleConfirmAllChanges = async () => {
  try {
    const agentIdValue = pendingChanges.assigned_to === "" ? null : Number(pendingChanges.assigned_to);
    const requests = [];

    if (pendingChanges.status !== ticket.status) {
      requests.push(axios.patch(`/tickets/${id}/status`, { status: pendingChanges.status }));
    }
    if (pendingChanges.priority !== ticket.priority) {
      requests.push(axios.patch(`/tickets/${id}/priority`, { priority: pendingChanges.priority }));
    }
    if (agentIdValue !== ticket.assigned_to) {
      requests.push(axios.patch(`/tickets/${id}/assign`, { agentId: agentIdValue }));
    }

    if (requests.length > 0) {
      await Promise.all(requests);
      setTicket(prev => ({ ...prev, ...pendingChanges, assigned_to: agentIdValue }));
      
      // ✅ Set Success Message
      setFeedback({ message: "Changes saved successfully!", type: "success" });
    } else {
      setFeedback({ message: "No changes to save.", type: "info" });
    }

  } catch (err) {
    // ✅ Set Error Message
    setFeedback({ 
      message: "Update failed. Check transition rules.", 
      type: "error" 
    });
  }

  // 3. Clear the message after 3 seconds
  setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
};

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (!ticket) return <Layout><p>Ticket not found.</p></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-semibold">Ticket #{ticket.id}</h1>
          <p className="text-gray-500">{ticket.title}</p>
        </div>

        {/* Info Grid (Matches your Screenshot 3) */}
        <div className="bg-white p-6 rounded shadow grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p><strong>Category:</strong> {ticket.category_name || "Technical"}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
          </div>
          <div className="space-y-1">
            <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
            <p><strong>Assigned To:</strong> {ticket.assigned_to || "Unassigned"}</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{ticket.description}</p>
        </div>

        {/* Admin Controls (With Confirm Button) */}
        {user?.role === "admin" && (
          <div className="bg-white p-6 rounded shadow space-y-4">
            <h2 className="font-semibold">Admin Controls</h2>

            <div>
              <label className="block text-sm mb-1">Update Status</label>
              <select
                value={pendingChanges.status}
                onChange={(e) => setPendingChanges({...pendingChanges, status: e.target.value})}
                className="border px-3 py-2 rounded w-full"
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
              <label className="block text-sm mb-1">Update Priority</label>
              <select
                value={pendingChanges.priority}
                onChange={(e) => setPendingChanges({...pendingChanges, priority: e.target.value})}
                className="border px-3 py-2 rounded w-full"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Assign Agent</label>
              <select
                value={pendingChanges.assigned_to}
                onChange={(e) => setPendingChanges({...pendingChanges, assigned_to: e.target.value})}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name} ({agent.level})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Feedback Message Area */}
            {feedback.message && (
              <div className={`text-sm font-medium p-2 rounded text-center transition-all ${
                feedback.type === 'success' ? 'bg-green-100 text-green-700' : 
                feedback.type === 'error' ? 'bg-red-100 text-red-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {feedback.message}
              </div>
            )}

            {/* ✅ Confirm Button at the Bottom */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleConfirmAllChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium shadow"
              >
                Confirm All Changes
              </button>
              {/* Feedback Message Area */}
z
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TicketDetails;