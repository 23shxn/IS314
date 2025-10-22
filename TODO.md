# TODO: Secure PUT /api/reservations/{id}/cancel

## Steps to Complete

1. **Update SecurityConfig.java** ✅
   - Add specific request matcher for PUT /api/reservations/{id}/cancel to allow ROLE_USER access before the broad /api/reservations/** matcher.

2. **Update ReservationController.java** ✅
   - Add ownership check in cancelReservation method: only allow the reservation owner (matching userId) or ADMIN/SUPER_ADMIN to cancel.
   - Import necessary security classes.
   - Fetch authenticated user and verify permissions.

3. **Test the Changes**
   - Run the backend application.
   - Test the endpoint with a USER role to ensure access and ownership enforcement.
