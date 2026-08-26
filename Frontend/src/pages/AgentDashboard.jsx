import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import { Headphones, CheckCircle2, AlertCircle, Clock, Inbox } from "lucide-react";

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sort: "updated_at",
    order: "desc",
    page: 1,
  });

  useEffect(() => {
    const fetchAgentTickets = async () => {
      try {
        setLoading(true);
        const data = await getTickets(filters);
        setTickets(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (requestError) {
        setError("Unable to load assigned tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentTickets();
  }, [filters]);

  const openTickets = tickets.filter((t) => t.status === "Open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & KPI Summary */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-950/80 text-[11px] font-medium text-slate-400 mb-3">
                <Headphones className="w-3 h-3 text-indigo-400" />
                <span>AGENT QUEUE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Assigned Tickets
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Focus on active tickets assigned to you, respond to awaiting queries, and resolve technical issues.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                  Total
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {tickets.length}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-mono">
                  Active
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {openTickets + inProgressTickets}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                  Resolved
                </p>
                <p className="mt-1 text-2xl font-bold text-teal-400">
                  {resolvedTickets}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Tickets Queue View */}
        {loading ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading assigned tickets...</span>
          </div>
        ) : tickets.length > 0 ? (
          <>
            <TicketTable tickets={tickets} />
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
              No tickets assigned
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You currently have no support tickets assigned under your department queue.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgentDashboard;
