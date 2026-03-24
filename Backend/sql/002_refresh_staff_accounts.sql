-- Refresh support staff accounts:
-- 1. Remove the original seeded admin account.
-- 2. Create 5 fresh agent accounts.
-- 3. Create 5 fresh admin accounts.
-- This script is safe to re-run because it deletes by email before inserting.

DELETE FROM users
WHERE email IN (
  'admin@example.com',
  'support.agent.01@company.com',
  'support.agent.02@company.com',
  'support.agent.03@company.com',
  'support.agent.04@company.com',
  'support.agent.05@company.com',
  'ops.admin.01@company.com',
  'ops.admin.02@company.com',
  'ops.admin.03@company.com',
  'ops.admin.04@company.com',
  'ops.admin.05@company.com'
);

INSERT INTO users
  (full_name, email, password_hash, role, level, department_id, employee_id, is_active)
VALUES
  ('Aarav Khanna', 'support.agent.01@company.com', '$2b$10$tTnTyEb5GLScp7m0URKayOcgxfGplHiHsW3mvzjKWvfdwzxezX0Fi', 'agent', 'mid', 1, 'AGT-201', 1),
  ('Ishita Rao', 'support.agent.02@company.com', '$2b$10$FJ1CWe4lv3GEx.7Z0raKouXYDpzy7/NIV2q0VtCIgr5YzIu7FGbFe', 'agent', 'mid', 2, 'AGT-202', 1),
  ('Kabir Sethi', 'support.agent.03@company.com', '$2b$10$IP6zZJ4SMGUIk3F0WGkeBOeinLlovBUA1zK7vdKjMIQ97cOWBDYrC', 'agent', 'senior', 3, 'AGT-203', 1),
  ('Ritika Das', 'support.agent.04@company.com', '$2b$10$qLq0BNNAwKG7u1.tI5u1nupcEmPr/y79tFIh5XUxn07NfYDxbIEAO', 'agent', 'mid', 4, 'AGT-204', 1),
  ('Dev Mallick', 'support.agent.05@company.com', '$2b$10$T4R2MUXjLwabnuXoMl8B2OEWVZQAhZsqnxy.BEmaIhzHAqfPeyI9O', 'agent', 'senior', 5, 'AGT-205', 1),
  ('Nikita Sen', 'ops.admin.01@company.com', '$2b$10$NhjrA.C7I1qE2v9LbUydNOvyeikjITnZgLhuYou4lniJByrkW0LB.', 'admin', 'senior', 1, 'ADM-301', 1),
  ('Manav Bhasin', 'ops.admin.02@company.com', '$2b$10$QgUoW4vb3hZd.2JBcPbweeSiEGThqf6/edY43ZvQ7UhJe2aWDt3Yy', 'admin', 'senior', 2, 'ADM-302', 1),
  ('Tanya Arora', 'ops.admin.03@company.com', '$2b$10$RfmQxgXkY1.aHSmqNkuo5.Eod8/WUd6dckhZG9.db9tbr34pAKv3q', 'admin', 'senior', 3, 'ADM-303', 1),
  ('Harsh Vyas', 'ops.admin.04@company.com', '$2b$10$IJ4caDyv878E6x5ZhKEBV.DnjtJER8ehbv7J8oRU6Phw4Im10s/Cy', 'admin', 'senior', 4, 'ADM-304', 1),
  ('Simran Bajaj', 'ops.admin.05@company.com', '$2b$10$CebMGRzjxVvZ6BY5qNKdgeioEsqjf85JBf19S8j3t67olMH90cUAy', 'admin', 'senior', 5, 'ADM-305', 1);
