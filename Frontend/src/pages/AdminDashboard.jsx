import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assigned: "",
    sort: "created_at",
    order: "desc",
    page: 1,
  });
  

  useEffect(() => {
  const fetchTickets = async () => {
    try {
      const data = await getTickets(filters);
      setTickets(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchTickets();
}, [filters]);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">
        Admin Dashboard
      </h1>

      <FilterBar filters={filters} setFilters={setFilters} />

      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        
        <TicketTable tickets={tickets} />
      )}

      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={(page) =>
          setFilters((prev) => ({ ...prev, page }))
        }
      />
    </Layout>
      
  );
};

export default AdminDashboard;