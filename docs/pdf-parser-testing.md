# PDF Parser Testing Plan

The real PDF parser phase will begin after the owner provides sample customer bill PDFs privately and safely.

## Required sample set

- 5 Go Planet PDF bills.
- 5 Brand Mark PDF bills.
- Do not commit real customer bills to git.
- Place local-only test files under `apps/agent/fixtures/sample-bills/` when needed; keep customer data out of commits.

## Fields to extract

The parser must extract:

- `customer_name`
- `customer_mobile`
- `bill_number`
- `bill_date`
- `bill_amount`
- `store_name`

## Safety rules

- The parser must not guess mobile numbers.
- If no confident customer mobile is present, return a safe parse failure or `customer_mobile: null` with low confidence.
- If multiple mobile numbers exist, avoid store phone numbers and select the customer number only using labels, position rules, or store-specific parser profile rules.
- The parser must return a confidence score for the overall result and/or important fields.
- The parser must fail safely when required fields are missing or ambiguous.
- Parser profiles must remain configurable per business/store/source; GPBM, Go Planet, and Brand Mark are seed/demo profiles only.

## Expected parser result shape

```ts
type ParsedBill = {
  customer_name: string | null;
  customer_mobile: string | null;
  bill_number: string | null;
  bill_date: string | null;
  bill_amount: number | null;
  store_name: string | null;
  confidence: number;
  warnings: string[];
};
```
