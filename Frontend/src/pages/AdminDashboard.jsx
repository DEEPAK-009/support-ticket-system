import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import {
  getAdminAnalytics,
  getAdminUsers,
  toggleAdminUserStatus
} from "../api/admin";
import { useDeferredValue } from "react";

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
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userActionTarget, setUserActionTarget] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assigned: "",
    sort: "updated_at",
    order: "desc",
    page: 1,
  });
  const deferredFilters = useDeferredValue(filters);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets(deferredFilters);
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
        getAdminUsers({ page: userPage, limit: 8 })
      ]);

      setAnalytics(analyticsData);
      setUsers(userData.data);
      setUserTotalPages(userData.totalPages);
    } catch (requestError) {
      setAdminError("Unable to load admin data.");
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [deferredFilters]);

  useEffect(() => {
    loadAdminData();
  }, [userPage]);

  const handleToggleStatus = async () => {
    if (!userActionTarget) {
      return;
    }

    try {
      await toggleAdminUserStatus(userActionTarget.id);
      await loadAdminData();
      setUserActionTarget(null);
    } catch (requestError) {
      setAdminError(requestError.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-2">
            Admin Workspace
          </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Operations Dashboard</h1>
              <p className="text-sm text-slate-500 mt-3 max-w-2xl">
                Review ticket flow, track workload, and manage account access from one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {analyticsCards.map((card) => (
                <div key={card.key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {adminLoading ? "..." : analytics[card.key] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {adminError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {adminError}
          </div>
        ) : null}

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

        {/* <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500">Review account access and activate or deactivate users with confirmation.</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Department</th>
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
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role} · {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setUserActionTarget(user)}
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

          <Pagination
            currentPage={userPage}
            totalPages={userTotalPages}
            onPageChange={setUserPage}
          />
        </section> */}

        {userActionTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Confirm Action</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">
                {userActionTarget.is_active ? "Deactivate account?" : "Activate account?"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {userActionTarget.full_name} ({userActionTarget.email}) will be
                {userActionTarget.is_active ? " blocked from signing in." : " allowed to sign in again."}
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setUserActionTarget(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`rounded-xl px-4 py-2.5 text-white ${
                    userActionTarget.is_active
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
