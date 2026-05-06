# ITSup Escrow State Machine

## Ticket Statuses
- `OPEN`: Ticket created, awaiting payment.
- `FUNDED`: Payment received, awaiting officer pickup.
- `ASSIGNED`: Officer assigned, work not yet started.
- `IN_PROGRESS`: Work in progress.
- `RESOLVED`: Officer claims work is done.
- `COMPLETED`: User confirms satisfaction, funds released.
- `DISPUTED`: Problem reported, admin review required.

## Escrow Transaction Statuses
- `HELD`: Money is in the system vault.
- `RELEASED`: Money sent to the officer.
- `REFUNDED`: Money sent back to the user.
- `DISPUTED`: Money frozen for review.

## Transition Rules
1. `OPEN` -> `FUNDED`: Triggered by payment webhook success.
2. `FUNDED` -> `ASSIGNED`: Triggered by `officer_id` being set.
3. `ASSIGNED` -> `IN_PROGRESS`: (Optional) Triggered by officer.
4. `IN_PROGRESS` -> `RESOLVED`: Triggered by officer.
5. `RESOLVED` -> `COMPLETED`: Triggered by user approval.
6. Any state -> `DISPUTED`: Triggered by either party.
