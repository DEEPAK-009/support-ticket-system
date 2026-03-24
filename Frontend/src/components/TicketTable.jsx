import { useNavigate } from "react-router-dom";

const TicketTable = ({ tickets, showAssignee = false }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">Status</th>
            <th className="p-3">Priority</th>
            {showAssignee ? <th className="p-3">Assignee</th> : null}
            <th className="p-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="border-t hover:bg-gray-50 cursor-pointer"
            >
              <td className="p-3">{ticket.id}</td>
              <td className="p-3 font-medium text-slate-900">{ticket.title}</td>
              <td className="p-3">{ticket.status}</td>
              <td className="p-3">{ticket.priority}</td>
              {showAssignee ? (
                <td className="p-3 text-slate-600">{ticket.assigned_to_name || "Unassigned"}</td>
              ) : null}
              <td className="p-3">
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
