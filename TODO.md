# Cancellation Workflow Changes

## Tasks
- [x] Update FrontEnd/src/components/Cancellation.js: Change button texts and display from fee to refund
- [x] Update backend/src/main/java/com/grp12/Services/EmailService.java: Add refund amount to cancellation email

## Details
1. In Cancellation.js:
   - Change "Pay & Confirm" to "Confirm"
   - Change "Confirm Cancellation" to "Confirm"
   - Replace "Estimated cancellation fee" with "Refund"
   - Calculate refundAmount as totalAmount - cancellationFee

2. In EmailService.java:
   - Calculate refund in buildCancellationEmailHtml
   - Add refund amount to the email output
