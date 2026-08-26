import { Filter, ArrowUpDown, UserCheck, Activity } from "lucide-react";

const FilterBar = ({ filters, setFilters, showAssignedFilter = false }) => {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-3.5 shadow-xl shadow-black/30">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pl-2 pr-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status || ""}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="appearance-none rounded-xl border border-slate-800 bg-slate-950/70 pl-3 pr-8 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting User Response">Awaiting User Response</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={filters.priority || ""}
            onChange={(e) => updateFilter("priority", e.target.value)}
            className="appearance-none rounded-xl border border-slate-800 bg-slate-950/70 pl-3 pr-8 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Assigned Filter (Admin Only) */}
        {showAssignedFilter ? (
          <div className="relative">
            <select
              value={filters.assigned || ""}
              onChange={(e) => updateFilter("assigned", e.target.value)}
              className="appearance-none rounded-xl border border-slate-800 bg-slate-950/70 pl-3 pr-8 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
            >
              <option value="">All Ownership</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        ) : null}

        {/* Sorting Order */}
        <div className="relative ml-auto">
          <select
            value={filters.order || "desc"}
            onChange={(e) => updateFilter("order", e.target.value)}
            className="appearance-none rounded-xl border border-slate-800 bg-slate-950/70 pl-3 pr-8 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
