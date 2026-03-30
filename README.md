# Support Ticket System

## Overview
This project is a full-stack Support Ticket Management System built to help organizations handle internal or 
customer support requests in a structured way.

It allows users to raise tickets, agents to work on assigned issues, and admins to manage ticket flow, user access, 
and overall operations.

The system follows a structured workflow:

- A user creates a ticket  
- An admin reviews and assigns it  
- An agent works on the issue  
- The ticket moves through controlled states until it is resolved or closed  

Tech stack:
- Frontend: React , tailwind css 
- Backend: Node.js + Express  
- Database: MySQL  
- Authentication: JWT  
- Realtime updates: Server-Sent Events (SSE)  

---

## Core Features

### Authentication and Session Handling
- Secure login using email and password  
- JWT token generation after login  
- Token stored on frontend  
- API requests include Authorization header  
- Session validation using /auth/me  

Benefits:
- Prevents stale sessions  
- Blocks deactivated users  
- Maintains login after refresh  

---

### Role-Based Access Control

User:
- Create tickets  
- View own tickets  
- Respond in conversations  
- Track progress  

Agent:
- View assigned tickets  
- Work on tickets  
- Update ticket status  
- Communicate with users  

Admin:
- View all tickets  
- Assign or unassign agents  
- Update status and priority  
- Manage users  
- View analytics  
- No access to chat  

---

## Ticket Management

### Ticket Creation
Fields:
- Title  
- Description  
- Category  
- Optional priority  

System behavior:
- Automatically links creator  
- Applies default workflow  
- Makes ticket available in dashboards  

---

### Ticket Listing, Filtering, and Pagination
Filters:
- Status  
- Priority  
- Assignment state  
- Sort order  

Pagination ensures large datasets are manageable.

---

### Ticket Assignment Workflow
Admins can:
- Assign tickets  
- Unassign tickets  
- Reassign when needed  

Rules:
- Tickets cannot move to active states without an agent  
- Assigning can move status from Open to Assigned  
- Unassigning can revert status  

---

### Status Transition System
Defined states:
- Open  
- Assigned  
- In Progress  
- Awaiting User Response  
- Resolved  
- Closed  

Rules:
- Agents act on assigned tickets  
- Users respond when required  
- Admins manage within constraints  

---

## Ticket Conversation System

### Ticket Messaging
- Users and agents can exchange messages  
- Users access only their tickets  
- Agents access only assigned tickets  
- Admins do not have chat access  

Realtime behavior:
- Existing messages load initially  
- SSE stream listens for new messages  
- Messages update instantly  

---

## Admin Features

### Admin Dashboard
Includes:
- Analytics overview  
- Ticket queue  
- User management  
- Filters and pagination  

---

### User Management
Admins can:
- View users  
- Activate or deactivate accounts  
- Confirm actions before applying  

Note:
- Role changes removed for safety  

---

### Ticket Analytics
Metrics include:
- Total tickets  
- Open  
- In Progress  
- Awaiting User  
- Resolved  
- Closed  

---

## Profile and Account Management

### Profile Page
Users can:
- View account details  
- Change password  

Password update requires:
- Current password  
- New password  
- Confirmation  

---

## UI and User Experience
- Role-based interface  
- Clean and simple layout  
- Focused on usability  

Improvements:
- Better spacing and structure  
- Clear dashboards  
- Improved tables and filters  
- Better feedback and error handling  

---

## Backend Architecture

### Layered Structure
- Routes: define endpoints  
- Controllers: handle requests/responses  
- Services: business logic  
- Repositories: database queries  
- Middleware: auth and validation  
- Utils: shared helpers  

---

## Database

### MySQL Tables
- Users  
- Tickets  
- Ticket messages  
- Categories  
- Departments  
- Ticket activity log  

Supports:
- Authentication  
- Ticket ownership  
- Messaging  
- Analytics  
- User management  

---

## Workflow Summary

Typical flow:
1. User creates a ticket  
2. Admin assigns it  
3. Agent starts work  
4. Communication happens  
5. Ticket moves through states  
6. Issue is resolved and closed  

---

## Purpose
This system models real support operations:

- Structured request handling  
- Controlled workflows  
- Role-based access  
- Secure communication  
- Administrative control  
- Operational analytics  

It serves as a strong foundation for building advanced helpdesk systems.
