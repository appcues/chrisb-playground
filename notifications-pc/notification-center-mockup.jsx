import { useState, useRef, useEffect } from "react";
const { createPortal: _createPortal } = ReactDOM;

const CHANNEL_OPTIONS = [
  { id: "email", label: "Email", icon: "\uD83D\uDCE7" },
  { id: "slack", label: "Slack", icon: "\uD83D\uDCAC" },
];

const SLACK_CHANNELS = [
  "#appcues-alerts",
  "#product",
  "#customer-success",
  "#engineering",
  "#growth",
  "#design",
  "#general",
  "#onboarding-team",
];

const CADENCE_OPTIONS = [
  { id: "immediate", label: "Immediate" },
  { id: "daily", label: "Daily digest" },
  { id: "weekly", label: "Weekly digest" },
  { id: "monthly", label: "Monthly digest" },
];

const ALL_EVENTS = [
  { id: "campaign_drafted", label: "Campaign drafted" },
  { id: "campaign_published", label: "Campaign published" },
  { id: "campaign_unpublished", label: "Campaign unpublished" },
  { id: "tactic_drafted", label: "Tactic drafted" },
  { id: "tactic_published", label: "Tactic published" },
  { id: "insight_issue", label: "New AI Insight (Issue) detected" },
  { id: "insight_opportunity", label: "New AI Insight (Opportunity) detected" },
  { id: "team_new_member", label: "New team member joined" },
  { id: "team_role_changed", label: "Team member role changed" },
  { id: "team_published", label: "Teammate published changes" },
  { id: "nps_detractor", label: "NPS detractor response received" },
  { id: "nps_neutral_promoter", label: "NPS neutral-to-promoter response received" },
  { id: "survey_response", label: "Survey response received" },
  { id: "install_issue", label: "Installation health alert" },
  { id: "mau_limit", label: "Approaching MAU limit" },
  { id: "integration_disconnect", label: "Integration disconnected" },
  { id: "weekly_digest", label: "Weekly performance digest", cadenceLocked: true, defaultCadence: "weekly" },
];

/* ─── Icons ─── */
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 4h11M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4m1.5 0v9a1 1 0 01-1 1h-6a1 1 0 01-1-1V4h8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 7v4M9.5 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MuteIcon({ muted }) {
  if (muted) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2a4 4 0 014 4v2.5l1.3 1.3a.5.5 0 01-.35.85H3.05a.5.5 0 01-.35-.85L4 8.5V6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2a4 4 0 014 4v2.5l1.3 1.3a.5.5 0 01-.35.85H3.05a.5.5 0 01-.35-.85L4 8.5V6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Toggle switch ─── */
function ToggleSwitch({ checked, onChange, size = "normal" }) {
  const w = size === "small" ? 36 : 44;
  const h = size === "small" ? 20 : 24;
  const dot = size === "small" ? 16 : 18;
  const onX = size === "small" ? 18 : 22;
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        minWidth: w,
        height: h,
        borderRadius: h / 2,
        border: "none",
        cursor: "pointer",
        padding: 0,
        background: checked ? "#5c50d2" : "#d1d5db",
        transition: "background 200ms",
      }}
    >
      <span
        style={{
          display: "block",
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          transform: checked ? `translateX(${onX}px)` : "translateX(2px)",
          transition: "transform 200ms ease",
        }}
      />
    </button>
  );
}

/* ─── Tab bar ─── */
function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: "personal", label: "Personal Notifications" },
    { id: "account", label: "Account Notifications" },
  ];
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              color: isActive ? "#5c50d2" : "#6b7280",
              background: "none",
              border: "none",
              borderBottom: isActive ? "2px solid #5c50d2" : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Popover for configuring channels + cadence ─── */
function ConfigPopover({ item, onSave, onClose, anchorRef, tabType }) {
  const channelOptions = tabType === "personal"
    ? CHANNEL_OPTIONS.filter((c) => c.id === "email")
    : CHANNEL_OPTIONS;

  const [selectedChannels, setSelectedChannels] = useState([...item.channels]);
  const [selectedCadence, setSelectedCadence] = useState(item.cadence);
  const [slackChannels, setSlackChannels] = useState([...(item.slackChannels || [])]);
  const [emailAddress, setEmailAddress] = useState(item.emailAddress || "");
  const [startsOn, setStartsOn] = useState(item.startsOn || "");
  const [slackError, setSlackError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const popoverRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    function updatePos() {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const popH = popoverRef.current ? popoverRef.current.offsetHeight : 400;
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        if (spaceBelow < popH) {
          setPos({ top: rect.top - popH - 8 + window.scrollY, left: rect.right - 300 + window.scrollX });
        } else {
          setPos({ top: rect.bottom + 8 + window.scrollY, left: rect.right - 300 + window.scrollX });
        }
      }
    }
    // Delay first position calc to allow popover to render and measure
    requestAnimationFrame(updatePos);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [anchorRef]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  const toggleChannel = (chId) => {
    setSelectedChannels((prev) => {
      const next = prev.includes(chId) ? prev.filter((c) => c !== chId) : [...prev, chId];
      if (chId === "slack" && !next.includes("slack")) {
        setSlackChannels([]);
        setSlackError(false);
      }
      if (chId === "email" && !next.includes("email")) {
        setEmailAddress("");
        setEmailError(false);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (tabType === "account" && selectedChannels.includes("slack") && slackChannels.length === 0) {
      setSlackError(true);
      return;
    }
    if (tabType === "account" && selectedChannels.includes("email") && !emailAddress.trim()) {
      setEmailError(true);
      return;
    }
    onSave({
      channels: selectedChannels,
      cadence: selectedCadence,
      slackChannels: tabType === "account" ? slackChannels : [],
      emailAddress: tabType === "account" ? emailAddress.trim() : "",
      startsOn: (selectedCadence === "weekly" || selectedCadence === "monthly") ? startsOn : "",
    });
  };

  const showStartsOn = selectedCadence === "weekly" || selectedCadence === "monthly";

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        visibility: pos ? "visible" : "hidden",
        width: 300,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        zIndex: 9999,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Channels section -- hidden on Personal tab (email only) */}
      <div style={{ padding: "16px 16px 12px" }}>
        {tabType === "account" && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
              Channels
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {channelOptions.map((ch) => {
                const isSelected = selectedChannels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
                      border: isSelected ? "1.5px solid #5c50d2" : "1.5px solid #e5e7eb",
                      background: isSelected ? "#f5f3ff" : "#fff",
                      cursor: "pointer",
                      transition: "all 150ms",
                    }}
                  >
                    <span style={{ fontSize: 15, width: 22, textAlign: "center" }}>{ch.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? "#5c50d2" : "#374151", flex: 1, textAlign: "left" }}>
                      {ch.label}
                    </span>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5L6.5 12L13 4" stroke="#5c50d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Email address input -- Account tab only */}
        {tabType === "account" && selectedChannels.includes("email") && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              Email address
              <span style={{ color: "#ef4444", fontSize: 13, lineHeight: 1 }}>*</span>
            </div>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => { setEmailAddress(e.target.value); if (e.target.value.trim()) setEmailError(false); }}
              placeholder="anyemail@example.com"
              style={{
                width: "100%", padding: "6px 10px", fontSize: 13,
                border: emailError ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                borderRadius: 6, background: "#fff",
                color: emailAddress ? "#374151" : "#9ca3af",
                outline: "none",
              }}
            />
            {emailError && (
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
                Please enter an email address
              </div>
            )}
          </div>
        )}

        {/* Slack channel picker -- Account tab only */}
        {tabType === "account" && selectedChannels.includes("slack") && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              Slack channel
              <span style={{ color: "#ef4444", fontSize: 13, lineHeight: 1 }}>*</span>
            </div>
            <select
              value={slackChannels[0] || ""}
              onChange={(e) => {
                setSlackChannels(e.target.value ? [e.target.value] : []);
                if (e.target.value) setSlackError(false);
              }}
              style={{
                width: "100%", padding: "6px 10px", fontSize: 13,
                border: slackError ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                borderRadius: 6, background: "#fff",
                color: slackChannels[0] ? "#374151" : "#9ca3af",
                outline: "none", cursor: "pointer",
              }}
            >
              <option value="">Select a channel...</option>
              {SLACK_CHANNELS.map((ch) => (
                <option key={ch} value={ch} style={{ color: "#374151" }}>{ch}</option>
              ))}
            </select>
            {slackError && (
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
                Please select a Slack channel
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#f3f4f6" }} />

      {/* Cadence section */}
      <div style={{ padding: "12px 16px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          Delivery
        </div>
        {item.cadenceLocked ? (
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "#f9fafb", border: "1.5px solid #e5e7eb", fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
            {CADENCE_OPTIONS.find((c) => c.id === item.cadence)?.label}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3 4h4v2.5a2 2 0 01-4 0V4z" stroke="#9ca3af" strokeWidth="1.2" fill="none" />
              <rect x="2" y="3" width="6" height="3" rx="1" stroke="#9ca3af" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {CADENCE_OPTIONS.map((c) => {
              const isSelected = selectedCadence === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCadence(c.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderRadius: 8,
                    border: isSelected ? "1.5px solid #5c50d2" : "1.5px solid transparent",
                    background: isSelected ? "#f5f3ff" : "transparent",
                    cursor: "pointer", transition: "all 150ms",
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 8, border: isSelected ? "5px solid #5c50d2" : "2px solid #d1d5db", boxSizing: "border-box", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? "#5c50d2" : "#374151", textAlign: "left" }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {showStartsOn && !item.cadenceLocked && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Starts on
            </div>
            <input
              type="date"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              style={{
                width: "100%", padding: "6px 10px", fontSize: 13,
                border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff",
                color: startsOn ? "#374151" : "#9ca3af", outline: "none", cursor: "pointer",
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onClose} style={{ padding: "6px 16px", fontSize: 13, fontWeight: 500, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleSave} style={{ padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "#fff", background: "#5c50d2", border: "none", borderRadius: 6, cursor: "pointer" }}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ─── Summary pills shown on each row ─── */
function ConfigSummary({ channels, cadence, muted, tabType, slackChannels, emailAddress }) {
  if (tabType === "personal" && muted) {
    return (
      <span style={{ fontSize: 12, color: "#b45309", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
        Muted
      </span>
    );
  }

  if (channels.length === 0) {
    return (
      <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Off</span>
    );
  }

  const cadenceLabel = cadence === "immediate" ? "Immediate" : cadence === "daily" ? "Daily" : cadence === "weekly" ? "Weekly" : "Monthly";
  const cadenceColors = {
    immediate: { text: "#059669", bg: "#ecfdf5", border: "#d1fae5" },
    daily: { text: "#5c50d2", bg: "#eef2ff", border: "#e0e7ff" },
    weekly: { text: "#b45309", bg: "#fffbeb", border: "#fef3c7" },
    monthly: { text: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
  };
  const cc = cadenceColors[cadence] || cadenceColors.daily;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", fontSize: 12, fontWeight: 600, color: cc.text, background: cc.bg, border: "1px solid " + cc.border, borderRadius: 5 }}>
        {cadenceLabel}
      </span>
      {channels.map((chId) => {
        const ch = CHANNEL_OPTIONS.find((c) => c.id === chId);
        const detail = chId === "email" && tabType === "account" && emailAddress
          ? emailAddress
          : chId === "slack" && slackChannels && slackChannels[0]
            ? slackChannels[0]
            : null;
        return (
          <span
            key={chId}
            style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "2px 8px", fontSize: 12, fontWeight: 500,
              color: "#374151", background: "#f3f4f6", borderRadius: 5,
            }}
          >
            <span style={{ fontSize: 11 }}>{ch?.icon}</span>
            {ch?.label}
            {detail && <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}>{" "}{detail}</span>}
          </span>
        );
      })}
    </div>
  );
}

/* ─── Individual notification row ─── */
function NotificationRow({
  event,
  config,
  isLast,
  isPopoverOpen,
  onTogglePopover,
  onClosePopover,
  onSave,
  onRemove,
  onToggleMute,
  tabType,
  muteAll,
}) {
  const menuRef = useRef(null);
  const item = { ...event, ...config };
  const isMuted = tabType === "personal" && (config.muted || muteAll);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 20px",
        gap: 12,
        borderBottom: isLast ? "none" : "1px solid #f3f4f6",
        transition: "background 150ms",
        position: "relative",
        opacity: 1,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Event name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {event.label}
        </div>
      </div>

      {/* Config summary */}
      <div style={{ flexShrink: 0 }}>
        <ConfigSummary
          channels={config.channels}
          cadence={config.cadence}
          muted={isMuted}
          tabType={tabType}
          slackChannels={config.slackChannels}
          emailAddress={config.emailAddress}
        />
      </div>

      {/* ⋯ menu button */}
      <div style={{ position: "relative", flexShrink: 0 }} ref={menuRef}>
        <button
          onClick={onTogglePopover}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 6,
            border: isPopoverOpen ? "1px solid #5c50d2" : "1px solid #e5e7eb",
            background: isPopoverOpen ? "#f5f3ff" : "#fff",
            cursor: "pointer",
            transition: "all 150ms",
            color: isPopoverOpen ? "#5c50d2" : "#6b7280",
            fontSize: 18, fontWeight: 700, letterSpacing: 2, lineHeight: 1, paddingBottom: 4,
          }}
        >
          &middot;&middot;&middot;
        </button>
        {isPopoverOpen && _createPortal(
          <ConfigPopover item={item} anchorRef={menuRef} onClose={onClosePopover} onSave={onSave} tabType={tabType} />,
          document.body
        )}
      </div>

      {/* Mute button -- Personal tab only */}
      {tabType === "personal" && (
        <button
          onClick={onToggleMute}
          title={config.muted ? "Unmute" : "Mute"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 6,
            border: config.muted ? "1px solid #fef3c7" : "1px solid #e5e7eb",
            background: config.muted ? "#fffbeb" : "#fff",
            cursor: "pointer",
            transition: "all 150ms",
            color: config.muted ? "#b45309" : "#9ca3af",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!config.muted) {
              e.currentTarget.style.color = "#b45309";
              e.currentTarget.style.borderColor = "#fef3c7";
              e.currentTarget.style.background = "#fffbeb";
            }
          }}
          onMouseLeave={(e) => {
            if (!config.muted) {
              e.currentTarget.style.color = "#9ca3af";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.background = "#fff";
            }
          }}
        >
          <MuteIcon muted={config.muted} />
        </button>
      )}

      {/* Trash button */}
      <button
        onClick={onRemove}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: 6,
          border: "1px solid #e5e7eb", background: "#fff",
          cursor: "pointer", transition: "all 150ms",
          color: "#9ca3af", flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.background = "#fef2f2"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fff"; }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

/* ─── Tab content ─── */
function TabContent({ tabType }) {
  const [eventConfigs, setEventConfigs] = useState(() => {
    const configs = {};
    ALL_EVENTS.forEach((e) => {
      configs[e.id] = {
        channels: ["email"],
        cadence: e.defaultCadence || "immediate",
        cadenceLocked: e.cadenceLocked || false,
        slackChannels: [],
        emailAddress: "",
        startsOn: "",
        muted: false,
      };
    });
    return configs;
  });

  const [addedIds, setAddedIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [saved, setSaved] = useState(false);
  const [openPopover, setOpenPopover] = useState(null);
  const [muteAll, setMuteAll] = useState(false);

  const updateNotification = (id, updates) => {
    setEventConfigs((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    setSaved(false);
    setOpenPopover(null);
  };

  const toggleMute = (id) => {
    setEventConfigs((prev) => ({ ...prev, [id]: { ...prev[id], muted: !prev[id].muted } }));
    setSaved(false);
  };

  const addEvent = () => {
    if (!selectedEvent) return;
    setAddedIds((prev) => [...prev, selectedEvent]);
    setEventConfigs((prev) => ({
      ...prev,
      [selectedEvent]: { ...prev[selectedEvent], channels: ["email"], cadence: "immediate", slackChannels: [], emailAddress: tabType === "account" ? "anyemail@example.com" : "", startsOn: "", muted: false },
    }));
    setSelectedEvent("");
    setSaved(false);
  };

  const removeEvent = (id) => {
    setAddedIds((prev) => prev.filter((eid) => eid !== id));
    const original = ALL_EVENTS.find((e) => e.id === id);
    setEventConfigs((prev) => ({
      ...prev,
      [id]: { channels: ["email"], cadence: original?.defaultCadence || "immediate", cadenceLocked: original?.cadenceLocked || false, slackChannels: [], emailAddress: "", startsOn: "", muted: false },
    }));
    setSaved(false);
    setOpenPopover(null);
  };

  const availableEvents = ALL_EVENTS.filter((e) => !addedIds.includes(e.id));
  const addedEvents = addedIds.map((id) => ALL_EVENTS.find((e) => e.id === id)).filter(Boolean);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const showMuteAll = tabType === "personal" && addedEvents.length > 0;

  return (
    <div>
      {/* Admin-only notice for Account tab */}
      {tabType === "account" && (
        <div style={{ padding: "10px 16px", marginBottom: 16, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
            These settings are editable only by Admins.
          </span>
        </div>
      )}

      {/* Mute all toggle -- Personal tab only, shown when events exist */}
      {showMuteAll && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            marginBottom: 20,
            padding: "10px 16px",
          }}
        >
          <ToggleSwitch checked={muteAll} onChange={setMuteAll} size="small" />
          <span style={{ fontSize: 13, fontWeight: 600, color: muteAll ? "#b45309" : "#374151" }}>
            Mute all notifications
          </span>
        </div>
      )}

      {/* Notify me when -- dropdown + Add button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
          {tabType === "account" ? "Send notification when" : "Notify me when"}
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{
            flex: 1, padding: "8px 12px", fontSize: 14,
            border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff",
            color: selectedEvent ? "#111827" : "#9ca3af",
            outline: "none", cursor: "pointer", appearance: "auto",
          }}
        >
          <option value="">Select an event...</option>
          {availableEvents.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
        <button
          onClick={addEvent}
          disabled={!selectedEvent}
          style={{
            padding: "8px 20px", fontSize: 14, fontWeight: 600,
            color: selectedEvent ? "#fff" : "#9ca3af",
            background: selectedEvent ? "#5c50d2" : "#f3f4f6",
            border: selectedEvent ? "none" : "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: selectedEvent ? "pointer" : "not-allowed",
            transition: "all 150ms", whiteSpace: "nowrap",
          }}
        >
          Add
        </button>
      </div>

      {/* Added notification rows */}
      {addedEvents.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            position: "relative",
          }}
        >
          <div style={{ maxHeight: 305, overflowY: "auto" }}>
            {addedEvents.map((event, idx) => (
              <NotificationRow
                key={event.id}
                event={event}
                config={eventConfigs[event.id]}
                isLast={idx === addedEvents.length - 1}
                isPopoverOpen={openPopover === event.id}
                onTogglePopover={() => setOpenPopover(openPopover === event.id ? null : event.id)}
                onClosePopover={() => setOpenPopover(null)}
                onSave={(updates) => updateNotification(event.id, updates)}
                onRemove={() => removeEvent(event.id)}
                onToggleMute={() => toggleMute(event.id)}
                tabType={tabType}
                muteAll={muteAll}
              />
            ))}
          </div>
        </div>
      )}

      {addedEvents.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "40px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
          No notifications added yet. Use the dropdown above to add events.
        </div>
      )}

      {/* Save bar */}
      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
        {saved && (
          <span style={{ fontSize: 14, color: "#059669", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5L6.5 12L13 4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Preferences saved
          </span>
        )}
        <button
          onClick={handleSave}
          style={{ padding: "10px 28px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#5c50d2", border: "none", borderRadius: 8, cursor: "pointer", transition: "background 150ms" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4a3fc0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#5c50d2")}
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#f8f9fb",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
              <rect width="28" height="28" rx="6" fill="#5c50d2" />
              <path d="M8 10.5a1.5 1.5 0 013 0v7a1.5 1.5 0 01-3 0v-7zm4.5-2a1.5 1.5 0 013 0v11a1.5 1.5 0 01-3 0v-11zm4.5 4a1.5 1.5 0 013 0v5a1.5 1.5 0 01-3 0v-5z" fill="#fff" />
            </svg>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Notification Preferences</h1>
          </div>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0, lineHeight: 1.5 }}>
            Choose what to get notified about, pick your channels, and set the delivery cadence.
          </p>
        </div>

        {/* Tabs */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        {activeTab === "account" && <TabContent tabType="account" />}
        {activeTab === "personal" && <TabContent tabType="personal" />}

      </div>
    </div>
  );
}
