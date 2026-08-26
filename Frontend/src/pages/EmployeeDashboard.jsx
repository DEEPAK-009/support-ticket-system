import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import { Plus, Ticket, Sparkles, Inbox } from "lucide-react";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sort: "created_at",
    order: "desc",
    page: 1,
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await getTickets(filters);
        setTickets(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filters]);

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Hero Section */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-950/80 text-[11px] font-medium text-slate-400 mb-3">
                <Ticket className="w-3 h-3 text-indigo-400" />
                <span>CUSTOMER DESK</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                My Support Requests
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Track your active requests, view updates from technicians, or create new support tickets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                  Total
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {tickets.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                  Active
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-400">
                  {openCount + inProgressCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {/* Tickets Queue View */}
        {loading ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading support requests...</span>
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
              No tickets found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't opened any support requests yet or no tickets match the applied filters.
            </p>
            <button
              onClick={() => navigate("/create-ticket")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first ticket</span>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
