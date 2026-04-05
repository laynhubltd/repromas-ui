# Agent Feature UI/UX Rules

## Purpose
This document defines **standard UI/UX rules and principles** for building consistent, scalable, and user-friendly frontend features.

---

## Core Principles

### 1. Clarity Over Complexity
- Keep UI simple and intuitive
- Avoid unnecessary elements
- Use clear, user-friendly labels

### 2. Consistency
- Reuse patterns across features
- Maintain uniform spacing, typography, and actions

### 3. Feedback & Responsiveness
- Always show:
  - Loading states
  - Success states
  - Error states

### 4. Progressive Disclosure
- Show only what is necessary
- Hide advanced options until needed

---

## Feature Structure Standard

### 1. Overview (Dashboard Section)
Each feature MUST include:
- Metrics cards
- Status indicators
- Quick actions (e.g., "Create")

---

### 2. Explorer (Feature Introduction)
Each feature MUST include:
- What the feature does
- Why it matters
- How to use it

---

## Data Display Rules

### 1. Small Data Sets → List Component
Use List when:
- ≤ 4–5 fields
- Simple structure

---

### 2. Large Data Sets → Table Component
Use Table when:
- > 5 fields
- Structured data

**Table Requirements:**
- Sortable columns
- Pagination
- Filtering/search

---

### 3. Fixed Columns
Use sticky/fixed columns when:
- Key identifiers (e.g., Name, ID) must remain visible
- Horizontal scrolling exists

---

### 4. Mobile Responsiveness (MANDATORY)

#### Tables MUST degrade gracefully

On mobile screens, tables MUST:
- Support **horizontal scrolling**, OR
- Automatically transform into a **stacked list/card layout**

**Preferred priority:**
1. Stacked list (best UX)
2. Horizontal scroll (fallback)

**Rules:**
- Never break layout
- Never truncate critical data without access
- Maintain action accessibility

---

## Actions & Interaction Rules

### 1. Action Placement
- Primary actions → top right
- Row actions → right side

---

### 2. Action Density Rule (IMPORTANT)

- If actions ≤ 2:
  - Show inline (icons or buttons)

- If actions > 2:
  - Use **three vertical dots (⋮) dropdown menu**

**Dropdown Requirements:**
- Clearly labeled actions
- Group destructive actions (e.g., Delete) separately
- Maintain consistent ordering across app

---

### 3. Inline Actions
- Allow quick edit/delete where possible
- Avoid unnecessary navigation

---

### 4. Confirmation Patterns
Use confirmation for:
- Delete
- Critical updates

---

## Create / Edit Patterns

### Modal-First Approach (MANDATORY)

All Create operations MUST use modals.

---

### Modal Sizing Rules

| Form Size | UI Pattern |
|---|---|
| ≤ 6 fields | Small Modal |
| 6–12 fields | Large Modal |
| Complex/Multi-step | Full Page |

---

### Modal UX Requirements
- Clear title
- Primary CTA (Save/Create)
- Secondary CTA (Cancel)
- Inline validation
- Loading state on submit

---

## Form Design Rules

### Validation
- Validate early
- Show clear error messages

---

### Field Types
- Select → predefined values
- Toggle → boolean
- Text → free input

---

### Grouping
- Group related fields
- Use sections when needed

---

## State Handling

### 1. Empty State
- Helpful message
- CTA (e.g., "Create first item")

### 2. Loading State
- Skeletons or spinners

### 3. Error State
- Clear message
- Retry option

---

## Performance Rules
- Use pagination for large data
- Avoid over-fetching
- Cache where possible

---

## Accessibility Rules
- Keyboard navigation support
- Proper labels
- Good contrast ratios

---

## UX Enhancements

### Search & Filters
- Required for large datasets

### Sorting
- Default meaningful sort
- Allow override

### Tooltips
- Use for icons or complex info

---

## Anti-Patterns (Avoid)

- ❌ Full-page forms for simple create
- ❌ Tables for small datasets
- ❌ Too many fields in one view
- ❌ No user feedback
- ❌ Hidden critical actions

---

## Summary Checklist

- ✔ Dashboard + Explorer present
- ✔ Create uses Modal
- ✔ Small data → List
- ✔ Large data → Table
- ✔ Tables responsive (stack/scroll)
- ✔ Actions follow dropdown rule
- ✔ States handled properly
- ✔ UI consistent

---

## Final Thought

A good UI should be:
- Intuitive
- Fast
- Consistent

Design for users, not developers.