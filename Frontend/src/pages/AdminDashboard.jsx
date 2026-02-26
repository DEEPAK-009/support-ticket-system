import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getTickets } from "../api/tickets";
import TicketTable from "../components/TicketTable";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTickets();
        setTickets(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">
        Admin Dashboard
      </h1>

      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </Layout>
  );
};

export default AdminDashboard;