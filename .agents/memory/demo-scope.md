---
name: Demo scope and launch defaults
description: Distinguish the approved test version from unconfirmed launch assumptions.
---

The user chose test payments for the first version. This does not authorize charging real customers or onboarding paid helpers.

**Why:** The user explicitly chose test payments when offered test versus real payments.

**How to apply:** Keep charges clearly simulated. Do not silently connect or enable live billing.

Dubai, AED, and a 10% platform fee deducted from the helper payout are demo defaults, not user-confirmed launch geography, currency, or commercial terms.

**Why:** The user specified success-only fees but did not specify a city, currency, fee rate, or whether the fee is added or deducted.

**How to apply:** Confirm these business settings before transitioning from the demo to real operations.

In the demo, a helper may mark an arrived jump as successful, which records a simulated payment and fee. Do not use helper confirmation alone to authorize real payments.

**Why:** The user asked for a one-sided helper completion step to make successful demo outcomes easy to show.

**How to apply:** Keep this shortcut in the test-only flow. Require driver confirmation before any real charge.
