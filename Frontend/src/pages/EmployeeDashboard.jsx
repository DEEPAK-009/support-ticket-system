import { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { getTickets } from "../api/tickets";
import axios from "../api/axios";
import { Link } from "react-router-dom";

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Category States
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    category_name: "None", // Default as requested
    description: "",
    priority: "Medium"     // Default as requested
  });

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sort: "created_at",
    order: "desc"
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getTickets(filters);
      // FIX: Ensure we handle both { data: [] } and direct array responses
      const actualData = Array.isArray(res) ? res : res.data || [];
      setTickets(actualData);
    } catch (err) {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Categories not found (404). Ensure backend route exists.");
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, [filters]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!formData.category_id) return alert("Category is compulsory");

    try {
      await axios.post("/tickets", {
        title: formData.title,
        category_id: formData.category_id,
        description: formData.description,
        priority: formData.priority
      });
      setShowModal(false);
      fetchTickets();
      // Reset Form
      setFormData({ title: "", category_id: "", category_name: "None", description: "", priority: "Medium" });
    } catch (err) {
      alert("Error raising ticket");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* 🔹 Filter Bar (All Statuses + Sort Dropdown) */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <select 
              className="border rounded px-3 py-1.5 text-sm outline-none bg-white"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting User Response">Awaiting User Response</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select 
              className="border rounded px-3 py-1.5 text-sm outline-none bg-white"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* ✅ RESTORED: Sort Dropdown */}
            <select
            className="border rounded px-3 py-1.5 text-sm bg-white"
            value={filters.order}
            onChange={(e) =>
                setFilters((prev) => ({
                ...prev,
                sort: "created_at",
                order: e.target.value
                }))
            }
            >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
            </select>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-semibold hover:bg-blue-700"
          >
            + Ticket
          </button>
        </div>

        {/* 🔹 Tickets Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-sm font-semibold">ID</th>
                <th className="px-6 py-3 text-sm font-semibold">Title</th>
                <th className="px-6 py-3 text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-sm font-semibold">Priority</th>
                <th className="px-6 py-3 text-sm font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">{t.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      <Link to={`/tickets/${t.id}`}>{t.title}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{t.status}</td>
                    <td className="px-6 py-4 text-sm">{t.priority}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Create Ticket Modal (Searchable Dropdown Fixed) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-5 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Raise New Ticket</h2>
                <button onClick={() => setShowModal(false)} className="text-2xl">&times;</button>
              </div>
              
              <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                  <input required className="w-full border rounded px-3 py-2 text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                  <div 
                    className="w-full border rounded px-3 py-2 text-sm cursor-pointer bg-white"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    {formData.category_name}
                  </div>
                  
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded-md shadow-xl z-20">
                      <input 
                        className="w-full p-2 border-b outline-none text-sm"
                        placeholder="Search category..."
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="max-h-40 overflow-y-auto">
                        {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(cat => (
                          <div 
                            key={cat.id}
                            className="p-2 text-sm hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setFormData({...formData, category_id: cat.id, category_name: cat.name});
                              setShowCategoryDropdown(false);
                              setSearchTerm("");
                            }}
                          >
                            {cat.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                  <textarea required rows="3" className="w-full border rounded px-3 py-2 text-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priority</label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold">Raise Ticket</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;