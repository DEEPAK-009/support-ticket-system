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
} from "../api/admin";
import { useDeferredValue } from "react";
import {
  Shield,
  Activity,
  AlertCircle,
  Clock,
  MessageSquare,
  CheckCircle2,
  Archive,
  Layers,
  Inbox,
} from "lucide-react";

const analyticsConfig = [
  {
    key: "totalTickets",
    label: "Total Tickets",
    icon: Layers,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  },
  {
    key: "open",
    label: "Open",
    icon: AlertCircle,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: Clock,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  },
  {
    key: "awaitingUserResponse",
    label: "Awaiting User",
    icon: MessageSquare,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/25",
  },
  {
    key: "resolved",
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/25",
  },
  {
    key: "closed",
    label: "Closed",
    icon: Archive,
    color: "text-slate-400 bg-slate-800/80 border-slate-700",
  },
];

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
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
  const deferredFilters = useDeferredValue(filters);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets(deferredFilters);
      setTickets(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (requestError) {
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setAdminLoading(true);
      const analyticsData = await getAdminAnalytics();
      setAnalytics(analyticsData || {});
    } catch (requestError) {
      setAdminError("Unable to load admin analytics.");
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [deferredFilters]);

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Operations KPI Overview */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-950/80 text-[11px] font-medium text-slate-400 mb-3">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>OPERATIONS COMMAND</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Operations Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Global overview of ticket velocity, category assignment, response times, and workload across all departments.
              </p>
            </div>

            {/* 6 Analytics KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {analyticsConfig.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-wider font-mono text-slate-400 truncate">
                        {card.label}
                      </p>
                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center ${card.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white tracking-tight">
                      {adminLoading ? "..." : analytics[card.key] ?? 0}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {adminError ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{adminError}</span>
          </div>
        ) : null}

        {/* Global Queue Filter */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          showAssignedFilter
        />

        {error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading operations queue...</span>
          </div>
        ) : tickets.length > 0 ? (
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
        ) : (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center">
            <Inbox className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-200">
              No tickets in queue
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No tickets match the selected filters or the queue is clear.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
