# TODO: Add PUT Endpoint for Vehicle Updates

## Steps to Complete
- [x] Add UPDATE changeType support in PendingVehicleChange.java
- [x] Add updateVehicle method in VehicleService.java
- [x] Add @PutMapping("/{id}") in VehicleController.java with role-based logic (superadmin direct update, regular admin pending request)
- [x] Handle multipart file uploads for image updates in the PUT endpoint
- [x] Test the implementation
