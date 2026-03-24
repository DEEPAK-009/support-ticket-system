import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sort: "created_at",
    order: "desc"
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await getTickets(filters);
        setTickets(res.data || []);
      } catch (error) {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filters]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-2">
              My Workspace
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">My Support Requests</h1>
            <p className="text-sm text-slate-500 mt-2">
              Track your tickets and create new requests when you need help.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-ticket")}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-white hover:bg-slate-800 transition-colors"
          >
            Create Ticket
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap gap-3">
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting User Response">Awaiting User Response</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={filters.order}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: "created_at",
                order: e.target.value
              }))
            }
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">ID</th>
                <th className="px-6 py-3 font-medium text-slate-600">Title</th>
                <th className="px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="px-6 py-3 font-medium text-slate-600">Priority</th>
                <th className="px-6 py-3 font-medium text-slate-600">Assigned To</th>
                <th className="px-6 py-3 font-medium text-slate-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <td className="px-6 py-4 text-slate-600">{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{ticket.title}</td>
                    <td className="px-6 py-4 text-slate-600">{ticket.status}</td>
                    <td className="px-6 py-4 text-slate-600">{ticket.priority}</td>
                    <td className="px-6 py-4 text-slate-600">{ticket.assigned_to_name || "Unassigned"}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
