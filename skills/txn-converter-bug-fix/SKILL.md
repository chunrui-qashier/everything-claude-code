---
name: txn-converter-bug-fix
description: Use when fixing bugs reported with Firestore document references. Extracts production data as test fixtures, locates the bug, implements fix with tests, and creates PR. Invoke when user reports a bug with a Firestore document path like `/Client/xxx/Transaction/yyy`.
---

# Transaction Converter Bug Fix Workflow

A systematic approach to fixing bugs in the transaction converter using production Firestore data.

## Red Lines - DO NOT CROSS

**NEVER modify existing test cases.** If your fix breaks existing tests, your fix is wrong - not the tests. Existing tests represent the expected business behavior that was previously defined and validated.

- Existing test expectations are the source of truth
- If a fix causes existing tests to fail, reconsider the approach
- Only ADD new test cases for the bug being fixed
- The fix must pass ALL existing tests without modification

## When to Use This Skill

Invoke when:
- User reports a bug with a Firestore transaction path (e.g., `/Client/xxx/Transaction/yyy`)
- Bug involves transaction data transformation or conversion logic
- Issues with tax calculation, discount handling, or item processing
- Need to create test cases from real production transaction data

## Key Files

- **Converter**: `functions/src/common/infra/clickhouse/convertors/transaction.convertor.ts`
- **Tests**: `functions/src/common/infra/clickhouse/convertors/__tests__/transaction.convertor.test.ts`
- **Fixtures**: `functions/src/common/infra/clickhouse/convertors/__tests__/sample.transactions/`
- **Types**: `functions/src/common/types/core/transaction.d.ts`

## Workflow

```
1. Extract Data    → qashier-cli to get Firestore transaction
2. Analyze         → Find the field/flag not being handled
3. Locate Bug      → Find converter function ignoring the field
4. Fix Code        → Add missing checks (usually 2-3 locations)
5. Add Test        → tc###-descriptive-name.json + test case
6. Verify          → yarn test "transaction.convertor.test.ts"
7. Ship            → Commit, push, create PR
```

## Step 1: Extract Transaction Document

```bash
# Verify auth (should be production for bug reports)
qashier-cli auth status

# Extract transaction
qashier-cli dev extract-firestore "Client/<clientId>/Transaction/<txnId>" \
  --output functions/src/common/infra/clickhouse/convertors/__tests__/sample.transactions/tc###-name.json

# Strip metadata wrapper - keep only data
cat <file>.json | jq '.document.data' > /tmp/data.json && mv /tmp/data.json <file>.json
```

## Step 2: Analyze the Transaction

Look at the transaction items for the problematic field:
```bash
cat tc###.json | jq '.transactionItem[] | {productName, <suspectField>, totalIncludedTax, finalAmount}'
```

Common fields to check:
- `nonTaxable` - item should not be taxed
- `vatExemptIndicator` - VAT exempt item
- `packageTransactionOrNot` - package/bundle item
- `memberPriceOrNot` - member pricing applied

## Step 3: Locate the Bug

Search for where similar fields are handled:
```bash
grep -n "vatExemptIndicator\|nonTaxable" transaction.convertor.ts
```

Key functions in transaction converter:
- `getTaxableAmount()` - determines if item contributes to taxable amount
- `getComboWeightInBill()` - calculates item weight for tax distribution
- `convertItems()` - main item conversion loop
- `itemWeightInVAT` calculation - Philippines-specific VAT handling

## Step 4: Fix Pattern

Typical fix - add missing field check alongside existing similar check:

```typescript
// Before: Only checked one field
if (item.vatExemptIndicator) {
  return 0;
}

// After: Check both equivalent fields
if (item.vatExemptIndicator || item.nonTaxable) {
  return 0;
}
```

**Important**: Find ALL locations where the check should be added. Usually 2-3 places:
1. `getTaxableAmount()` - return 0 for exempt items
2. `getComboWeightInBill()` - exclude from weight when `shouldConsiderVatExempt=true`
3. `itemWeightInVAT` calculation - exclude for Philippines transactions

## Step 5: Add Test Case

```typescript
describe("<Feature> handling", () => {
  /**
   * TC###: Transaction with <field> item
   * Source: Firestore /Client/<id>/Transaction/<id>
   *
   * Transaction items:
   * - Item 1: <field>=false, finalAmount=X, totalIncludedTax=Y
   * - Item 2: <field>=true, finalAmount=X, totalIncludedTax=0 <-- Bug case
   */
  it("should not apply tax to items with <field>=true (tc###)", async () => {
    const transaction = (await import(
      "./sample.transactions/tc###-name.json"
    )) as unknown as Transaction;

    const txnProps = extractTransactionProps(transaction);
    const { comboItemMap } = convertCombo(
      attachComboTotalOriginalPrice(transaction.combo || []),
      transaction.transactionItem || []
    );

    const itemResult = convertItems(
      { comboItemMap, transaction },
      txnProps
    );

    // Bug case: item with <field>=true should have 0 tax
    const bugItemIndex = N; // 0-indexed position of bug item
    expect(itemResult.itemArray.itemIncludedTax[bugItemIndex]).toBe(0);

    // Normal cases: other items should have tax
    expect(itemResult.itemArray.itemIncludedTax[0]).toBeGreaterThan(0);
  });
});
```

## Step 6: Verify

```bash
cd functions

# Run specific test
yarn test "transaction.convertor.test.ts" -t "<test name>"

# Run all converter tests
yarn test "transaction.convertor.test.ts"
```

## Step 7: Ship

```bash
# Stage files
git add \
  functions/src/common/infra/clickhouse/convertors/transaction.convertor.ts \
  functions/src/common/infra/clickhouse/convertors/__tests__/transaction.convertor.test.ts \
  functions/src/common/infra/clickhouse/convertors/__tests__/sample.transactions/tc###-name.json

# Commit
git commit -m "fix: handle <field> flag in transaction converter

<Root cause explanation>

- getTaxableAmount(): return 0 for <field> items
- getComboWeightInBill(): exclude <field> items from VAT weight
- itemWeightInVAT: exclude <field> items for Philippines

Added test case tc### from production Firestore.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push and PR
git push -u origin <branch>
gh pr create --base staging --title "fix: handle <field> flag in transaction converter" --body "..."
```

## PR Template (Required for CI/CD)

**IMPORTANT**: The PR description MUST follow the repo template at `.github/pull_request_template.md` for CI/CD to work.

```markdown
Cloud Function to deploy
-

Cloud Run/Kubernetes services to deploy
- core-data-sync-worker
- core-data-sync-worker.svc.backfill

Dev Tag:
-

Related Jira:
-

@coderabbitai summary

---

## Summary
- Fix <component> not handling <field>=<value> flag
- <Root cause explanation>
- Added test case with production Firestore document

## Changes
- `<function1>()`: <what changed>
- `<function2>()`: <what changed>

## Test plan
- [x] Added test case `tc###-name.json` from Firestore `<path>`
- [x] Verified bug case now works correctly
- [x] All existing tests pass (N passed)

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Example: nonTaxable Bug (tc019)

| Step | Action |
|------|--------|
| Document | `/Client/fEeMbYRp2SWrRAwgne5I/Transaction/xcukRhJgYjvNhu3V06Nd` |
| Bug | Item 3 has `nonTaxable=true` but was being taxed |
| Root Cause | Converter only checked `vatExemptIndicator`, not `nonTaxable` |
| Fix 1 | `getTaxableAmount()`: `if (item.vatExemptIndicator \|\| item.nonTaxable)` |
| Fix 2 | `getComboWeightInBill()`: added `\|\| calculatedItem.item.nonTaxable` |
| Fix 3 | `itemWeightInVAT`: added `&& !item.item.nonTaxable` |
| Test | tc019-nontaxable-item.json, verified item index 2 has 0 tax |
| PR | #3890 |

## Common Bug Patterns

| Symptom | Likely Cause | Fix Location |
|---------|--------------|--------------|
| Item taxed when shouldn't be | Missing flag check in `getTaxableAmount()` | Line ~184 |
| Wrong tax distribution | Missing check in `getComboWeightInBill()` | Line ~202 |
| Philippines VAT wrong | Missing check in `itemWeightInVAT` | Line ~666 |
| Discount calculated wrong | Missing check in discount computing section | Line ~673+ |
| Wrong item weight | Missing check in weight calculation | `convertItems()` |

## Tips

- **Always extract real data**: Production data catches edge cases mocks miss
- **Check all similar locations**: If a field should be checked in one place, it likely should be checked elsewhere too
- **Document the source**: Include Firestore path in test comments for traceability
- **Verify no regression**: Run full test suite for the affected file
- **Keep test data minimal**: Strip unnecessary fields from fixtures if large
