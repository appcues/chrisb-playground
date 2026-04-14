# Notification Preferences Center -- Product Spec

## Overview

An interactive UI for managing notification preferences, split into two tabs:

- **Personal Notifications** -- User-level preferences for email-only notifications. Users can mute individual events or all events at once.
- **Account Notifications** -- Admin-managed, account-wide settings supporting Email and Slack channels with configurable addresses and Slack channel targets.

Both tabs share the same event catalog (17 events). Each tab maintains independent state. This is a standalone React mockup rendered client-side via Babel -- all state is local.

**Live URL**: `https://chrisb-playground.vercel.app/notifications`

---

## Feature Summary

1. **Two-Tab Architecture** -- Personal Notifications (default, first tab) and Account Notifications.
2. **Add/Remove Events** -- Select events from a dropdown and add them as notification rows. Remove with a trash icon.
3. **Per-Event Config Popover** -- Configure delivery cadence via `...` button on each row.
4. **Cadence Selection** -- Immediate, Daily, Weekly, or Monthly delivery per event.
5. **Starts-On Date Picker** -- Shown when Weekly or Monthly cadence is selected.
6. **Cadence Locking** -- Some events (e.g. Weekly performance digest) have a fixed cadence.
7. **Scrollable List** -- Notification rows scroll after 5 items to keep the UI compact.

### Personal Notifications Tab Only
8. **Mute All Toggle** -- Mutes every event row (same visual as per-row mute). Controls remain interactive.
9. **Per-Row Mute** -- Mute individual events with a bell icon. Shows "Muted" badge.
10. **Email-only channel** -- No channel selection in popover (only Delivery options shown).

### Account Notifications Tab Only
11. **Email + Slack Channels** -- Channel selection in popover with Email and Slack toggle buttons.
12. **Email Address Input** -- Required field (default: `anyemail@example.com`). Shown in row badge on Add.
13. **Slack Channel Picker** -- Required dropdown when Slack is enabled. Channel name shown on row badge.
14. **Admin-Only Notice** -- Banner: "These settings are editable only by Admins."
15. **No mute controls** -- No mute toggle or per-row mute buttons.

---

## UI Components

### NotificationCenter (main shell)
- Page header: "Notification Preferences" with subtitle "Configure notification preferences and delivery cadence."
- TabBar with Personal Notifications (default) and Account Notifications
- Renders TabContent for the active tab

### TabBar
- Two tabs: Personal Notifications, Account Notifications
- Active tab has purple underline and text

### TabContent
- Manages all per-tab state independently (eventConfigs, addedIds, muteAll, etc.)
- Renders tab-specific controls based on `tabType` prop ("personal" or "account")
- Account tab: "Send notification when" label, admin notice
- Personal tab: "Notify me when" label, mute all toggle (when events exist)

### ConfigPopover
- Rendered via React portal to `document.body` to avoid scroll clipping
- Positioned right-aligned to anchor button, prefers below, flips above, clamped to viewport
- Scrollable if taller than viewport (`maxHeight: 100vh - 16px`)
- Repositions on scroll/resize
- **Account tab**: Channels section (Email/Slack toggles), email address input, Slack channel picker, Delivery section
- **Personal tab**: Delivery section only (no Channels -- email is the only option)
- Cancel / OK footer buttons with validation

### ConfigSummary (row badges)
- Cadence badge with color coding:
  - Immediate: green
  - Daily: purple
  - Weekly: amber
  - Monthly: gray
- Channel badges showing icon + label
- Account tab: Email badge includes address (e.g. "Email anyemail@example.com")
- Account tab: Slack badge includes channel name (e.g. "Slack #product")
- Personal tab when muted: shows "Muted" text in amber instead of badges

### NotificationRow
- Event label (normal weight, not affected by mute state)
- ConfigSummary badges
- Action buttons:
  - `...` menu: opens ConfigPopover
  - Bell icon (Personal tab only): toggles per-row mute (amber when active)
  - Trash icon: removes the event row (red on hover)

### ToggleSwitch
- Reusable toggle component with "small" and "normal" sizes
- Purple when on, gray when off, smooth CSS transition

---

## Data Model

### Event Definition (ALL_EVENTS -- shared across both tabs)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique event identifier |
| `label` | string | Display name |
| `cadenceLocked` | boolean (optional) | If true, cadence cannot be changed |
| `defaultCadence` | string (optional) | Default cadence when cadence is locked |

### Event Config (eventConfigs[id])

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `channels` | string[] | `["email"]` | Active channels for this event |
| `cadence` | string | `"immediate"` | Delivery cadence |
| `cadenceLocked` | boolean | `false` | Whether cadence is fixed |
| `slackChannels` | string[] | `[]` | Selected Slack channel(s) (Account tab) |
| `emailAddress` | string | `""` or `"anyemail@example.com"` | Email address (Account tab; pre-filled on Add) |
| `startsOn` | string | `""` | ISO date for digest start |
| `muted` | boolean | `false` | Per-event mute state (Personal tab) |

### Per-Tab State

| State | Type | Description |
|-------|------|-------------|
| `addedIds` | string[] | Event IDs the user has added (starts empty) |
| `selectedEvent` | string | Currently selected event in dropdown |
| `muteAll` | boolean | Global mute toggle (Personal tab only) |
| `openPopover` | string or null | ID of event with open config popover |
| `saved` | boolean | Flash state for save confirmation |

---

## Event Catalog (17 events)

### Campaigns
- Campaign drafted
- Campaign published
- Campaign unpublished

### Tactics
- Tactic drafted
- Tactic published

### AI Insights
- New AI Insight (Issue) detected
- New AI Insight (Opportunity) detected

### Team Activity
- New team member joined
- Team member role changed
- Teammate published changes

### Feedback
- NPS detractor response received
- NPS neutral-to-promoter response received
- Survey response received

### System
- Installation health alert
- Approaching MAU limit
- Integration disconnected

### Digests
- Weekly performance digest (cadence locked to Weekly)

---

## Interaction Behaviors

### Adding an Event
1. User selects an event from the dropdown
2. Add button enables (turns purple)
3. Clicking Add creates a row with defaults: Email channel, Immediate cadence
4. Account tab: row immediately shows default email address `anyemail@example.com`
5. Dropdown resets, event removed from options

### Removing an Event
1. Click trash icon on a row
2. Row removed, config resets to defaults
3. Event reappears in the dropdown

### Configuring an Event
1. Click `...` button to open the config popover
2. Account tab: toggle channels, enter email address, pick Slack channel, select cadence
3. Personal tab: select cadence only (email is the only channel)
4. Click OK to save (validates required fields on Account tab)
5. Click Cancel or click outside to discard

### Muting a Single Event (Personal tab only)
1. Click bell icon on a row
2. "Muted" badge replaces channel/cadence badges
3. Bell icon shows slash-through variant with amber styling
4. Row text and controls remain at full opacity
5. Click again to unmute

### Mute All (Personal tab only)
1. Toggle the "Mute all notifications" switch
2. All rows show muted state (same as clicking each bell icon)
3. Dropdown, Add button, and all controls remain fully interactive
4. Toggle off to restore

---

## Visual States Summary

| State | Name Style | Badges | Bell Icon | Controls |
|-------|------------|--------|-----------|----------|
| Normal | Bold black | Cadence + Channel pills | Gray outline bell | Fully interactive |
| Muted (per-row) | Bold black (unchanged) | "Muted" amber text | Amber bell with slash | Fully interactive |
| Muted All | Bold black (unchanged) | "Muted" amber text on all | Amber bell with slash | Fully interactive |

---

## Technical Notes

- **Runtime**: React 18 + ReactDOM UMD via CDN, Babel standalone for in-browser JSX transpilation
- **No build step**: `index.html` fetches and transpiles `notification-center-mockup.js` at runtime
- **Dynamic base path**: Fetch URL uses `window.location.pathname` to resolve correctly on both local dev and Vercel
- **Portals**: ConfigPopover renders via `ReactDOM.createPortal` to `document.body` with explicit `fontFamily` (portal doesn't inherit from parent tree)
- **Popover positioning**: Computed from anchor's `getBoundingClientRect()`, right-aligned to button, prefers below/flips above, clamped to viewport bounds, scrollable if content exceeds viewport height
- **Cache busting**: JS fetch URL includes `?v=` + timestamp to prevent stale browser cache
- **Styling**: All inline styles, no CSS files. System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Hosted at**: Vercel at `/notifications` path (auto-deploys from `main` branch of `appcues/chrisb-playground`, root directory `notifications-pc`)
