---
name: backend-review
description: Review TypeScript backend code for quality, patterns, and compliance. Enforces project constitution, prohibits dynamic imports in business logic, requires explicit Firestore typing with withConverter. Use for code review, PR review, swarm worker review tasks, or when validating backend changes.
metadata: {"clawdbot":{"emoji":"🔍","os":["darwin","linux","win32"]}}
---

# Backend Code Review

Review TypeScript backend code for quality, compliance, and best practices.

## Review Process

### Step 1: Load Project Constitution

Before reviewing any code, locate and read the project's constitution:

```bash
# Search for constitution in common locations
find . -name "constitution.md" -o -name "CONSTITUTION.md" | head -5
```

If found, read and internalize all rules before proceeding. The constitution takes precedence over generic rules.

### Step 2: Apply Review Rules

Review all changed files against these mandatory rules:

## Mandatory Rules

### Rule 1: No Dynamic Imports in Business Logic

Dynamic imports (`import()`) are **prohibited** in business logic code.

```typescript
// ❌ FORBIDDEN in services, controllers, helpers
const { fsdb } = await import("@common/infra");
const module = await import("./some-module");

// ✅ REQUIRED: Static imports at file top
import { fsdb } from "@common/infra";
import { someModule } from "./some-module";
```

**Exception**: Dynamic imports are allowed ONLY in:
- Test files (`*.test.ts`, `*.spec.ts`)
- Build/config files
- Lazy-loaded UI components (frontend only)

### Rule 2: Firestore Must Use withConverter

All Firestore read operations **must** use `withConverter` for explicit typing.

```typescript
// ❌ FORBIDDEN: Default Firestore types
const doc = await fsdb.collection("Client").doc(id).get();
const data = doc.data(); // Returns DocumentData (any)

// ❌ FORBIDDEN: Type assertion without converter
const data = doc.data() as Client;

// ✅ REQUIRED: withConverter for explicit typing
import { clientConverter } from "@common/converters/client.converter";

const doc = await fsdb
  .collection("Client")
  .withConverter(clientConverter)
  .doc(id)
  .get();
const data = doc.data(); // Returns Client | undefined
```

**Converter Pattern:**

```typescript
// Define converter with explicit types
export const clientConverter: FirestoreDataConverter<Client> = {
  toFirestore(client: Client): DocumentData {
    return { ...client };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Client {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
    } as Client;
  },
};
```

### Rule 3: Use Module Types (qashier-core), Not Namespace Types

New code must use `qashier-core` module types, not legacy namespace types.

```typescript
// ❌ FORBIDDEN: Namespace types
const store: Qashier.Store.Store = { ... };
const lock: Qashier.Store.StoreLock = { ... };

// ✅ REQUIRED: Module types
import type { Store, StoreLock } from "qashier-core";
const store: Store = { ... };
const lock: StoreLock = { ... };
```

### Rule 4: Constitution Compliance

All code must comply with rules defined in the project's `constitution.md`. Common constitution rules include:

- Naming conventions
- Error handling patterns
- Logging requirements
- Testing requirements
- API response formats
- Security practices

## Review Output Format

For each file reviewed, output:

```markdown
## File: `path/to/file.ts`

### Violations Found

1. **[RULE_NAME]** Line XX: Description of violation
   ```typescript
   // Offending code
   ```
   **Fix:**
   ```typescript
   // Corrected code
   ```

2. **[RULE_NAME]** Line YY: Description
   ...

### Suggestions (non-blocking)

- Consider using X pattern for better readability
- ...
```

## Severity Levels

- **🔴 BLOCKING**: Must fix before merge (Rule 1, 2, 3 violations)
- **🟡 WARNING**: Should fix, but can merge with justification
- **🟢 SUGGESTION**: Optional improvements

## Integration with Swarm

When used as a review worker in multi-agent swarm:

1. Accept file list from coordinator
2. Load constitution once at start
3. Review each file against all rules
4. Return structured findings
5. Block merge if any 🔴 BLOCKING issues found

## Quick Checklist

Before approving any PR:

- [ ] Constitution loaded and understood
- [ ] No dynamic imports in business logic
- [ ] All Firestore reads use withConverter
- [ ] Using qashier-core types, not namespace types
- [ ] Error handling follows constitution patterns
- [ ] Tests cover new/changed code paths
