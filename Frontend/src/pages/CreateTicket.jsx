import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "../api/axios";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", category_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/tickets", formData);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border mt-10">
        <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input 
              required
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Briefly describe your issue"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          {/* Add Category Select here based on your database categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows="5"
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Provide more details so we can help you faster..."
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateTicket;