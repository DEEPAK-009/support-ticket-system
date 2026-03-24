const FilterBar = ({ filters, setFilters, showAssignedFilter = false }) => {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">

        <select
          value={filters.status || ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Awaiting User Response">Awaiting User Response</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

      <select
        value={filters.priority || ""}
        onChange={(e) => updateFilter("priority", e.target.value)}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
      >
        <option value="">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      {showAssignedFilter ? (
        <select
          value={filters.assigned || ""}
          onChange={(e) => updateFilter("assigned", e.target.value)}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
        >
          <option value="">All Ownership</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>
      ) : null}

      <select
        value={filters.order || "desc"}
        onChange={(e) => updateFilter("order", e.target.value)}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
      </div>
    </div>
  );
};

export default FilterBar;
