import { useNavigate } from "react-router-dom";
import {
  Clock,
  User,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  Tag,
  ChevronRight,
} from "lucide-react";

const TicketTable = ({ tickets, showAssignee = false }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return {
          color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          dot: "bg-emerald-400 animate-pulse",
        };
      case "Assigned":
        return {
          color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          dot: "bg-amber-400",
        };
      case "In Progress":
        return {
          color: "bg-sky-500/10 text-sky-300 border-sky-500/30",
          dot: "bg-sky-400 animate-pulse",
        };
      case "Awaiting User Response":
        return {
          color: "bg-violet-500/10 text-violet-300 border-violet-500/30",
          dot: "bg-violet-400",
        };
      case "Resolved":
        return {
          color: "bg-teal-500/10 text-teal-300 border-teal-500/30",
          dot: "bg-teal-400",
        };
      case "Closed":
      default:
        return {
          color: "bg-slate-800/80 text-slate-400 border-slate-700",
          dot: "bg-slate-500",
        };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Urgent":
        return {
          icon: Flame,
          color: "text-rose-400 bg-rose-500/10 border-rose-500/25",
        };
      case "High":
        return {
          icon: ArrowUp,
          color: "text-orange-400 bg-orange-500/10 border-orange-500/25",
        };
      case "Medium":
        return {
          icon: Minus,
          color: "text-amber-300 bg-amber-500/10 border-amber-500/25",
        };
      case "Low":
      default:
        return {
          icon: ArrowDown,
          color: "text-slate-400 bg-slate-800/60 border-slate-700/60",
        };
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-black/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800/80 uppercase tracking-wider text-[11px] text-slate-400 font-semibold">
            <tr>
              <th className="py-3.5 px-4 font-mono">ID</th>
              <th className="py-3.5 px-4">Subject & Details</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              {showAssignee ? (
                <th className="py-3.5 px-4">Assignee</th>
              ) : null}
              <th className="py-3.5 px-4">Last Activity</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tickets.map((ticket) => {
              const statusMeta = getStatusBadge(ticket.status);
              const priorityMeta = getPriorityBadge(ticket.priority);
              const PriorityIcon = priorityMeta.icon;

              return (
                <tr
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="group cursor-pointer hover:bg-slate-800/50 transition-all duration-150"
                >
                  <td className="py-4 px-4 font-mono text-slate-500 font-medium group-hover:text-indigo-400 transition-colors">
                    #{ticket.id}
                  </td>
                  <td className="py-4 px-4 max-w-md">
                    <p className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors text-sm truncate">
                      {ticket.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-500" />
                        <span>{ticket.category_name || "Support"}</span>
                      </span>
                      {ticket.created_by_name && (
                        <>
                          <span>·</span>
                          <span className="text-slate-400 truncate">
                            By {ticket.created_by_name}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusMeta.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                      />
                      <span>{ticket.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${priorityMeta.color}`}
                    >
                      <PriorityIcon className="w-3 h-3" />
                      <span>{ticket.priority}</span>
                    </span>
                  </td>
                  {showAssignee ? (
                    <td className="py-4 px-4">
                      {ticket.assigned_to_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-semibold text-indigo-300 flex items-center justify-center shrink-0">
                            {ticket.assigned_to_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-300 truncate max-w-[120px]">
                            {ticket.assigned_to_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                  ) : null}
                  <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        {new Date(
                          ticket.updated_at || ticket.created_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;
