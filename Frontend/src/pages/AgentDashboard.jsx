import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

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
        setTickets(data.data);
        setTotalPages(data.totalPages);
      } catch (requestError) {
        setError("Unable to load assigned tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentTickets();
  }, [filters]);

  return (
    <Layout>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-2">
            Agent Workspace
          </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Assigned Tickets</h1>
              <p className="text-sm text-slate-500 mt-3 max-w-2xl">
                Focus on active work, move issues forward, and respond quickly when users are waiting.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
      Total
    </p>
    <p className="mt-2 text-3xl font-bold text-slate-950">
      {tickets.length}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
      Open
    </p>
    <p className="mt-2 text-3xl font-bold text-emerald-600">
      {tickets.filter((ticket) => ticket.status === "Open").length}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
      Closed
    </p>
    <p className="mt-2 text-3xl font-bold text-red-500">
      {tickets.filter((ticket) => ticket.status === "Closed").length}
    </p>
  </div>
</div>
          </div>
        </section>

        <FilterBar filters={filters} setFilters={setFilters} />

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : loading ? (
          <p className="text-sm text-slate-500">Loading your tickets...</p>
        ) : tickets.length > 0 ? (
          <>
            <TicketTable tickets={tickets} />
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No tickets match the current filters.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgentDashboard;
