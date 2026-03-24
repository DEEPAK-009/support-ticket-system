import { useNavigate } from "react-router-dom";

const TicketTable = ({ tickets, showAssignee = false }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    const map = {
      Open: "bg-slate-100 text-slate-700",
      Assigned: "bg-amber-100 text-amber-700",
      "In Progress": "bg-blue-100 text-blue-700",
      "Awaiting User Response": "bg-violet-100 text-violet-700",
      Resolved: "bg-emerald-100 text-emerald-700",
      Closed: "bg-slate-200 text-slate-700"
    };

    return map[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="p-4 font-medium text-slate-500">ID</th>
            <th className="p-4 font-medium text-slate-500">Title</th>
            <th className="p-4 font-medium text-slate-500">Status</th>
            <th className="p-4 font-medium text-slate-500">Priority</th>
            {showAssignee ? <th className="p-4 font-medium text-slate-500">Assignee</th> : null}
            <th className="p-4 font-medium text-slate-500">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
            >
              <td className="p-4 text-slate-500">#{ticket.id}</td>
              <td className="p-4">
                <p className="font-medium text-slate-900">{ticket.title}</p>
                <p className="mt-1 text-xs text-slate-500">{ticket.category_name || "Support ticket"}</p>
              </td>
              <td className="p-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="p-4 text-slate-600">{ticket.priority}</td>
              {showAssignee ? (
                <td className="p-4 text-slate-600">{ticket.assigned_to_name || "Unassigned"}</td>
              ) : null}
              <td className="p-4 text-slate-500">
                {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
