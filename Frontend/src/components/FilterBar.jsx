const FilterBar = ({ filters, setFilters }) => {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-center">

      {/* Status Dropdown */}
        <select
        value={filters.status || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="border px-3 py-2 rounded text-sm"
        >
        <option value="">All Status</option>
        <option value="Open">Open</option>
        <option value="Assigned">Assigned</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
        </select>

      {/* Priority Dropdown */}
      <select
        value={filters.priority || ""}
        onChange={(e) => updateFilter("priority", e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      >
        <option value="">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      {/* Assigned Filter */}
      <select
        value={filters.assigned || ""}
        onChange={(e) => updateFilter("assigned", e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      >
        <option value="">All</option>
        <option value="assigned">Assigned</option>
        <option value="unassigned">Unassigned</option>
      </select>

      {/* Sort Toggle */}
      <select
        value={filters.order || "desc"}
        onChange={(e) => updateFilter("order", e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
    </div>
  );
};

export default FilterBar;