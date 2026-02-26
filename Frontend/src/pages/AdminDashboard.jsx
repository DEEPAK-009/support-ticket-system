import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTickets(filters);
        setTickets(data.data);
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

      <div className="flex space-x-4 mb-6">
      {["", "Open", "Assigned", "In Progress", "Resolved", "Closed"].map((status) => (
        <button
          key={status}
          onClick={() => setFilters({ status })}
          className={`px-4 py-2 rounded ${
            filters.status === status
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {status === "" ? "All" : status}
        </button>
      ))}
    </div>

      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        
        <TicketTable tickets={tickets} />
      )}
    </Layout>
  );
};

export default AdminDashboard;