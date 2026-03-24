const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
      >
        Prev
      </button>

      <span className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">
        Page {currentPage} of {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
