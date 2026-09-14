# Implementation Plan: Approval Workflow Frontend (repromas-ui) — Actor, Broadsheet, Config & Audit Surfaces

Frontend for the `src/ApprovalWorkflow` backend (final plan approved). Delivers the actor experience (transition buttons on score sheets), the cohort broadsheet approval lane, the admin workflow builder, and the audit trail — built on five architectural structures that make the UX guarantees structural rather than disciplinary.

Grounded in verified codebase surfaces: `src/features/assessment` (ScoreSheetTable/Meta/Card, `useScoreSheetBulkOperations`), `src/features/result-broadsheet`, `EscalationLadderSteps` (AntD `Steps` precedent), `GroupedConfigTabs`, the AcademicStanding config-tab family, ui-kit explainer/surfaces, RTK Query `baseApi` conventions.

---

## Architectural Invariants (the five structures)

> [!IMPORTANT]
> 1. **Server-authoritative affordances**: the FE NEVER computes who may act. Transition buttons render exclusively from `GET /api/workflows/available-transitions`. No role/scope/allocation logic exists in actor components; `PermissionGuard` is used ONLY on config (admin) surfaces.
> 2. **One interaction grammar**: `<WorkflowStatusBar />` + `useWorkflowTransitions(targetEntity, targetId)` are the ONLY unit that renders transitions or calls `executeTransition`. Sheets and broadsheets both consume it; neither reimplements any part. Enforced by test (see §Guard Tests).
> 3. **Three-tag invalidation**: `executeTransition` invalidates the target entity tag + `WorkflowTransitions` + `WorkflowAudit` — status bar, lock state, buttons, and history drawer all re-derive from one mutation. No polling, EXCEPT the bounded pending-effects poll after a terminal transition (Invariant 4).
> 4. **Eventual consistency narrated once**: the transition result carries `pendingEffects: string[]`. The status bar renders a transient "propagating" state on the terminal step and re-polls the target (max 3 attempts, backoff) until effects clear. No other component knows async effects exist.
> 5. **Artifact identity as a type**: the broadsheet page's data source is a discriminated union `{ source: 'LIVE' } | { source: 'SNAPSHOT', frozenAt }` resolved by ONE hook; the frozen-vs-live banner, matrix, cards, and PDF export are projections of it. Honesty is structural.
>
> **FE Iron-Rule mirror**: no component compares against `state_code` strings or step labels. Styling keys off `direction` (`FORWARD`/`REVERSE`), `isTerminal`, `isEditable`, and step position only. Step labels and comments are tenant data rendered verbatim; all fixed labels via `useInstitutionTerminology()`; colors via `useToken()` only.

**Design decision (recorded)**: the admin builder is **form-based with a live `Steps` preview** — NOT a drag-drop canvas. Ladders here are near-linear chains with reverse edges; a canvas adds a dependency (violating the no-new-deps rule) for topology this domain doesn't have. Pattern: the AcademicStanding config family, which admins already know.

---

## Proposed Changes

### Layer 0 — Shared workflow unit (`src/features/approval-workflow/`) [NEW feature package]

```
src/features/approval-workflow/
├── api/approvalWorkflowApi.ts          # RTKQ injections (execution + audit + config)
├── types/approval-workflow.ts          # types (strictly `type`), transcribed from BE serializers
├── hooks/
│   ├── useWorkflowTransitions.ts       # THE hook: transitions query, execute mutation,
│   │                                   #   comment-modal state, 409 recovery, pendingEffects poll
│   └── useWorkflowAudit.ts             # audit history query + drawer state
├── components/
│   ├── WorkflowStatusBar.tsx           # Steps strip + transition buttons + propagating state
│   ├── TransitionCommentModal.tsx      # mandatory-remark modal (submit disabled while empty)
│   ├── WorkflowAuditDrawer.tsx         # AntD Timeline: actor · acting_role_name · action · from→to · comment
│   └── WorkflowLockBanner.tsx          # "Locked — awaiting {stepLabel} · view history"
├── utils/
│   ├── renderWorkflowError.ts          # ONE error grammar: 422 violations list / 409 refresh / 403
│   └── renderWorkflowError.test.ts
└── index.ts                            # public exports (other features import ONLY from here)
```

**apiTagTypes.ts [MODIFY]**: add `WorkflowDefinition`, `WorkflowTransitions`, `WorkflowAudit`.

**Key contracts in `approvalWorkflowApi.ts`:**
- `getAvailableTransitions({ targetEntity, targetId })` → provides `[{ WorkflowTransitions, id: `${targetEntity}:${targetId}` }]`.
- `executeTransition({ targetEntity, targetId, transitionId, comment? })` → invalidates `WorkflowTransitions:{target}`, `WorkflowAudit:{target}`, **plus the target's own tag** (`ScoreSheet` / `BroadsheetApproval` — passed via arg so the shared api stays target-agnostic).
- `getWorkflowAuditHistory({ targetEntity, targetId })`.
- Result type includes `pendingEffects: string[]` (Invariant 4).

**`useWorkflowTransitions` behavior spec:**
- REVERSE transition click → `TransitionCommentModal` (comment required); FORWARD → immediate with per-button loading state.
- 409 → refetch transitions + target, toast *"Moved to {newStepLabel} by another user — actions refreshed"* (not an error toast).
- Terminal transition with `pendingEffects` → propagating chip + bounded re-poll; resolve to final state.
- Buttons disabled (not hidden) while any transition is in flight — no double-fire from the UI side (the backend 409 is the backstop, not the UX).

### Layer 1 — Actor surface (`src/features/assessment/`) [MODIFY]

- **`ScoreSheetMeta.tsx`**: mount `<WorkflowStatusBar targetEntity="SCORE_SHEET" targetId={sheet.id} />` (horizontal Steps strip; vertical on mobile via `useIsMobile`).
- **`ScoreSheetTable.tsx` / editing surfaces**: editability derives from the sheet payload's step `isEditable` (server echoes it) → inputs disabled + `<WorkflowLockBanner />` when locked. Remove any hardcoded `status === 'DRAFT'` checks (mirror of backend ADR 1).
- **`AssessmentPage.tsx`**: add the **"Awaiting my action"** filter chip — driven by the list payload's server-computed `actionableByMe` flag (see N+1 note), NOT by per-row transition fetches.
- **N+1 rule (recorded)**: sheet LIST payloads embed `currentStepLabel` + `actionableByMe` only; full `available-transitions` is fetched on engagement (sheet detail / action popover). One target, one call, fresh at the moment of action. (Backend follow-up if the list DTO lacks these two fields — filed, not worked around client-side.)
- Bulk transition via `useScoreSheetBulkOperations` is **v1.5**: design the status bar so multiple targets can share one comment modal; do not build in v1.

### Layer 2 — Broadsheet approval lane (`src/features/result-broadsheet/`) [MODIFY]

- **[NEW] `hooks/useBroadsheetSource.ts`**: resolves the discriminated union `{ source: 'LIVE', data } | { source: 'SNAPSHOT', data, frozenAt }` from the `CohortBroadsheetApproval` aggregate; published/submitted diets default to SNAPSHOT with a manual "view live data" escape.
- **[NEW] `components/BroadsheetApprovalPanel.tsx`**:
  - Pre-submission: completeness meter ("42/45 sheets ready") + laggard list (from the completeness-gate 422 shape rendered via `renderWorkflowError`) + "Submit for approval" CTA.
  - Post-submission: `<WorkflowStatusBar targetEntity="COHORT_BROADSHEET" targetId={approval.id} />` + audit drawer trigger.
- **[NEW] `components/SnapshotBanner.tsx`**: projection of the source union — *"Viewing: Frozen snapshot (submitted {date})"* / *"Viewing: Live draft data"*, with the switch. `PUBLISHED` ribbon on terminal state.
- **`ResultBroadsheetPage.tsx` [MODIFY]**: mount panel + banner; PDF export routes by the union (snapshot for submitted/published, live for draft).

### Layer 3 — Admin builder (`src/features/settings` or dedicated config group) [NEW tab group]

Register an "Approval Workflows" group via `GroupedConfigTabs`, following the AcademicStanding family:

```
src/features/approval-workflow-config/
├── api/workflowConfigApi.ts            # definition/step/transition CRUD + activate (tags: WorkflowDefinition)
├── types/workflow-config.ts
├── hooks/
│   ├── useWorkflowDefinitionEditor.ts  # steps list, transitions, dirty state, activation flow
│   └── useActivationViolations.ts      # maps the structured 422 into the checklist model
├── components/
│   ├── WorkflowDefinitionsTab.tsx      # cards: Active / Draft / Default(seeded, clone-to-customize)
│   ├── WorkflowStepsEditor.tsx         # ordered list, drag reorder, Initial/Terminal/Editable chips,
│   │                                   #   in-use lock badge ("3 sheets in this step")
│   ├── WorkflowTransitionsEditor.tsx   # rows: from → action → to, direction, role multi-picker (by role_id,
│   │                                   #   names displayed), requires-comment (forced ON for REVERSE),
│   │                                   #   prevent-self-approval toggle, system-action select w/ ExplainerBadge
│   ├── WorkflowPreviewLadder.tsx       # live read-only Steps ladder (EscalationLadderSteps pattern)
│   ├── ActivationChecklist.tsx         # the 422 violations rendered as a to-do list w/ jump-to-fix
│   └── DeleteWorkflowModal.tsx
└── index.ts
```

- Draft banner persistent while `is_active = false`; **Activate** renders `ActivationChecklist` on 422 — the validator as a guided to-do list, not a rejection.
- All admin mutations behind `PermissionGuard` (constants per backend catalogue).
- Role picker options from the tenant roles endpoint — displayed by name, bound by id (never string-matched).

### Layer 4 — Queue entry (v2, filed): dashboard "Awaiting your action" card wired to the KPI module's actionable-alert pattern.

---

## Guard Tests (the invariants, enforced)

1. **Grammar test**: no file outside `features/approval-workflow` imports `useExecuteTransitionMutation` (grep-style arch test, `IronRuleSemanticKindTest` FE analog).
2. **Iron-Rule mirror test**: no `state_code`/step-label string comparisons outside the shared package (grep for `=== '` against known seeded codes in feature dirs).
3. `useWorkflowTransitions` unit tests: REVERSE requires comment (mutation never fires with empty remark); 409 → refetch + informational toast path; `pendingEffects` → bounded poll → resolution; in-flight disable.
4. `renderWorkflowError` unit tests: 422 violations → checklist model; completeness 422 → laggard list; 409 → refresh descriptor; 403 → silent-consistency descriptor.
5. `WorkflowStatusBar` component tests: buttons render exactly from mocked available-transitions (zero when empty → read-only, no error); forward=primary / reverse=danger styling by `direction` only.
6. `useBroadsheetSource` tests: union resolution per aggregate state; PDF routing by source.
7. Config: `ActivationChecklist` renders every violation type; steps editor blocks delete on in-use badge; transitions editor forces `requires_comment` for REVERSE.
8. Integration (per lane): transition on a sheet updates status bar + lock + audit drawer via tag invalidation in one mutation cycle.

```bash
npm test -- src/features/approval-workflow src/features/approval-workflow-config src/features/assessment src/features/result-broadsheet
npx tsc --noEmit && npm run lint
```

---

## Phased Build Order (mirrors backend phases)

| Phase | Scope | Depends on backend |
|---|---|---|
| **FE-1** | Layer 0 shared unit + Layer 1 actor surface, against the **seeded default** workflow | BE Phase 2 (engine + parity) |
| **FE-2** | Layer 2 broadsheet lane (union hook, approval panel, snapshot banner, PDF routing) | BE Phase 4 (aggregate + snapshot) |
| **FE-3** | Layer 3 admin builder + activation checklist | BE Phase 3 (config CRUD + validator) |
| **FE-4** | Propagating-state polish (pendingEffects) + "Awaiting my action" chip | BE Phase 5 (async effects) + list-flag follow-up |
| **FE-5** | Bulk transition (v1.5) + dashboard queue card (v2) | — |

FE-1 ships user-visible value with zero config UI: the status bar renders the seeded default identically to today's flow — the parity story holds on both ends of the stack.

---

## Backend follow-ups filed by this plan
1. Sheet LIST DTO: add `currentStepLabel` + `actionableByMe` (batched evaluator pass, ≤4-queries discipline) — prevents the per-row transitions N+1.
2. `WorkflowTransitionResultDTO.pendingEffects` confirmed in the FE doc's TS types (transcribed from serializer, not assumed).
3. FE doc (`docs/frontend/approval-workflow-api.md`): endpoints, hydrated shapes, the three error grammars with example payloads, TS types — same verification discipline as the broadsheet/allocation docs.
