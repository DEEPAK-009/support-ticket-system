import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { startTicket } from "../api/tickets";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const { user } = useContext(AuthContext);

  // Buffer state to hold local changes before clicking Confirm
  const [pendingChanges, setPendingChanges] = useState({
    status: "",
    priority: "",
    assigned_to: ""
  });

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

      // ✅ Only fetch agents if the user is an admin
      if (user?.role === "admin" && ticketData.category_id) {
        const agentRes = await axios.get(`/admin/agents?categoryId=${ticketData.category_id}`);
        setAgents(agentRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

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
        setFeedback({ message: "Changes saved successfully!", type: "success" });
      } else {
        setFeedback({ message: "No changes to save.", type: "info" });
      }
    } catch (err) {
      setFeedback({ 
        message: "Update failed. Check transition rules.", 
        type: "error" 
      });
    }
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  };

  const handleStart = async () => {
    try {
      await startTicket(id);
      
      // Update local state to reflect the change immediately
      setTicket(prev => ({ ...prev, status: 'In Progress' }));
      setPendingChanges(prev => ({ ...prev, status: 'In Progress' }));
      
      setFeedback({ message: "Ticket started! Status is now In Progress.", type: "success" });
    } catch (err) {
      setFeedback({ 
        message: err.response?.data?.message || "Failed to start ticket", 
        type: "error" 
      });
    }
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  };

  if (loading) return <Layout><p className="p-6">Loading ticket details...</p></Layout>;
  if (!ticket) return <Layout><p className="p-6 text-red-600">Ticket not found.</p></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
            <p className="text-lg text-gray-600">{ticket.title}</p>
          </div>
          
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
            ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {ticket.status}
          </span>
        </div>

        {/* Info Grid */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p><strong className="text-gray-600">Category:</strong> {ticket.category_name || "Technical"}</p>
            <p><strong className="text-gray-600">Priority:</strong> {ticket.priority}</p>
            <p><strong className="text-gray-600">Assigned To:</strong> {ticket.assigned_to_name || (ticket.assigned_to ? `Agent ID: ${ticket.assigned_to}` : "Unassigned")}</p>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Agent Action: Start Working Button */}
        {ticket.status === 'Assigned' && user?.id === ticket.assigned_to && (
          <div className="flex justify-center p-6 bg-green-50 rounded-lg border border-green-100">
            <button 
              onClick={handleStart}
              className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 shadow-md"
            >
              Start Working on Ticket
            </button>
          </div>
        )}
        
        {/* Admin Controls */}
        {user?.role === "admin" && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-800">Admin Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                <select
                  value={pendingChanges.status}
                  onChange={(e) => setPendingChanges({...pendingChanges, status: e.target.value})}
                  className="border border-gray-300 px-3 py-2 rounded-md w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Awaiting User Response</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Priority</label>
                <select
                  value={pendingChanges.priority}
                  onChange={(e) => setPendingChanges({...pendingChanges, priority: e.target.value})}
                  className="border border-gray-300 px-3 py-2 rounded-md w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Assign Agent</label>
                <select
                  value={pendingChanges.assigned_to}
                  onChange={(e) => setPendingChanges({...pendingChanges, assigned_to: e.target.value})}
                  className="border border-gray-300 px-3 py-2 rounded-md w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name} ({agent.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-4 flex items-center justify-between">
              <div>
                {feedback.message && (
                  <div className={`text-sm px-4 py-2 rounded-md ${
                    feedback.type === 'success' ? 'bg-green-100 text-green-700' : 
                    feedback.type === 'error' ? 'bg-red-100 text-red-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {feedback.message}
                  </div>
                )}
              </div>
              <button
                onClick={handleConfirmAllChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm transition-colors"
              >
                Confirm Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TicketDetails;