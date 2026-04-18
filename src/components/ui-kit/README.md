# UI Kit Adoption Guide

Reusable Ant Design-first UI primitives live in `src/components/ui-kit` and are exported from `@/components/ui-kit`.

## Quick Start

```tsx
import {
  Accordion,
  Card,
  DashCard,
  Explainer,
  InlineStatus,
  ItemList,
  NotificationTray,
  Panel,
  ResponsiveCollapsibleGrid,
  Table,
} from "@/components/ui-kit";
```

## Component Inventory

| Family | Component | Source |
| --- | --- | --- |
| Surfaces | Card | src/components/ui-kit/surfaces/Card.tsx |
| Surfaces | DashCard | src/components/ui-kit/surfaces/DashCard.tsx |
| Surfaces | Panel | src/components/ui-kit/surfaces/Panel.tsx |
| Surfaces | Accordion | src/components/ui-kit/surfaces/Accordion.tsx |
| Surfaces | ResponsiveCollapsibleGrid | src/components/ui-kit/surfaces/ResponsiveCollapsibleGrid.tsx |
| Notifiers | InlineStatus | src/components/ui-kit/notifiers/InlineStatus.tsx |
| Notifiers | NotificationItem | src/components/ui-kit/notifiers/NotificationItem.tsx |
| Notifiers | NotificationTray | src/components/ui-kit/notifiers/NotificationTray.tsx |
| Guidance | Explainer | src/components/ui-kit/explainer/Explainer.tsx |
| Data display | Table | src/components/ui-kit/data-display/Table.tsx |
| Data display | ItemList | src/components/ui-kit/data-display/ItemList.tsx |

## Shared Prop Contracts

Canonical UI kit contracts come from `src/components/ui-kit/foundation/props.ts`.

| Token | Values | Notes |
| --- | --- | --- |
| size | `sm | md |
| density | `compact | comfortable |
| variant | `default | filled |
| state | `default | loading |
| responsive | Partial `xs | sm |

## Styling Rule: AntD First, CSS Only When Needed

Style strategy priority is defined in `src/components/ui-kit/foundation/style.ts`:

1. `antd-token`
2. `antd-prop`
3. `css-fallback` (only for unsupported behavior)

Examples in this codebase:

- AntD tokens: `Card`, `Accordion`, and `Explainer` style borders/backgrounds using `theme.useToken()` values.
- AntD props: `size` maps through `toAntdSize` before passing into AntD components.
- CSS fallback (only where AntD does not expose enough control):
  - `src/components/ui-kit/data-display/data-display.css` for table row density paddings.
  - `src/components/ui-kit/notifiers/notifiers.css` and `src/components/ui-kit/explainer/explainer.css` for focus-visible and list-specific layout refinements.

## API Reference

All components support `className`, `style`, and `data-testid` unless noted.

### Card

Extends AntD `Card` (with UI kit typed variant contracts).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| header | ReactNode | - | Primary header slot. |
| subheader | ReactNode | - | Secondary header slot. |
| headerExtra | ReactNode | - | Right-side header actions (or stacked content on narrow screens). |
| footer | ReactNode | - | Footer slot rendered below body with separator (except ghost). |
| size | `sm | md | lg` |
| density | `compact | comfortable | spacious` |
| variant | `default | filled | outlined |
| state | shared state token | default | Controls interactive/disabled behavior. |
| responsive | UIResponsiveBehavior | - | Header stacking behavior by breakpoint. |
| role | AriaRole | region | Landmark role. |

### DashCard

Built on `Card` for KPI/stat surfaces.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | required | KPI label. |
| meta | ReactNode | - | Supplemental descriptor below title. |
| value | ReactNode | required | Primary KPI value. |
| trend | ReactNode | - | KPI trend/change descriptor. |
| icon | ReactNode | - | Trailing icon chip. |
| actions | ReactNode | - | Header action slot. |
| footer | ReactNode | - | Optional footer content. |
| size | `sm | md | lg` |
| density | `compact | comfortable | spacious` |
| responsive | UIResponsiveBehavior | { xs: "stack", md: "inline" } | Stack vs inline KPI presentation. |

### Panel

`Card` wrapper for titled sections with optional collapse behavior.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | required | Panel title. |
| subtitle | ReactNode | - | Secondary title text. |
| actions | ReactNode | - | Header action slot. |
| collapsible | boolean | false | Enables collapse button. |
| defaultCollapsed | boolean | false | Initial state for uncontrolled collapse. |
| collapsed | boolean | - | Controlled collapse state. |
| onCollapseChange | (collapsed: boolean) => void | - | Collapse callback. |
| size | `sm | md | lg` |
| density | `compact | comfortable | spacious` |
| responsive | UIResponsiveBehavior | { xs: "stack", md: "inline" } | Header/action layout behavior. |

### Accordion

Typed wrapper around AntD `Collapse`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | AccordionItem[] | required | key, title, content, optional subtitle, extra, disabled, forceRender. |
| expansionMode | `single | multiple` | single |
| activeKeys | string[] | - | Controlled expanded keys. |
| defaultActiveKeys | string[] | - | Uncontrolled initial expanded keys. |
| onActiveKeysChange | (keys: string[]) => void | - | Emits normalized key array. |
| size | `sm | md | lg` |
| density | `compact | comfortable | spacious` |
| variant | `default | filled | outlined |
| state | shared state token | default | Disabled/readonly/loading interaction handling. |

### ResponsiveCollapsibleGrid

Switches between desktop `Row/Col` and mobile `Accordion` while preserving section order.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| sections | ResponsiveCollapsibleGridSection[] | required | Ordered section list with content and optional mobileContent/desktopColProps. |
| collapseBelow | `xs | sm | md |
| mode | `auto | grid | collapse` |
| desktopGutter | RowProps["gutter"] | [16, 16] | Desktop grid spacing. |
| mobileExpansionMode | `single | multiple` | single |
| defaultMobileExpandedKeys | string[] | - | Uncontrolled mobile defaults. |
| mobileExpandedKeys | string[] | - | Controlled mobile keys. |
| onMobileExpandedKeysChange | (keys: string[]) => void | - | Mobile change callback. |
| mobileAriaLabel | string | "Collapsible content sections" | Mobile accordion accessible label. |

### InlineStatus

Single inline status/alert primitive.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| severity | `info | success | warning |
| title | ReactNode | required | Status headline. |
| body | ReactNode | - | Optional descriptive content. |
| icon | ReactNode | - | Custom icon slot. |
| timestamp | ReactNode | - | Timestamp/meta text under body. |
| action | ReactNode | - | Action slot in alert action area. |
| liveMode | `off | polite | assertive` |
| focusable | boolean | false | Adds keyboard focus target container. |

### NotificationItem

Composed notifier row built on `InlineStatus`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| id | string | required | Stable notification id. |
| severity | `info | success | warning |
| title | ReactNode | required | Notification title. |
| body | ReactNode | - | Message body. |
| action | ReactNode | - | Primary action slot. |
| dismissible | boolean | false | Shows dismiss control. |
| dismissLabel | ReactNode | "Dismiss" | Dismiss button label. |
| onDismiss | (id: string) => void | - | Dismiss callback. |
| itemRole | AriaRole | article | Outer item role. |
| statusRole | AriaRole | severity-based | Role passed into InlineStatus. |
| liveMode | `off | polite | assertive` |
| focusable | boolean | false | Keyboard navigation target. |
| onArrowNavigate | `(direction: "previous" | "next") => void` | - |

### NotificationTray

Aggregates `NotificationItem` entries in flat or grouped layouts.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| notifications | NotificationRecord[] | required | List of notifier records. |
| mode | `flat | grouped` | flat |
| title | ReactNode | - | Optional tray heading. |
| ariaLabel | string | "Notifications" | Region accessible name. |
| maxHeight | number | - | Enables internal scroll for long trays. |
| autoFocusFirst | boolean | false | Focuses first item on mount/update. |
| emptyState | ReactNode | - | Empty content override. |

### Explainer

Instructional guidance component (not for live operational alerts).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | required | Guidance title. |
| description | ReactNode | - | Supporting text. |
| icon | ReactNode | info icon | Leading icon in inline/panel modes. |
| action | ReactNode | - | Custom action slot. |
| actionLink | ExplainerActionLink | - | Link-based action helper. |
| variant | `inline | panel | empty-state` |
| mode | `persistent | dismissible` | persistent |
| size | `sm | md | lg` |
| density | `compact | comfortable | spacious` |
| visible | boolean | - | Controlled visibility. |
| defaultVisible | boolean | true | Uncontrolled initial visibility. |
| onVisibleChange | (visible: boolean) => void | - | Visibility callback. |
| onDismiss | () => void | - | Dismiss callback. |
| liveMode | `off | polite | assertive` |

### Table

AntD Table wrapper with shared framing, header, pagination defaults, and empty state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| header | TableHeaderConfig | - | Optional table title/subtitle/extra block. |
| loading | AntD table loading type | state === "loading" | Loading behavior override. |
| size | `sm | md | lg` |
| density | `compact | comfortable | spacious` |
| state | shared state token | default | Shared read-only/disabled visuals. |
| pagination | `false | TablePaginationConfig` | merged default |
| paginationMode | `default | compact` | default |
| emptyState | TableEmptyState | built-in text | Empty title/description/action/image slots. |
| tableClassName | string | - | Applied to inner AntD table node. |
| tableStyle | CSSProperties | - | Applied to inner AntD table node. |

### ItemList

Generic list primitive for simple rows, media rows, and navigation rows.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | ItemListItem[] | required | Row definitions (key, content, optional leading/trailing/href/onClick/disabled). |
| variant | `simple | media | navigation` |
| density | `compact | comfortable | spacious` |
| state | shared state token | default | Disabled/readonly/list state behavior. |
| bordered | boolean | true | Border + container shell toggle. |
| split | boolean | true | Inter-row divider toggle. |
| emptyState | ReactNode | built-in empty | Empty state content override. |
| onItemClick | (item, index) => void | - | Shared activation callback for clickable items. |

## Variant and Mode Matrix

| Component | Variant/Mode Props | Values | Default |
| --- | --- | --- | --- |
| Card | variant | default, filled, outlined, ghost | default |
| DashCard | responsive | inline, stack, collapse (breakpoint map) | { xs: "stack", md: "inline" } |
| Panel | variant (inherited), collapsible | Card variants; collapse enabled/disabled | default, false |
| Accordion | expansionMode, variant | `single | multiple`; Card variants |
| ResponsiveCollapsibleGrid | mode, mobileExpansionMode | `auto | grid |
| InlineStatus | severity | `info | success |
| NotificationItem | severity | `info | success |
| NotificationTray | mode | `flat | grouped` |
| Explainer | variant, mode | `inline | panel |
| Table | paginationMode | `default | compact` |
| ItemList | variant | `simple | media |

## Usage Patterns

### Surface Composition

```tsx
<Panel title="Workspace Overview" collapsible>
  <Accordion
    expansionMode="single"
    items={[{ key: "foundation", title: "Foundation", content: <p>...</p> }]}
  />

  <Card header="Quick Start" variant="filled">
    <Explainer
      variant="inline"
      title="Need orientation?"
      description="Use Explainer for instructional guidance."
    />
  </Card>
</Panel>
```

### Notification Composition

```tsx
<NotificationTray
  mode="grouped"
  notifications={[
    {
      id: "notif-1",
      groupKey: "now",
      groupLabel: "Now",
      severity: "warning",
      title: "Background maintenance scheduled",
      dismissible: true,
    },
  ]}
/>
```

### Data Display Composition

```tsx
<Table
  header={{ title: "Recent Activity", subtitle: "Shared table wrapper" }}
  columns={columns}
  dataSource={rows}
  rowKey="key"
  emptyState={{
    title: "No records available",
    action: (
      <Explainer
        variant="empty-state"
        mode="dismissible"
        title="Apply filters"
        description="Filtering reveals actionable records quickly."
      />
    ),
  }}
/>

<ItemList
  variant="navigation"
  items={[{ key: "sessions", content: "Open Sessions", onClick: openSessions }]}
/>
```

## Migration Guidance (Existing Pages)

This phase is incremental. Do not rewrite every legacy screen in one pass.

### Step 1: Replace Shell Surfaces

| Legacy pattern | UI kit target |
| --- | --- |
| Custom bordered container + custom heading | Card or Panel |
| Homegrown collapse section | Panel (collapsible) or Accordion |
| KPI tile with custom spacing logic | DashCard |

### Step 2: Normalize Responsive Grid Behavior

- Replace custom mobile card stacks with `ResponsiveCollapsibleGrid`.
- Keep the same section order in both desktop and mobile modes.
- Provide `mobileContent` when mobile needs compact summaries.

### Step 3: Normalize Guidance and Status Patterns

| Requirement | UI kit target |
| --- | --- |
| Persistent instructional copy | Explainer (persistent) |
| Dismissible instructional hint | Explainer (dismissible) |
| Inline operation/status feedback | InlineStatus |
| Multi-item notification feed | NotificationTray + NotificationItem |

### Step 4: Normalize Data Displays

- Wrap AntD tables with `Table` to standardize headers, empty states, and density.
- Use `ItemList` for mixed navigation/media/simple row blocks.
- Remove one-off row hover/focus CSS where `ItemList` interaction styles already cover it.

### Step 5: Feature-by-Feature Rollout

- Start with one representative page per feature area.
- Keep old and new components side-by-side behind feature-level toggles if needed.
- Measure regressions with existing test suites before broad expansion.

## Rollout Checklist

- [ ] Inventory page-level custom components that overlap with UI kit primitives.
- [ ] Replace surface shells with `Card`/`Panel` in one pilot page per feature.
- [ ] Convert one KPI block to `DashCard` + `ResponsiveCollapsibleGrid`.
- [ ] Convert one notifier area to `InlineStatus`/`NotificationTray`.
- [ ] Convert one data list/table area to `Table`/`ItemList`.
- [ ] Confirm all new usage imports from `@/components/ui-kit` only.
- [ ] Keep migration incremental (no bulk rewrite in this phase).

## Accessibility Checklist

- [ ] Interactive elements are reachable by keyboard Tab flow.
- [ ] Keyboard activation works for Enter/Space on interactive rows/toggles.
- [ ] Focus-visible outline is present and contrast-safe on custom interactive wrappers.
- [ ] `role`, `aria-label`, and `aria-live` are set appropriately for status/guidance content.
- [ ] Disabled/readonly states remove or constrain interaction predictably.

## Responsive Behavior Checklist

- [ ] Validate breakpoints at `xs`, `sm`, `md`, `lg`, and `xl` for each migrated page.
- [ ] Ensure `ResponsiveCollapsibleGrid` preserves content order between grid and collapse modes.
- [ ] Validate header/action stacking for `Card`, `DashCard`, and `Panel` under narrow widths.
- [ ] Validate `Table` density (`compact|comfortable|spacious`) for readability and touch targets.
- [ ] Validate notification and explainer layouts do not overflow on mobile widths.

## Verification Commands

```bash
npm run lint
npm run test
```