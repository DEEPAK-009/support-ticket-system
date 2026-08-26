import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { createTicket } from "../api/tickets";
import { getCategories } from "../api/categories";
import {
  Ticket,
  PlusCircle,
  Tag,
  FileText,
  Type,
  Send,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (loadError) {
        setError("Unable to load categories.");
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createTicket(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create ticket. Please check your inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Create Ticket Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-950/80 text-[11px] font-medium text-slate-400 mb-3">
              <PlusCircle className="w-3 h-3 text-indigo-400" />
              <span>NEW SUPPORT TICKET</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Submit a Request
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Provide details regarding your issue and our technical team will respond promptly.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Ticket Subject <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Unable to access VPN network"
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full appearance-none bg-slate-950/60 border border-slate-800 text-slate-100 pl-10 pr-8 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    Select an issue category...
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-slate-900 text-slate-100"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Issue Description <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={5}
                  placeholder="Provide step-by-step details, error messages, and context to help us resolve your issue faster..."
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 p-3.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTicket;
