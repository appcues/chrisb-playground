# Notification Preferences Center -- Product Spec

## Overview

An interactive UI for managing user-level notification preferences. Users select which events they want to be notified about, configure delivery channels (Email, Slack) and cadence (Immediate, Daily, Weekly, Monthly) per event, and can mute notifications at the global, channel, or individual event level.

This is a standalone React JSX mockup rendered client-side via Babel. It is not connected to a backend -- all state is local.

---

## Feature Summary

1. **Add/Remove Events** -- Select events from a dropdown and add them as notification rows. Remove with a trash icon.
2. **Per-Event Channel Config** -- Choose Email, Slack, or both per event via a config popover.
3. **Slack Channel Picker** -- Required dropdown when Slack is enabled. Channel name shown on the row badge.
4. **Cadence Selection** -- Immediate, Daily, Weekly, or Monthly delivery per event.
5. **Starts-On Date Picker** -- Shown when Weekly or Monthly cadence is selected to set the digest start date.
6. **Cadence Locking** -- Some events (e.g. Weekly performance digest) have a fixed cadence that cannot be changed.
7. **Mute All Toggle** -- Global switch that dims and disables all notification controls.
8. **Mute Channel** -- Globally mute Email or Slack. Muted channels show a mute icon on row badges but remain configurable.
9. **Per-Row Mute** -- Mute individual events with a bell icon. Muted rows show strikethrough text and "Muted" badge.
10. **Scrollable List** -- Notification rows scroll after 5 items to keep the UI compact.

---

## UI Components

### NotificationCenter (main)
- Page header with title and description
- Mute controls bar (right-aligned, only visible when 1+ events added)
- "Notify me when" dropdown + Add button
- Scrollable notification row list (max ~5 rows visible)
- Save preferences button
- Footer text

### MuteChannelDropdown
- Custom dropdown button with chevron
- Checkbox items for each channel (Email, Slack)
- Amber styling when any channel is muted
- Click-outside-to-close behavior

### ConfigPopover
- Rendered via React portal to `document.body` to avoid scroll container clipping
- Auto-positions: opens downward if space allows, flips upward near viewport bottom
- Repositions on scroll/resize
- **Channels section**: Toggle buttons for Email and Slack, with muted indicator when globally muted (still clickable)
- **Slack channel picker**: Required `<select>` with red asterisk; validation error shown if empty on save
- **Delivery section**: Radio buttons for cadence options; locked display for cadence-locked events
- **Starts-on date picker**: HTML date input shown for Weekly/Monthly cadence
- Cancel / OK footer buttons

### ConfigSummary (row badges)
- Cadence badge with color coding:
  - Immediate: green
  - Daily: purple
  - Weekly: amber
  - Monthly: gray
- Channel badges showing icon + label
- Slack badge includes channel name (e.g. "Slack #product")
- Muted channel badge: amber background with small mute icon
- Muted event: shows "Muted" text in amber instead of badges

### NotificationRow
- Event label (strikethrough + gray when muted, dimmed opacity)
- ConfigSummary badges
- Three action buttons:
  - `...` menu: opens ConfigPopover
  - Bell icon: toggles per-row mute (amber when active, slash-through icon)
  - Trash icon: removes the event row (red on hover)

### ToggleSwitch
- Reusable toggle component with "small" and "normal" sizes
- Purple when on, gray when off, smooth CSS transition

---

## Data Model

### Event Definition (ALL_EVENTS)

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
| `slackChannels` | string[] | `[]` | Selected Slack channel(s) |
| `startsOn` | string | `""` | ISO date for digest start |
| `muted` | boolean | `false` | Per-event mute state |

### Global State

| State | Type | Description |
|-------|------|-------------|
| `addedIds` | string[] | Event IDs the user has added (starts empty) |
| `selectedEvent` | string | Currently selected event in dropdown |
| `muteAll` | boolean | Global mute toggle |
| `globalChannels` | `{email: bool, slack: bool}` | Channel-level mute state |
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
1. User selects an event from the "Notify me when" dropdown
2. Add button enables (turns purple)
3. Clicking Add creates a row with defaults: Email channel, Immediate cadence
4. Dropdown resets to empty, Add button disables
5. Event is removed from dropdown options

### Removing an Event
1. Click trash icon on a row
2. Row is removed, event config resets to defaults
3. Event reappears in the dropdown

### Configuring an Event
1. Click `...` button on a row to open the config popover
2. Toggle channels, pick Slack channel, select cadence, set starts-on date
3. Click OK to save (validates Slack channel is selected if Slack enabled)
4. Click Cancel or click outside to discard changes

### Muting a Single Event
1. Click bell icon on a row
2. Row dims (55% opacity), name gets strikethrough
3. Badges replaced with amber "Muted" text
4. Bell icon shows slash-through variant with amber styling
5. Click again to unmute

### Mute All
1. Toggle the "Mute all notifications" switch
2. All rows dim to 50% opacity
3. Dropdown and Add button become non-interactive
4. Per-event `...` buttons are disabled
5. Toggle off to restore

### Mute Channel
1. Click "Mute Channel" dropdown
2. Check/uncheck Email or Slack
3. Muted channels show mute icon on row badges (amber styling)
4. Channel selection in popover remains fully functional -- only the badge indicator changes
5. Mute Channel button turns amber when any channel is muted

---

## Visual States Summary

| State | Row Opacity | Name Style | Badges | Bell Icon |
|-------|------------|------------|--------|-----------|
| Normal | 100% | Bold black | Cadence + Channel pills | Gray outline bell |
| Muted (per-row) | 55% | Strikethrough gray | "Muted" amber text | Amber bell with slash |
| Muted All | 50% (container) | Unchanged | Unchanged | Unchanged (disabled) |
| Channel Muted | 100% | Unchanged | Mute icon + amber bg on affected channel | Unchanged |

---

## Technical Notes

- **Runtime**: React 18 + ReactDOM UMD via CDN, Babel standalone for in-browser JSX transpilation
- **No build step**: `index.html` fetches and transpiles `notification-center-mockup.jsx` at runtime
- **Portals**: ConfigPopover renders via `ReactDOM.createPortal` to `document.body` to escape scroll container overflow clipping
- **Popover positioning**: Computed from anchor button's `getBoundingClientRect()`, updates on scroll/resize, flips upward when insufficient space below
- **Cache busting**: JSX fetch URL includes `?v=` + timestamp to prevent stale browser cache
- **Styling**: All inline styles, no CSS files. Color palette uses Tailwind-inspired tokens.
- **Hosted at**: Vercel (auto-deploys from `main` branch of `appcues/chrisb-playground`, root directory `notifications-pc`)
