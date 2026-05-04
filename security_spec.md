# Security Specification for Nexus M&A

## 1. Data Invariants
- A User must have a verified email state for high-stakes actions (if applicable).
- A Deal must belong to a verified Seller (User).
- A Document must belong to a Deal and an Owner.
- An Offer can only be made on a 'published' Deal.
- An Offer remains immutable in terms of buyerId and dealId after creation.

## 2. The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Attempt to create a deal with `sellerId` of another user.
2. **State Shortcutting**: Attempt to update a deal status directly to 'published' from 'draft' (if workflow exists).
3. **Ghost Fields**: Adding `isVerified: true` to a user profile update.
4. **PII Leak**: Authenticated user trying to 'get' another user's profile.
5. **Orphaned Writes**: Creating an offer on a non-existent deal ID.
6. **Resource Poisoning**: Document with 2MB metadata string.
7. **Cross-Tenant Write**: User A updating User B's company profile.
8. **Public Write**: Unauthenticated user trying to create a deal.
9. **Role Escalation**: User updating their own profile to `userType: 'admin'`.
10. **Immutable field update**: Updating `createdAt` on a deal.
11. **Negative Valuation**: Creating a deal with a negative valuation.
12. **Anonymous Spam**: Create offers without being logged in.

## 3. Test Runner (Draft)
The `firestore.rules.test.ts` would verify that these scenarios are blocked by the firewall.
