import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-900/80 disabled:hover:text-slate-300 transition-all cursor-pointer shadow-sm"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Prev</span>
      </button>

      <span className="rounded-xl border border-indigo-500/30 bg-indigo-600/15 px-3.5 py-2 text-xs font-medium text-indigo-300 font-mono">
        Page {currentPage} of {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-900/80 disabled:hover:text-slate-300 transition-all cursor-pointer shadow-sm"
      >
        <span>Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Pagination;
