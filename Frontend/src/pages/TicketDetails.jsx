import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`/tickets/${id}`);
        setTicket(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  // ✅ 2️⃣ Add Handlers HERE
  const updateStatus = async (newStatus) => {
    try {
      await axios.patch(`/tickets/${id}/status`, {
        status: newStatus,
      });

      setTicket((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const updatePriority = async (newPriority) => {
    try {
      await axios.patch(`/tickets/${id}/priority`, {
        priority: newPriority,
      });

      setTicket((prev) => ({
        ...prev,
        priority: newPriority,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const assignAgent = async (agentId) => {
    try {
      await axios.patch(`/tickets/${id}/assign`, {
        assigned_to: agentId,
      });

      setTicket((prev) => ({
        ...prev,
        assigned_to: agentId,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <p>Ticket not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Ticket #{ticket.id}
          </h1>
          <p className="text-gray-500">
            {ticket.title}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow grid grid-cols-2 gap-6">
          <div>
            <p><strong>Category:</strong> {ticket.category_name || "N/A"}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
          </div>

          <div>
            <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
            <p><strong>Assigned To:</strong> {ticket.assigned_to || "Unassigned"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{ticket.description}</p>
        </div>

        {/* ✅ 3️⃣ Add Admin Controls BELOW DESCRIPTION */}
        {user?.role === "admin" && (
          <div className="bg-white p-6 rounded shadow space-y-4">
            <h2 className="font-semibold">Admin Controls</h2>

            {/* Status */}
            <div>
              <label className="block text-sm mb-1">Update Status</label>
              <select
                value={ticket.status}
                onChange={(e) => updateStatus(e.target.value)}
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

            {/* Priority */}
            <div>
              <label className="block text-sm mb-1">Update Priority</label>
              <select
                value={ticket.priority}
                onChange={(e) => updatePriority(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            {/* Assignment */}
            <div>
              <label className="block text-sm mb-1">Assign Agent</label>
              <input
                type="number"
                placeholder="Enter Agent ID"
                onBlur={(e) => assignAgent(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TicketDetails;