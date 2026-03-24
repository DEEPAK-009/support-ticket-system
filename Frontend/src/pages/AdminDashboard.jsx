import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import {
  getAdminAnalytics,
  getAdminUsers,
  toggleAdminUserStatus,
  updateAdminUserRole
} from "../api/admin";

const analyticsCards = [
  { key: "totalTickets", label: "Total Tickets" },
  { key: "open", label: "Open" },
  { key: "inProgress", label: "In Progress" },
  { key: "awaitingUserResponse", label: "Awaiting User" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" }
];

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminError, setAdminError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assigned: "",
    sort: "updated_at",
    order: "desc",
    page: 1,
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets(filters);
      setTickets(data.data);
      setTotalPages(data.totalPages);
    } catch (requestError) {
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setAdminLoading(true);
      const [analyticsData, userData] = await Promise.all([
        getAdminAnalytics(),
        getAdminUsers()
      ]);

      setAnalytics(analyticsData);
      setUsers(userData);
    } catch (requestError) {
      setAdminError("Unable to load admin data.");
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateAdminUserRole(userId, role);
      await loadAdminData();
    } catch (requestError) {
      setAdminError(requestError.response?.data?.message || "Failed to update role.");
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleAdminUserStatus(userId);
      await loadAdminData();
    } catch (requestError) {
      setAdminError(requestError.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-2">
            Admin Workspace
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-2">
            Monitor queues, manage users, and keep ticket flow moving.
          </p>
        </div>

        {adminError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {adminError}
          </div>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          {analyticsCards.map((card) => (
            <div key={card.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-3">
                {adminLoading ? "..." : analytics[card.key] ?? 0}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ticket Queue</h2>
            <p className="text-sm text-slate-500">Review status, priority, and current ownership.</p>
          </div>

          <FilterBar filters={filters} setFilters={setFilters} showAssignedFilter />

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : loading ? (
            <p className="text-sm text-slate-500">Loading tickets...</p>
          ) : (
            <>
              <TicketTable tickets={tickets} showAssignee />
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            </>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500">Change roles and enable or disable accounts.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="p-3 font-medium text-slate-900">{user.full_name}</td>
                    <td className="p-3 text-slate-600">{user.email}</td>
                    <td className="p-3 text-slate-600">{user.department || "Unassigned"}</td>
                    <td className="p-3">
                      <select
                        value={user.role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        className="border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                      >
                        <option value="user">user</option>
                        <option value="agent">agent</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
