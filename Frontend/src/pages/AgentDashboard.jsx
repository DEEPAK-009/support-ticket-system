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
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-2">
            Agent Workspace
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Assigned Tickets</h1>
          <p className="text-sm text-slate-500 mt-2">
            Focus on the tickets currently assigned to you.
          </p>
        </div>

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
