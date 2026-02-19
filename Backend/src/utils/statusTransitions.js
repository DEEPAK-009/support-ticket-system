const allowedTransitions = {
  user: {
    Resolved: ['Closed']
  },
  agent: {
    Open: ['In Progress'],
    'In Progress': ['Awaiting User Response', 'Resolved']
  },
  admin: {
    Open: ['In Progress', 'Resolved', 'Closed'],
    'In Progress': ['Awaiting User Response', 'Resolved', 'Closed'],
    'Awaiting User Response': ['In Progress', 'Resolved', 'Closed'],
    Resolved: ['Closed']
  }
};

const canTransition = (role, currentStatus, newStatus) => {
  const roleRules = allowedTransitions[role];

  if (!roleRules) return false;

  const allowed = roleRules[currentStatus];

  if (!allowed) return false;

  return allowed.includes(newStatus);
};

module.exports = {
  canTransition
};
