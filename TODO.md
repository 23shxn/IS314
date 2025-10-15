# Task: Create a new reservations page for superadmin and admin showing all current reservations

## Steps to Complete

### 1. Create New Component and Styles
- [x] Create `FrontEnd/src/components/AllReservations.js` - New React component for displaying all reservations in a table with filters, search, and actions (view details, cancel).
- [x] Create `FrontEnd/src/styles/AllReservations.css` - Styling for the new component (table, modals, filters, status badges).

### 2. Update App.js for Data Fetching and Routing
- [x] Edit `FrontEnd/src/App.js`:
  - Add fetch for all reservations in `fetchInitialData` when role is 'ADMIN' or 'SUPER_ADMIN'.
  - Add new route `/admin/reservations` under AdminRoute, rendering AllReservations with props.
  - Change `/manager/reservations` to use AllReservations instead of ReservationManagement for consistency.

### 3. Update Admin Dashboard
- [x] Edit `FrontEnd/src/components/AdminDashboard.js`:
  - Add sidebar button for "Reservations" linking to `/admin/reservations` (with Calendar icon).
  - Ensure stats use fetched reservations.length.

### 4. Update Super Admin Dashboard
- [x] Edit `FrontEnd/src/components/SuperAdminDashboardManager.js`:
  - Remove "All Reservations" button, keep only "Reservations" button for consistency.

### 5. Update Security Config
- [x] Edit `backend/src/main/java/com/grp12/config/SecurityConfig.java`:
  - Add security rule to allow ADMIN and SUPER_ADMIN access to `/api/reservations/**`.

### 6. Testing and Verification
- [x] Run frontend: `cd FrontEnd && npm start`.
- [x] Login as ADMIN: Navigate to `/admin/reservations`, verify table loads all reservations, test filters/search, view modal, cancel action.
- [x] Login as SUPER_ADMIN: Navigate to `/manager/reservations`, verify same functionality.
- [x] Check console for errors; ensure backend access works for both ADMIN and SUPER_ADMIN.
- [x] Update this TODO.md with [x] for completed steps.

### 7. Completion
- [x] Use attempt_completion to finalize once all steps are verified.
