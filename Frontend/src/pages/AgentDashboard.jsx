import { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import FilterBar from "../components/FilterBar"; // Added FilterBar
import Pagination from "../components/Pagination";

const AgentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Mirrored filters from Admin page, but locked to this agent
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assigned: user?.id, // Automatically restricted to the logged-in agent
    sort: "created_at",
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
      } catch (err) {
        console.error("Error fetching agent tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchAgentTickets();
  }, [filters, user?.id]);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Agent Dashboard</h1>

      {/* Reusing the Admin FilterBar for consistency */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {loading ? (
        <p className="mt-4">Loading your assigned tickets...</p>
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
        <p className="mt-4 text-gray-600">No tickets match your filters.</p>
      )}
    </Layout>
  );
};

export default AgentDashboard;