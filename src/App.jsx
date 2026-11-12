import { useState, useEffect, useRef, Fragment } from "react";
import "./App.css";
import habeshaLogoHorizontal from "./assets/habesha-logo-horizontal.png";
import habeshaWordmark from "./assets/habesha-wordmark.png";
import { fieldClient, adminClient } from "./lib/supabase";
import { createApi, readError, ADMIN_ROLES } from "./lib/api";

const fieldApi = createApi(fieldClient);
const adminApi = createApi(adminClient);
//import { downloadBrandedActivityPdf } from "./activityPdf";

function Icon({ name, size = 22, strokeWidth = 1.7 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    home: (
      <>
        <path d="M3.5 10.5 12 3.5l8.5 7" />
        <path d="M5.5 9.5v10h13v-10" />
        <path d="M9 19.5v-6h6v6" />
      </>
    ),
    activations: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    results: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M7 16v-3M12 16V8M17 16v-5" />
      </>
    ),
    statistics: (
      <>
        <path d="M3 3v18h18" />
        <path d="m6 15 5-5 4 3 5-7" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7.5" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    activity: (
      <>
        <path d="M12 3 20 11 12 19 4 11 12 3Z" />
        <path d="m12 8 3 3-3 3-3-3 3-3Z" />
      </>
    ),
    pie: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 0 0 18Z" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    back: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),
    edit: (
      <>
        <path d="m15 5 4 4" />
        <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
  };

  return <svg {...common}>{icons[name] || icons.home}</svg>;
}

const activityTypes = [
  "Events/Activations",
  "Sponsorship",
  "Trade/POS",
  "Digital/Social",
  "Draught activation",
  "Sampling",
  "Media/ATL",
  "Partnership",
  "Other",
];

const modules = [
  {
    id: "activities",
    title: "Manage activities",
    description: null, // filled with live counts in ModulesSection
    icon: "activity",
    notification: false,
  },
  {
    id: "results",
    title: "Manage Results",
    description: <>View and manage results from<br />all your activations.</>,
    icon: "pie",
  },
  {
    id: "statistics",
    title: "Statistics",
    description: <>View general reports and<br />statistics for all activations</>,
    icon: "target",
  },
];

const navigation = [
  { id: "home", label: "Home", icon: "home" },
  { id: "activations", label: "Activations", icon: "activations" },
  { id: "results", label: "Results", icon: "results" },
  { id: "statistics", label: "Statistics", icon: "statistics" },
  { id: "myspace", label: "My space", icon: "user" },
];

function Header({ user, onSignOut }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="welcome-header">
      <div className="welcome-identity">
        <div className="notification-wrapper profile-wrapper">
          <button type="button" className="avatar avatar-button" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => { setProfileOpen(open => !open); setNotificationsOpen(false); }}>{user?.initials || "?"}</button>
          {profileOpen && (
            <div className="notification-popover profile-popover">
              <strong>{user?.name}</strong>
              <p>{user?.role}{user?.employeeId ? ` · ${user.employeeId}` : ""}</p>
              {user?.brands?.length > 0 && <p>{user.brands.join(", ")}</p>}
              <button type="button" className="profile-signout" onClick={onSignOut}>Sign out</button>
            </div>
          )}
        </div>

        <div className="welcome-text">
          <h1>Welcome, {user?.shortName || user?.name}</h1>
          <p>{today}</p>
        </div>
      </div>

      <div className="notification-wrapper">
        <button
          className="notification-button"
          aria-label="Toggle notifications"
          aria-expanded={notificationsOpen}
          onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }}
        >
          <Icon name="bell" size={19} />
        </button>

        {notificationsOpen && (
          <div className="notification-popover">
            <strong>Notifications</strong>
            <p>No new notifications.</p>
          </div>
        )}
      </div>
    </header>
  );
}

function AttentionCard({ user }) {
  return (
    <section className="attention-card">
      <span className="attention-eyebrow">NEEDS YOUR ATTENTION</span>
      <h2>No late result submission</h2>
      <p>
        Good job {firstName(user)}, you don&apos;t have any activation result submission
        that is pending.
      </p>
    </section>
  );
}

function ModuleCard({ module, onOpen }) {
  return (
    <button
      className="module-card"
      type="button"
      onClick={() => onOpen(module.id)}
    >
      {module.notification && (
        <span className="module-notification-dot" />
      )}

      <span className={`module-icon module-icon-${module.id}`}>
        <Icon name={module.icon} size={17} />
      </span>

      <span className="module-title">{module.title}</span>
      <span className="module-description">{module.description}</span>

      <span className="module-open">
        Open <Icon name="arrow" size={13} />
      </span>
    </button>
  );
}

// Live counts for the "Manage activities" card: only the signed-in brand manager's own activities.
// Active = approved and not yet completed or cancelled; awaiting approval = submitted.
function ModulesSection({ onOpen, user, api = fieldApi }) {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    let cancelled = false;
    api.listActivities()
      .then(all => {
        if (cancelled) return;
        const records = all.filter(record => record.ownerId === user?.id);
        setSummary({
          active: records.filter(record => record.status === "validated" || record.status === "in_progress").length,
          pending: records.filter(record => record.status === "submitted").length,
          rejected: records.filter(record => record.status === "rejected").length,
        });
      })
      .catch(() => { if (!cancelled) setSummary({ error: true }); });
    return () => { cancelled = true; };
  }, [api, user?.id]);

  const cards = modules.map(module => module.id !== "activities" ? module : {
    ...module,
    description: !summary ? <>Loading…<br />&nbsp;</>
      : summary.error ? <>Couldn’t load the counts.<br />Open to see your activities.</>
      : <>{summary.active} active<br />{summary.pending} awaiting approval</>,
    // The red dot flags rejected activities, which need the brand manager to edit and resubmit.
    notification: Boolean(summary && !summary.error && summary.rejected > 0),
  });

  return (
    <section className="modules-section">
      <h2 className="section-label">MODULES</h2>

      <div className="modules-grid">
        <button
          className="create-card"
          type="button"
          onClick={() => onOpen("create")}
        >
          <Icon name="plus" size={36} />
          <span>Create activation</span>
        </button>

        {cards.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

function BottomNavigation({ activePage, onNavigate }) {
  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      {navigation.map((item) => {
        const isActive = activePage === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const BRANDS = ["Habesha", "Habesha Kostara", "Habesha Draught", "Negus", "Feta", "Kidame"];
// "National" covers every city: choosing it sets the city to "National" (feedback 9/11, page 2).
const NATIONAL = "National";
const DIVISIONS = ["Addis Ababa", "Central", "East", "North East", "North West", "South", "West", NATIONAL];
const STATUS_LABELS = {
  submitted: "PENDING",
  validated: "APPROVED",
  rejected: "REJECTED",
  reopened: "BEING EDITED",
  in_progress: "IN PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};
const statusLabel = (status) => STATUS_LABELS[status] || "PENDING";
const statusClass = (status) => `status-${(STATUS_LABELS[status] || "PENDING").toLowerCase().replace(" ", "-")}`;
// Built-in copy of "Cities by Habesha Divisions" (Nov 2026). Used only if the configured list in the
// database can't be loaded; Owner/Admin maintains the real list in the admin dashboard (Cities & divisions).
const DIVISION_CITIES = {
  "Addis Ababa": ["Alemgena-Sebeta", "Burayu"],
  "Central": ["Alamata", "Alemketema", "Debrebirhan", "Deneba", "Dessie", "Kombolcha", "Logia", "Mehalmeda", "Mekanesealm", "Mersa", "Sekota", "Shewarobit", "Woldiya"],
  "East": ["Adama", "Assela-bekoji", "Awash 40", "Bale Genir", "Bishoftu", "Chelenko", "Chiro", "Diredawa", "Harar", "Jigjiga", "Minjar", "Modjo", "Robe"],
  "North East": ["A.Enticho", "Abiyiad", "Adidaro", "Adigebru", "Adigrat-2", "Adihageray", "Adinebrid", "Adwa", "Axum", "EdagaHamus T2", "Endabaguna", "Hawzen", "Hintsats", "Ksadgaba", "Lachi", "mehonie", "Mekele", "Mekele T1", "Mekele T2", "Mekele T3", "Mekele T4", "myhanse", "Quiha Adigudem T1", "Sheraro", "Shire 1", "Shire 2", "T.Enticho", "Wukro", "Zana"],
  "North West": ["Abderafi", "Abrihajira", "Addis Zemen", "Adi Arkay", "Adigoshu-Baker", "Adiremts-Maygaba", "Ashire", "Azezo", "Bahirdar-Abay Mado", "Bahirdar1", "Bahirdar2", "bichena", "bure", "Bure-Kuchi", "Chagni", "Dabat", "Dangila", "Dangila 2", "Dansha", "Debark", "Debremarkose", "DebreTabor", "Delgi", "Ebinat", "Este", "Finoteselam", "Gelgel Beles", "Gondar", "Humera", "Jawi", "Kokit", "Kosober", "Lideta", "Maksegnit", "Maraki College", "Maykadra", "Maytsebri", "Merawi", "Metema", "Mirab armachiho", "Mota", "Negade Bahir", "Piassa", "Quara", "Sanja", "Shaura", "Shehdi", "Shinfa", "Soroka", "Tikildingaye", "Tilili", "Wembera", "Woreta"],
  "South": ["Arbaminch", "Dila", "Halaba", "Hawassa", "Hosaena", "Moyale", "Negelle Borena", "Sawla", "Shakiso", "Shashemane", "Wolayita", "Yabelo", "Yirgalem"],
  "West": ["Ambo", "Assosa Town", "Bonga", "Dima", "Gambella", "Jimma", "Metu", "Mizan", "shabench", "Tepi", "Woliso", "Wolkitie"],
};
const byName = (x, y) => x.localeCompare(y, undefined, { sensitivity: "base" });
const allCitiesOf = (map) => [...new Set(Object.values(map).flat())].sort(byName);
const divisionsAllMapped = (map, selected) => selected.length > 0 && selected.every(item => map[item]?.length);
// No division selected: every city. Otherwise: the cities of the selected divisions only.
const citiesFor = (map, selected) => !selected.length ? allCitiesOf(map) : [...new Set([
  ...selected.flatMap(item => map[item] || []),
  ...(divisionsAllMapped(map, selected) ? [] : allCitiesOf(map)),
])];
// Question bank spine, U19 "How will the primary KPI be measured?" (row 30).
const MEASUREMENT_OPTIONS = ["Field count sheet", "QR post-event survey", "QR survey + field count", "Outlet depletion / crates sold", "Trade census / outlet check", "Platform analytics (digital)", "Media post-buy report", "Brand health / campaign recall study", "Partner rights-delivery checklist", "Draught throughput log", "Sampling tally + purchase check", "FGD / interview guide", "Other"];
const EIGHT_STEP_TYPES = ["Sponsorship", "Trade/POS", "Media/ATL", "Partnership"];
const stepCountFor = (type) => type === "Other" ? 6 : EIGHT_STEP_TYPES.includes(type) ? 8 : 7;

function CreateActivation({ onClose, onHome, initialActivity = null, approverMode = false, onDecision, currentUser = null, api = fieldApi, people = [], referentials = null }) {
  // Stage 0 is the activity-type selection.
  // Stage 1 is "The activity".
  // Stage 2 is "Strategy and timing"; stage 3 is "Ownership".
  const [stage, setStage] = useState(0);
  const [detailTab, setDetailTab] = useState("details");
  const [submissionTime, setSubmissionTime] = useState("");
  const [activityCancelled, setActivityCancelled] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [recordId, setRecordId] = useState(null);
  const [draftOffline, setDraftOffline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [activityType, setActivityType] = useState("");
  const [activityName, setActivityName] = useState("");
  const [brand, setBrand] = useState("");
  const [division, setDivision] = useState([]);
  const [divisionOpen, setDivisionOpen] = useState(false);
  const [city, setCity] = useState("");

  const [strategyPillar, setStrategyPillar] = useState("");
  const [activityObjective, setActivityObjective] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Step 3: Ownership
  const [accountablePerson, setAccountablePerson] = useState(currentUser?.name || "Mikias Workneh");
  const [counterpartRequired, setCounterpartRequired] = useState("required");
  const [counterparts, setCounterparts] = useState([]);
  const [counterpartOpen, setCounterpartOpen] = useState(false);
  const [otherCounterpartInput, setOtherCounterpartInput] = useState("");
  const [otherCounterparts, setOtherCounterparts] = useState([]);
  const [deliveryType, setDeliveryType] = useState("external");
  const [externalDeliveryName, setExternalDeliveryName] = useState("");

  const [plannedBudget, setPlannedBudget] = useState("");
  const [ioNumber, setIoNumber] = useState("");
  const [poNumber, setPoNumber] = useState("");
  // Events/Activations: Step 5 fields (EA01–EA05).
  const [eventFormat, setEventFormat] = useState("");
  const [eventRuns, setEventRuns] = useState("");
  const [eventAttendance, setEventAttendance] = useState("");
  const [eventAudience, setEventAudience] = useState("");
  const [eventExperiences, setEventExperiences] = useState([]);
  const eventFormatOptions = ["Brand-owned event", "Outlet activation", "Community event", "Watch party", "Bus activation", "Festival activation", "Mobile activation", "Other"];
  const eventExperienceOptions = ["Brand Exposure", "Data Capture", "Product Trial"];
  const isPositiveWholeNumber = (v) => v !== "" && Number.isSafeInteger(Number(v)) && Number(v) > 0;
  const isEventsStep5Valid = eventFormat !== "" && isPositiveWholeNumber(eventRuns) && isPositiveWholeNumber(eventAttendance) && eventExperiences.length > 0;
  // Events/Activations — Step 6 (EA06, EA08, EA09 from events.xlsx).
  const [eventSamplingSale, setEventSamplingSale] = useState("");
  const [eventSalesTracked, setEventSalesTracked] = useState("");
  const [eventQualityAssessment, setEventQualityAssessment] = useState("");
  const eventSamplingOptions = ["Sampling only", "Sale only", "Sampling + sale", "Neither"];
  const eventQualityOptions = ["QR survey", "Short intercept survey", "Observation checklist", "Partner feedback", "Not required"];
  const isEventsStep6Valid = eventSamplingSale !== "" && eventSalesTracked !== "";
  // Sponsorship: SP01–SP12, per sponsorship.xlsx and supplied screenshots.
  const [sponsorProperty, setSponsorProperty] = useState("");
  const [sponsorFit, setSponsorFit] = useState("");
  const [sponsorStart, setSponsorStart] = useState("");
  const [sponsorEnd, setSponsorEnd] = useState("");
  const [sponsorAudience, setSponsorAudience] = useState("");
  const [sponsorRights, setSponsorRights] = useState([]);
  const [sponsorRightRows, setSponsorRightRows] = useState([{right:"", evidence:"", quantity:""}]);
  const [sponsorActivation, setSponsorActivation] = useState("");
  const [sponsorRightsFee, setSponsorRightsFee] = useState("");
  const [sponsorActivationBudget, setSponsorActivationBudget] = useState("");
  const [sponsorVerification, setSponsorVerification] = useState("");
  const [sponsorRecall, setSponsorRecall] = useState("");
  const [sponsorFinalEvidence, setSponsorFinalEvidence] = useState([]);
  const sponsorshipRightsOptions = ["Logo visibility", "Product exclusivity", "Sampling rights", "Digital amplification", "Stage / venue branding", "Hospitality / VIP access", "Data capture", "Content rights", "Naming rights", "Other"];
  const sponsorshipVerificationOptions = ["Rights-delivery checklist", "Independent observation", "Partner report", "Media monitoring", "Other"];
  const sponsorshipRecallOptions = ["Yes - campaign recall", "Yes - brand health wave", "No"];
  const sponsorshipEvidenceOptions = ["Rights-delivery report", "Audience report", "Media report", "Photos/videos", "Consumer data", "Final evaluation"];
  const isSponsorship = activityType === "Sponsorship";
  const sponsorshipTotal = Number(sponsorRightsFee || 0) + Number(sponsorActivationBudget || 0);
  const isSponsorshipStep5Valid = sponsorProperty.trim() !== "" && sponsorFit.trim() !== "" && sponsorAudience.trim() !== "" && sponsorStart !== "" && sponsorEnd !== "" && sponsorEnd >= sponsorStart;
  const isSponsorshipStep6Valid = sponsorRights.length > 0 && sponsorRightRows.length > 0 && sponsorRights.every(right => sponsorRightRows.some(row => row.right === right && row.quantity.trim() && row.evidence.trim())) && sponsorRightRows.every(row => sponsorRights.includes(row.right) && row.quantity.trim() && row.evidence.trim());
  const isSponsorshipStep7Valid = sponsorActivation.trim() !== "" && [sponsorRightsFee, sponsorActivationBudget].every(v => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0) && sponsorVerification !== "" && sponsorRecall !== "" && sponsorFinalEvidence.length > 0;
  const updateSponsorRightRow = (index, field, value) => {
    setSponsorRightRows(rows => rows.map((row, i) => i === index ? {...row, [field]: value} : row));
    setDraftSaved(false);
  };
  const sponsorSelect = (id, label, value, setter, options, required = true) => (
    <div className="form-field">
      <label htmlFor={id}>{label} {required && <span className="required-mark">*</span>}</label>
      <select id={id} value={value} onChange={e => {setter(e.target.value); setDraftSaved(false);}} required={required}>
        <option value="">Select</option>{options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
  const sponsorMultiSelect = (label, options, selected, setter) => (
    <div className="form-field">
      <label>{label} <span className="required-mark">*</span></label>
      <details className="events-multiselect sponsor-multiselect">
        <summary>{selected.length ? `${selected.length} selected` : "Select"}</summary>
        <div className="events-multiselect-options">
          <label className="events-select-all"><input type="checkbox" checked={selected.length === options.length} ref={node => {if(node) node.indeterminate = selected.length > 0 && selected.length < options.length;}} onChange={e => {setter(e.target.checked ? [...options] : []); setDraftSaved(false);}} />Select all</label>
          {options.map(option => <label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={e => {setter(previous => e.target.checked ? [...previous, option] : previous.filter(x => x !== option)); setDraftSaved(false);}} />{option}</label>)}
        </div>
      </details>
    </div>
  );
  const sponsorField = (id, label, value, setter, placeholder = "", multiline = false) => (
    <div className="form-field">
      <label htmlFor={id}>{label} <span className="required-mark">*</span></label>
      {multiline ? <textarea id={id} rows={3} placeholder={placeholder} value={value} onChange={e => {setter(e.target.value); setDraftSaved(false);}} required /> : <input id={id} type="text" placeholder={placeholder} value={value} onChange={e => {setter(e.target.value); setDraftSaved(false);}} required />}
      </div>
  );
  const sponsorCurrency = (id, label, value, setter) => (
    <div className="form-field"><label htmlFor={id}>{label} <span className="required-mark">*</span></label>
      <input id={id} type="number" min="0" step="0.01" inputMode="decimal" placeholder="ETB" value={value} onChange={e => {setter(e.target.value); setDraftSaved(false);}} required /></div>
  );
  const sponsorshipStep = (number, title, children, valid) => (
    <><main className="activation-content activity-details-content sponsorship-content">
      <h1 className="wizard-page-title">CREATE ACTIVITY</h1>
      <section className="wizard-step-card">{renderProgress(number, totalSteps)}<p className="wizard-step-count">STEP {number} OF {totalSteps}</p><h2>{title}</h2></section>
      <p className="draft-storage-note">{saveNote}</p>
      <form className="activity-details-form sponsorship-form" onSubmit={e => e.preventDefault()}>{children}</form>
    </main><footer className="wizard-footer"><button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19}/></button><button className="wizard-continue-button" type="button" disabled={!valid} onClick={handleContinue}>Continue <Icon name="arrow" size={16}/></button></footer></>
  );
  // Trade/POS: TP01–TP11, per TradePOS.xlsx and supplied screenshots.
  const isTradePos = activityType === "Trade/POS";
  const isEightStep = EIGHT_STEP_TYPES.includes(activityType);
  const [tradeOutletTypes, setTradeOutletTypes] = useState([]);
  const [tradeListAvailable, setTradeListAvailable] = useState("");
  const [tradeOutletList, setTradeOutletList] = useState("");
  const [tradeOutletCount, setTradeOutletCount] = useState("");
  const [tradeAssets, setTradeAssets] = useState([]);
  const [tradeStandard, setTradeStandard] = useState("");
  const [tradeComplianceDate, setTradeComplianceDate] = useState("");
  const [tradeOutcome, setTradeOutcome] = useState("");
  const [tradeSalesCapture, setTradeSalesCapture] = useState("");
  const tradeOutletTypeOptions = ["On-premise", "Off-premise", "Key account", "Coffee shop", "Traditional outlet", "Modern trade", "Other"];
  const tradeAssetOptions = ["Cooler", "Shophead", "Signage", "Tablecloth", "Banner", "Apron", "Bottle cutout", "Menu branding", "Draught tower / tap branding", "Consumer promotion", "Other"];
  const tradeOutcomeOptions = ["Distribution", "Availability", "Outlet activation", "Rate of sale", "Depletion", "Direct sales", "Visibility compliance"];
  const tradeSalesCaptureOptions = ["Direct sales", "Depletion", "Both", "Neither"];
  const tradeProofOptions = ["Outlet list", "Before/after photos", "Compliance checklist", "Sales record", "Depletion extract", "Cooler scan", "Final report"];
  const isWholeNumber = (v) => v !== "" && Number.isSafeInteger(Number(v)) && Number(v) >= 0;
  const isTradeStep5Valid = tradeOutletTypes.length > 0 && tradeListAvailable !== "" && isWholeNumber(tradeOutletCount) && (tradeListAvailable !== "Yes" || tradeOutletList.trim() !== "");
  const isTradeStep6Valid = tradeAssets.length > 0 && tradeStandard.trim() !== "" && tradeComplianceDate !== "";
  const isTradeStep7Valid = tradeOutcome !== "" && tradeSalesCapture !== "";
  const isFiniteNumber = (v) => v !== "" && Number.isFinite(Number(v));
  const isNonNegativeNumber = (v) => isFiniteNumber(v) && Number(v) >= 0;
  const wholeNumberField = (id, label, value, setter) => (
    <div className="form-field">
      <label htmlFor={id}>{label} <span className="required-mark">*</span></label>
      <input id={id} type="number" min="0" step="1" inputMode="numeric" value={value} onChange={e => {setter(e.target.value); setDraftSaved(false);}} required />
    </div>
  );
  // Sampling: SA01–SA10, per Sampling.xlsx and supplied screenshots.
  const isSampling = activityType === "Sampling";
  const [samplingFormat, setSamplingFormat] = useState("");
  const [samplingSessions, setSamplingSessions] = useState("");
  const [samplingPromoters, setSamplingPromoters] = useState("");
  const [samplingServes, setSamplingServes] = useState("");
  const [samplingAudience, setSamplingAudience] = useState("");
  const [samplingVerifiedTrial, setSamplingVerifiedTrial] = useState("");
  const [samplingPurchase, setSamplingPurchase] = useState("");
  const [samplingCounting, setSamplingCounting] = useState("");
  const [samplingCostPerTrial, setSamplingCostPerTrial] = useState("");
  const samplingFormatOptions = ["Promoter sampling", "Van sampling", "Outlet sampling", "Event sampling", "Crate injection", "Other"];
  const samplingVerifiedOptions = ["Product handed over", "Product tasted", "Full serve consumed", "QR confirmation", "Other"];
  const samplingPurchaseOptions = ["Yes - unit sale", "Yes - crate sale", "Yes - purchase intent only", "No"];
  const samplingCountingOptions = ["Tally sheet", "Digital counter", "QR response", "Stock reconciliation", "Other"];
  const samplingEvidenceOptions = ["Sampling tally", "Stock issue/return", "Trial survey", "Immediate sales", "Photos", "Final report"];
  const isSamplingStep5Valid = samplingFormat !== "" && isWholeNumber(samplingSessions) && isWholeNumber(samplingPromoters) && isWholeNumber(samplingServes) && samplingAudience.trim() !== "";
  const isSamplingStep6Valid = samplingVerifiedTrial !== "" && samplingPurchase !== "" && samplingCounting !== "" && samplingCostPerTrial !== "";
  // Media/ATL: MA01–MA12, per Media.xlsx and supplied screenshots.
  const isMedia = activityType === "Media/ATL";
  const [mediaTypes, setMediaTypes] = useState([]);
  const [mediaFlightStart, setMediaFlightStart] = useState("");
  const [mediaFlightEnd, setMediaFlightEnd] = useState("");
  const [mediaAudience, setMediaAudience] = useState("");
  const [mediaReachUnit, setMediaReachUnit] = useState("");
  const [mediaReach, setMediaReach] = useState("");
  const [mediaFrequency, setMediaFrequency] = useState("");
  const [mediaInventory, setMediaInventory] = useState("");
  const [mediaProductionBudget, setMediaProductionBudget] = useState("");
  const [mediaPlacementBudget, setMediaPlacementBudget] = useState("");
  const [mediaCreative, setMediaCreative] = useState("");
  const [mediaVerification, setMediaVerification] = useState("");
  const [mediaRecall, setMediaRecall] = useState("");
  const mediaTypeOptions = ["TV", "Radio", "OOH", "Print", "Cinema", "Digital display", "Other"];
  const mediaReachUnits = ["People", "Impressions", "% reach"];
  const mediaVerificationOptions = ["Media post-buy", "Broadcaster log", "OOH proof of posting", "Circulation report", "Other"];
  const mediaRecallOptions = ["Brand health wave", "Campaign recall study", "Digital proxy only", "No"];
  const mediaEvidenceOptions = ["Post-buy report", "Spot logs", "Proof of posting", "Audience data", "Creative files", "Invoice reconciliation", "Final report"];
  const mediaTotal = Number(mediaProductionBudget || 0) + Number(mediaPlacementBudget || 0);
  const isMediaStep5Valid = mediaTypes.length > 0 && mediaFlightStart !== "" && mediaFlightEnd !== "" && mediaFlightEnd >= mediaFlightStart && mediaAudience.trim() !== "" && mediaReachUnit !== "" && isNonNegativeNumber(mediaReach) && (mediaFrequency === "" || isNonNegativeNumber(mediaFrequency));
  const isMediaStep6Valid = mediaInventory.trim() !== "" && isNonNegativeNumber(mediaProductionBudget) && isNonNegativeNumber(mediaPlacementBudget);
  const isMediaStep7Valid = mediaCreative.trim() !== "" && mediaVerification !== "" && mediaRecall !== "";
  // Partnership: PA01–PA10, per Partnership.xlsx and supplied screenshots.
  const isPartnership = activityType === "Partnership";
  const emptyDeliverable = {deliverable: "", quantity: "", dueDate: "", evidence: ""};
  const [partnerName, setPartnerName] = useState("");
  const [partnerNameTouched, setPartnerNameTouched] = useState(false);
  const [partnerFit, setPartnerFit] = useState("");
  const [partnerContribution, setPartnerContribution] = useState([]);
  const [partnerBrandContribution, setPartnerBrandContribution] = useState([]);
  const [partnerAudienceNumber, setPartnerAudienceNumber] = useState("");
  const [partnerAudienceDescription, setPartnerAudienceDescription] = useState("");
  const [partnerDeliverables, setPartnerDeliverables] = useState([{...emptyDeliverable}]);
  const [partnerIncrementalValue, setPartnerIncrementalValue] = useState("");
  const [partnerEvaluation, setPartnerEvaluation] = useState([]);
  const [partnerRenewalEvidence, setPartnerRenewalEvidence] = useState("");
  const partnerContributionOptions = ["Audience access", "Distribution access", "Brand credibility", "Content creation", "Data capture", "Trial opportunity", "Visibility", "Cash / in-kind investment", "Other"];
  const partnerBrandContributionOptions = ["Cash", "Product", "Media", "Content", "Staff", "Assets", "Exclusivity", "Other"];
  const partnerEvaluationOptions = ["Audience reached", "Rights delivered", "Leads/data captured", "Trials", "Outlet access", "Content created", "Brand outcome", "Other"];
  const partnerEvidenceOptions = ["Delivery report", "Audience data", "Content assets", "Survey", "Sales data", "Final evaluation"];
  const updatePartnerDeliverable = (index, field, value) => {
    setPartnerDeliverables(rows => rows.map((row, i) => i === index ? {...row, [field]: value} : row));
    setDraftSaved(false);
  };
  const isPartnerStep5Valid = partnerName.trim() !== "" && partnerFit.trim() !== "" && partnerContribution.length > 0 && partnerBrandContribution.length > 0;
  const isPartnerStep6Valid = isWholeNumber(partnerAudienceNumber) && partnerAudienceDescription.trim() !== "" && partnerDeliverables.length > 0 && partnerDeliverables.every(row => row.deliverable.trim() && row.quantity.trim() && row.dueDate && row.evidence.trim());
  const isPartnerStep7Valid = partnerIncrementalValue.trim() !== "" && partnerEvaluation.length > 0 && partnerRenewalEvidence.trim() !== "";
  // Other: OT01 and OT07, per Other.xlsx and supplied screenshot.
  const isOther = activityType === "Other";
  const [otherDescription, setOtherDescription] = useState("");
  const [otherOutcome, setOtherOutcome] = useState("");
  const [otherSource, setOtherSource] = useState("");
  const [otherBaselineUnit, setOtherBaselineUnit] = useState("");
  const [otherBaselineValue, setOtherBaselineValue] = useState("");
  const [otherApprover, setOtherApprover] = useState("");
  const isOtherStep5Valid = otherDescription.trim() !== "" && otherOutcome.trim() !== "" && otherSource.trim() !== "" && otherBaselineUnit.trim() !== "" && isFiniteNumber(otherBaselineValue) && otherApprover !== "";
  // Step numbering per type: steps 1–4 shared, type steps, then Measuring success, Review and Post-submit.
  const totalSteps = stepCountFor(activityType);
  const reviewStage = totalSteps + 1;
  const postStage = totalSteps + 2;
  const newTypeValues = {
    samplingFormat, samplingSessions, samplingPromoters, samplingServes, samplingAudience, samplingVerifiedTrial, samplingPurchase, samplingCounting, samplingCostPerTrial,
    mediaTypes, mediaFlightStart, mediaFlightEnd, mediaAudience, mediaReachUnit, mediaReach, mediaFrequency, mediaInventory, mediaProductionBudget, mediaPlacementBudget, mediaCreative, mediaVerification, mediaRecall,
    partnerName, partnerFit, partnerContribution, partnerBrandContribution, partnerAudienceNumber, partnerAudienceDescription, partnerDeliverables, partnerIncrementalValue, partnerEvaluation, partnerRenewalEvidence,
    otherDescription, otherOutcome, otherSource, otherBaselineUnit, otherBaselineValue, otherApprover,
  };
  const newTypeSetters = {
    samplingFormat: setSamplingFormat, samplingSessions: setSamplingSessions, samplingPromoters: setSamplingPromoters, samplingServes: setSamplingServes, samplingAudience: setSamplingAudience, samplingVerifiedTrial: setSamplingVerifiedTrial, samplingPurchase: setSamplingPurchase, samplingCounting: setSamplingCounting, samplingCostPerTrial: setSamplingCostPerTrial,
    mediaTypes: setMediaTypes, mediaFlightStart: setMediaFlightStart, mediaFlightEnd: setMediaFlightEnd, mediaAudience: setMediaAudience, mediaReachUnit: setMediaReachUnit, mediaReach: setMediaReach, mediaFrequency: setMediaFrequency, mediaInventory: setMediaInventory, mediaProductionBudget: setMediaProductionBudget, mediaPlacementBudget: setMediaPlacementBudget, mediaCreative: setMediaCreative, mediaVerification: setMediaVerification, mediaRecall: setMediaRecall,
    partnerName: setPartnerName, partnerFit: setPartnerFit, partnerContribution: setPartnerContribution, partnerBrandContribution: setPartnerBrandContribution, partnerAudienceNumber: setPartnerAudienceNumber, partnerAudienceDescription: setPartnerAudienceDescription, partnerDeliverables: setPartnerDeliverables, partnerIncrementalValue: setPartnerIncrementalValue, partnerEvaluation: setPartnerEvaluation, partnerRenewalEvidence: setPartnerRenewalEvidence,
    otherDescription: setOtherDescription, otherOutcome: setOtherOutcome, otherSource: setOtherSource, otherBaselineUnit: setOtherBaselineUnit, otherBaselineValue: setOtherBaselineValue, otherApprover: setOtherApprover,
  };
  const [draughtOutlets, setDraughtOutlets] = useState("");
  const [newOutlets, setNewOutlets] = useState("");
  const [existingOutlets, setExistingOutlets] = useState("");
  const [activeTaps, setActiveTaps] = useState("");
  const [equipmentReadiness, setEquipmentReadiness] = useState([]);
  const [equipmentReadinessOpen, setEquipmentReadinessOpen] = useState(false);
  const readinessOptions = ["Tap operational", "Cooling operational", "Cleaning completed", "Gas available", "Glassware available", "Branding installed"];
  // Step 6: Objective, volumes and consumers
  const [draughtJob, setDraughtJob] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [targetVolume, setTargetVolume] = useState("");
  const [baselineUnit, setBaselineUnit] = useState("");
  const [baselineVolume, setBaselineVolume] = useState("");
  const [verifiedTrials, setVerifiedTrials] = useState("no");
  const [repeatObservation, setRepeatObservation] = useState("");
  const draughtJobs = ["Trial", "Throughput", "Outlet expansion", "Repeat purchase", "Food pairing", "Visibility"];
  const volumeUnits = ["Litres", "Kegs", "HL", "Serves"];
  const repeatMethods = ["Outlet reorder", "Consumer follow-up", "Repeat serve count", "Not measured"];
  // Step 7: Measuring success
  const [primaryKpi, setPrimaryKpi] = useState("");
  const [successUnit, setSuccessUnit] = useState("");
  const [successValue, setSuccessValue] = useState("");
  const [measurementMethod, setMeasurementMethod] = useState("");
  const [submittedEvidence, setSubmittedEvidence] = useState([]);
  const [businessDecision, setBusinessDecision] = useState("");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceSearch, setEvidenceSearch] = useState("");
  const [measurementSearch, setMeasurementSearch] = useState("");
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionSearch, setDecisionSearch] = useState("");
  const [activityCompleted, setActivityCompleted] = useState(false);

  useEffect(() => {
    if (!initialActivity) return;
    setStage(initialActivity._isDraft ? (initialActivity.stage || 0) : (stepCountFor(initialActivity.activityType) + 2)); setSubmissionTime(initialActivity.submittedAt || "");
    setActivityCompleted(!initialActivity._isDraft); setActivityCancelled(initialActivity.status === "cancelled");
    if (initialActivity.id && initialActivity.id !== "offline-draft") setRecordId(initialActivity.id);
    if (initialActivity._isDraft) setDraftSaved(true);
    if (!initialActivity._isDraft) {
      const { _isDraft, ...record } = initialActivity;
      setSavedRecord(record);
      // Load the full record with its history.
      api.getActivity(initialActivity.id).then(setSavedRecord).catch(error => setActionError(error.message));
    }
    if (initialActivity.activityType !== undefined) setActivityType(initialActivity.activityType);
    if (initialActivity.activityName !== undefined) setActivityName(initialActivity.activityName);
    if (initialActivity.brand !== undefined) setBrand(initialActivity.brand);
    if (initialActivity.division !== undefined) setDivision(initialActivity.division);
    if (initialActivity.divisionOpen !== undefined) setDivisionOpen(initialActivity.divisionOpen);
    if (initialActivity.city !== undefined) setCity(initialActivity.city);
    if (initialActivity.strategyPillar !== undefined) setStrategyPillar(initialActivity.strategyPillar);
    if (initialActivity.activityObjective !== undefined) setActivityObjective(initialActivity.activityObjective);
    if (initialActivity.startDate !== undefined) setStartDate(initialActivity.startDate);
    if (initialActivity.endDate !== undefined) setEndDate(initialActivity.endDate);
    if (initialActivity.accountablePerson !== undefined) setAccountablePerson(initialActivity.accountablePerson);
    if (initialActivity.counterpartRequired !== undefined) setCounterpartRequired(initialActivity.counterpartRequired);
    if (initialActivity.counterparts !== undefined) setCounterparts(initialActivity.counterparts);
    if (initialActivity.counterpartOpen !== undefined) setCounterpartOpen(initialActivity.counterpartOpen);
    if (initialActivity.otherCounterpartInput !== undefined) setOtherCounterpartInput(initialActivity.otherCounterpartInput);
    if (initialActivity.otherCounterparts !== undefined) setOtherCounterparts(initialActivity.otherCounterparts);
    if (initialActivity.deliveryType !== undefined) setDeliveryType(initialActivity.deliveryType);
    if (initialActivity.externalDeliveryName !== undefined) setExternalDeliveryName(initialActivity.externalDeliveryName);
    if (initialActivity.plannedBudget !== undefined) setPlannedBudget(initialActivity.plannedBudget);
    if (initialActivity.ioNumber !== undefined) setIoNumber(initialActivity.ioNumber);
    if (initialActivity.poNumber !== undefined) setPoNumber(initialActivity.poNumber);
    if (initialActivity.eventFormat !== undefined) setEventFormat(initialActivity.eventFormat);
    if (initialActivity.eventRuns !== undefined) setEventRuns(initialActivity.eventRuns);
    if (initialActivity.eventAttendance !== undefined) setEventAttendance(initialActivity.eventAttendance);
    if (initialActivity.eventAudience !== undefined) setEventAudience(initialActivity.eventAudience);
    if (initialActivity.eventExperiences !== undefined) setEventExperiences(initialActivity.eventExperiences);
    if (initialActivity.sponsorProperty !== undefined) setSponsorProperty(initialActivity.sponsorProperty);
    if (initialActivity.sponsorFit !== undefined) setSponsorFit(initialActivity.sponsorFit);
    if (initialActivity.sponsorStart !== undefined) setSponsorStart(initialActivity.sponsorStart);
    if (initialActivity.sponsorEnd !== undefined) setSponsorEnd(initialActivity.sponsorEnd);
    if (initialActivity.sponsorAudience !== undefined) setSponsorAudience(initialActivity.sponsorAudience);
    if (initialActivity.sponsorRights !== undefined) setSponsorRights(initialActivity.sponsorRights);
    if (initialActivity.sponsorRightRows !== undefined) setSponsorRightRows(initialActivity.sponsorRightRows);
    if (initialActivity.sponsorActivation !== undefined) setSponsorActivation(initialActivity.sponsorActivation);
    if (initialActivity.sponsorRightsFee !== undefined) setSponsorRightsFee(initialActivity.sponsorRightsFee);
    if (initialActivity.sponsorActivationBudget !== undefined) setSponsorActivationBudget(initialActivity.sponsorActivationBudget);
    if (initialActivity.sponsorVerification !== undefined) setSponsorVerification(initialActivity.sponsorVerification);
    if (initialActivity.sponsorRecall !== undefined) setSponsorRecall(initialActivity.sponsorRecall);
    if (initialActivity.sponsorFinalEvidence !== undefined) setSponsorFinalEvidence(initialActivity.sponsorFinalEvidence);
    const tradeSetters = { tradeOutletTypes: setTradeOutletTypes, tradeListAvailable: setTradeListAvailable, tradeOutletList: setTradeOutletList, tradeOutletCount: setTradeOutletCount, tradeAssets: setTradeAssets, tradeStandard: setTradeStandard, tradeComplianceDate: setTradeComplianceDate, tradeOutcome: setTradeOutcome, tradeSalesCapture: setTradeSalesCapture };
    Object.entries(tradeSetters).forEach(([key, set]) => { if (initialActivity[key] !== undefined) set(initialActivity[key]); });
    Object.entries(newTypeSetters).forEach(([key, set]) => { if (initialActivity[key] !== undefined) set(initialActivity[key]); });
    if (initialActivity.draughtOutlets !== undefined) setDraughtOutlets(initialActivity.draughtOutlets);
    if (initialActivity.newOutlets !== undefined) setNewOutlets(initialActivity.newOutlets);
    if (initialActivity.existingOutlets !== undefined) setExistingOutlets(initialActivity.existingOutlets);
    if (initialActivity.activeTaps !== undefined) setActiveTaps(initialActivity.activeTaps);
    if (initialActivity.equipmentReadiness !== undefined) setEquipmentReadiness(initialActivity.equipmentReadiness);
    if (initialActivity.equipmentReadinessOpen !== undefined) setEquipmentReadinessOpen(initialActivity.equipmentReadinessOpen);
    if (initialActivity.draughtJob !== undefined) setDraughtJob(initialActivity.draughtJob);
    if (initialActivity.targetUnit !== undefined) setTargetUnit(initialActivity.targetUnit);
    if (initialActivity.targetVolume !== undefined) setTargetVolume(initialActivity.targetVolume);
    if (initialActivity.baselineUnit !== undefined) setBaselineUnit(initialActivity.baselineUnit);
    if (initialActivity.baselineVolume !== undefined) setBaselineVolume(initialActivity.baselineVolume);
    if (initialActivity.verifiedTrials !== undefined) setVerifiedTrials(initialActivity.verifiedTrials);
    if (initialActivity.repeatObservation !== undefined) setRepeatObservation(initialActivity.repeatObservation);
    if (initialActivity.eventSamplingSale !== undefined) setEventSamplingSale(initialActivity.eventSamplingSale);
    if (initialActivity.eventSalesTracked !== undefined) setEventSalesTracked(initialActivity.eventSalesTracked);
    if (initialActivity.eventQualityAssessment !== undefined) setEventQualityAssessment(initialActivity.eventQualityAssessment);
    if (initialActivity.primaryKpi !== undefined) setPrimaryKpi(initialActivity.primaryKpi);
    if (initialActivity.successUnit !== undefined) setSuccessUnit(initialActivity.successUnit);
    if (initialActivity.successValue !== undefined) setSuccessValue(initialActivity.successValue);
    if (initialActivity.measurementMethod !== undefined) setMeasurementMethod(initialActivity.measurementMethod);
    if (initialActivity.submittedEvidence !== undefined) setSubmittedEvidence(initialActivity.submittedEvidence);
    if (initialActivity.businessDecision !== undefined) setBusinessDecision(initialActivity.businessDecision);
    if (initialActivity.evidenceOpen !== undefined) setEvidenceOpen(initialActivity.evidenceOpen);
    if (initialActivity.evidenceSearch !== undefined) setEvidenceSearch(initialActivity.evidenceSearch);
    if (initialActivity.measurementSearch !== undefined) setMeasurementSearch(initialActivity.measurementSearch);
    if (initialActivity.measurementOpen !== undefined) setMeasurementOpen(initialActivity.measurementOpen);
    if (initialActivity.decisionOpen !== undefined) setDecisionOpen(initialActivity.decisionOpen);
    if (initialActivity.decisionSearch !== undefined) setDecisionSearch(initialActivity.decisionSearch);
  }, [initialActivity]);
  const kpiOptions = isEightStep ? ["Rights delivery", "Brand recall", "Brand association", "Audience reach"] : ["Active taps", "Verified trials", "Draught throughput", "Outlet reorder"];
  // The user explicitly provided these options for both questions.
  const outcomeOptions = [
    "Build salience", "Build awareness", "Drive trial", "Grow share of repertoire",
    "Build attribute association", "Amplify claim / word of mouth",
    "Event engagement quality", "Outlet visibility (with trade)", "Insight / data capture"
  ];
  // Evidence question per activity type (Question Bank v3, block F): EA10, SP12, TP11, DA10, SA10, PA10, MA12.
  // "Other" has no evidence question in v3, so none is asked.
  const isEvents = activityType === "Events/Activations";
  const eventsEvidenceOptions = ["Attendance count", "Photos/videos", "Sampling tally", "Sales/depletion", "Rights-delivery checklist", "Consumer survey", "Final report"];
  const draughtEvidenceOptions = ["Active-tap log", "Throughput log", "Trial tally", "Reorder record", "Outlet feedback", "Photos", "Final report"];
  const hasEvidenceQuestion = !isOther;
  const evidenceOptions = isSponsorship ? sponsorshipEvidenceOptions : isTradePos ? tradeProofOptions : isSampling ? samplingEvidenceOptions : isMedia ? mediaEvidenceOptions : isPartnership ? partnerEvidenceOptions : isEvents ? eventsEvidenceOptions : draughtEvidenceOptions;
  const evidenceLabel = isSponsorship ? "What evidence will the sponsor or rights holder submit?" : isTradePos ? "What proof is required from the field?" : isSampling ? "What evidence is required?" : isMedia ? "What evidence must the media or agency partner submit?" : isPartnership ? "What must the partner submit before final payment or renewal?" : isEvents ? "What evidence must the delivery partner submit?" : "What evidence will outlets or the draught team submit?";
  const businessDecisions = [
    "Scale nationally", "Scale regionally", "Repeat next cycle", "Refine execution",
    "Increase investment", "Decrease investment", "Stop activity"
  ];
  const [draftSaved, setDraftSaved] = useState(false);

  // NF-102-002: a brand manager only creates activations for their assigned brands.
  const brands = currentUser?.brands?.length && !approverMode ? BRANDS.filter(item => currentUser.brands.includes(item)) : BRANDS;

  const divisionCities = referentials?.cities || DIVISION_CITIES;
  const divisions = referentials?.divisions || DIVISIONS;

  const accountablePeople = people.length ? people : (currentUser?.name ? [currentUser.name] : []);

  const counterpartOptions = ["Trade Marketing", "Field Sales Manager", "Other"];

  const strategyPillars = [
    "BB1 - Functional into emotional",
    "BB2 - Win in outlet",
    "BB3 - RTM / stockists",
    "Brand MWB - other",
  ];

  const activityObjectives = [
    "Build salience",
    "Build awareness",
    "Drive trial",
    "Grow share of repertoire",
    "Build attribute association",
    "Amplify claim / word of mouth",
    "Event engagement quality",
    "Outlet visibility (with trade)",
    "Insight / data capture",
  ];

  const isActivityDetailsValid =
    activityName.trim() !== "" &&
    brand !== "" &&
    division.length > 0 &&
    city.trim() !== "";

  const isStrategyTimingValid =
    strategyPillar !== "" &&
    activityObjective !== "" &&
    startDate !== "" &&
    endDate !== "" &&
    endDate >= startDate;

  const isOwnershipValid =
    accountablePerson !== "" &&
    (counterpartRequired === "not-required" ||
      (counterparts.length > 0 &&
        (!counterparts.includes("Other") || otherCounterparts.length > 0))) &&
    (deliveryType !== "external" || externalDeliveryName.trim() !== "");

  const isBudgetValid = isSponsorship || isMedia || (plannedBudget.trim() !== "" && Number.isFinite(Number(plannedBudget)) && Number(plannedBudget) >= 0);

  const isOutletsValid =
    [draughtOutlets, newOutlets, existingOutlets, activeTaps].every(
      (value) => value.trim() !== "" && Number.isInteger(Number(value)) && Number(value) >= 0
    ) && Number(newOutlets) + Number(existingOutlets) === Number(draughtOutlets) &&
    equipmentReadiness.length > 0;

  const isVolume = value => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
  const isStep6Valid = draughtJob !== "" && targetUnit !== "" && isVolume(targetVolume) &&
    baselineUnit !== "" && isVolume(baselineVolume) && repeatObservation !== "";

  const isStep7Valid = primaryKpi !== "" && successUnit !== "" && isVolume(successValue) &&
    measurementMethod !== "" && (!hasEvidenceQuestion || submittedEvidence.length > 0);

  const addOtherCounterpart = () => {
    const name = otherCounterpartInput.trim();
    if (!name) return;
    setOtherCounterparts((previous) =>
      previous.includes(name) ? previous : [...previous, name]
    );
    setOtherCounterpartInput("");
    setDraftSaved(false);
  };

  const saveDraft = async (automatic = false) => {
    if (approverMode || busy) return;
    if (automatic === true && (draftSaved || !activityType || stage < 1 || savedRecord)) return;
    const draft = {
      ...collectRecord(),
      stage,
    };
    try {
      const saved = await api.saveDraft({ ...draft, id: recordId || savedRecord?.id });
      setRecordId(saved.id);
      localStorage.removeItem(DRAFT_STORAGE);
      setDraftOffline(false);
      setDraftSaved(true);
    } catch {
      try {
        localStorage.setItem(DRAFT_STORAGE, JSON.stringify({ ...draft, id: recordId, updatedAt: new Date().toISOString() }));
        setDraftOffline(true);
      } catch {
        if (!automatic) alert("Unable to save the draft.");
      }
    }
  };
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;
  // Periodic autosave of drafts (FR-101-009).
  useEffect(() => {
    const timer = window.setInterval(() => saveDraftRef.current(true), 20000);
    return () => window.clearInterval(timer);
  }, []);
  const saveNote = draftSaved ? "Saved" : draftOffline ? "Not synced — kept on this phone" : "";

  const handleContinue = () => {
    if (stage === 0 && activityType) {
      setStage(1);
      return;
    }

    if (stage === 1 && isActivityDetailsValid) {
      setStage(2);
      setDivisionOpen(false);
      return;
    }

    if (stage === 2 && isStrategyTimingValid) {
      setStage(3);
      return;
    }

    if (stage === 3 && isOwnershipValid) {
      setStage(4);
      return;
    }

    if (stage === 4 && isBudgetValid) {
      setStage(5);
      return;
    }
    const typeStepValidity = {
      "Sponsorship": {5: isSponsorshipStep5Valid, 6: isSponsorshipStep6Valid, 7: isSponsorshipStep7Valid},
      "Trade/POS": {5: isTradeStep5Valid, 6: isTradeStep6Valid, 7: isTradeStep7Valid},
      "Media/ATL": {5: isMediaStep5Valid, 6: isMediaStep6Valid, 7: isMediaStep7Valid},
      "Partnership": {5: isPartnerStep5Valid, 6: isPartnerStep6Valid, 7: isPartnerStep7Valid},
      "Sampling": {5: isSamplingStep5Valid, 6: isSamplingStep6Valid},
      "Events/Activations": {5: isEventsStep5Valid, 6: isEventsStep6Valid},
      "Other": {5: isOtherStep5Valid},
    };
    const stepValidity = typeStepValidity[activityType] || {5: isOutletsValid, 6: isStep6Valid};
    if (stage >= 5 && stage < totalSteps && stepValidity[stage]) {
      if (isSponsorship && stage === 7) {
        if (!measurementMethod) setMeasurementMethod(sponsorVerification);
        if (submittedEvidence.length === 0) setSubmittedEvidence([...sponsorFinalEvidence]);
      }
      setStage(stage + 1);
      setDraftSaved(false);
      return;
    }
    if (stage === totalSteps && isStep7Valid) {
      setStage(reviewStage);
      setDraftSaved(false);
      return;
    }

  };

  const handleBack = () => {
    if (stage > 0) {
      setStage((previous) => previous - 1);
      setDivisionOpen(false);
      return;
    }

    onClose();
  };

  // Every answer in the form, as stored in the activity's answers.
  const collectRecord = () => ({
      activityType, activityName, brand, division, city, strategyPillar, activityObjective,
      startDate, endDate, accountablePerson, counterpartRequired, counterparts,
      otherCounterparts, deliveryType, externalDeliveryName, plannedBudget, ioNumber,
      poNumber, eventFormat, eventRuns, eventAttendance, eventAudience, eventExperiences, eventSamplingSale, eventSalesTracked, eventQualityAssessment,
      sponsorProperty, sponsorFit, sponsorStart, sponsorEnd, sponsorAudience, sponsorRights, sponsorRightRows, sponsorActivation, sponsorRightsFee, sponsorActivationBudget, sponsorVerification, sponsorRecall, sponsorFinalEvidence,
      tradeOutletTypes, tradeListAvailable, tradeOutletList, tradeOutletCount, tradeAssets, tradeStandard, tradeComplianceDate, tradeOutcome, tradeSalesCapture,
      ...newTypeValues,
      draughtOutlets, newOutlets, existingOutlets, activeTaps,
      equipmentReadiness, draughtJob, targetUnit, targetVolume, baselineUnit,
      baselineVolume, verifiedTrials, repeatObservation, primaryKpi, successUnit,
      successValue, measurementMethod, submittedEvidence, businessDecision,
  });

  const submitActivity = async () => {
    setBusy(true);
    setActionError("");
    try {
      const saved = await api.submit({ ...collectRecord(), stage, id: recordId || savedRecord?.id });
      localStorage.removeItem(DRAFT_STORAGE);
      setRecordId(saved.id);
      setSavedRecord(saved);
      setSubmissionTime(saved.submittedAt);
      setActivityCompleted(true);
      setDraftSaved(true);
      setStage(postStage);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadActivity = () => {
    const record = savedRecord || initialActivity;
    if (record) downloadBrandedActivityPdf(record);
  };

  const cancelActivity = async () => {
    if (!savedRecord || !window.confirm("Cancel this activity?")) return;
    setBusy(true);
    setActionError("");
    try {
      const cancelled = await api.cancel(savedRecord.id);
      setSavedRecord(cancelled);
      setActivityCancelled(true);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusy(false);
    }
  };

  // FR-101-013 / FR-101-014: the approver validates, or rejects with a mandatory reason.
  const decide = async (outcome) => {
    const comment = decisionComment.trim();
    if (outcome === "rejected" && !comment) {
      setDecisionError("A reason is required to reject this activity.");
      return;
    }
    setBusy(true);
    try {
      const updated = await api.decide(savedRecord.id, outcome === "approved" ? "validated" : "rejected", comment);
      setSavedRecord(updated);
      setDecisionComment("");
      setDecisionError("");
      if (onDecision) onDecision(updated);
    } catch (error) {
      setDecisionError(error.message);
    } finally {
      setBusy(false);
    }
  };

  // Feedback 9/11: an activity can be edited after submission or approval; editing reopens it and it must be
  // submitted again for approval. Every step stays in the history log.
  const status = savedRecord?.status;
  const canEdit = !savedRecord || status === "rejected" || status === "reopened";
  const canReopen = status === "submitted" || status === "validated";
  const lockMessage = canReopen ? "Editing sends this activity back for approval."
    : status === "reopened" ? "Being edited: submit it again to send it for approval."
    : status === "cancelled" ? "Cancelled activities can no longer be edited." : "";
  const startEditing = async (targetStage) => {
    if (canReopen) {
      if (!window.confirm("Editing sends this activity back for approval. Continue?")) return;
      setBusy(true);
      setActionError("");
      try {
        setSavedRecord(await api.reopen(savedRecord.id));
      } catch (error) {
        setActionError(error.message);
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    setActivityCompleted(false);
    setStage(targetStage);
  };
  // Home: keep unsaved work first.
  const goHome = async () => {
    if (!draftSaved && activityType && stage >= 1 && canEdit) await saveDraft(false);
    onHome();
  };
  const historyEntries = [...(savedRecord?.history || [])].reverse();
  const renderHistory = () => (
    <section className="post-history"><span>HISTORY</span>
      {historyEntries.map((entry, index) => <div key={index}>
        <strong>● {entry.event}</strong>
        <small>{[entry.by, entry.at ? new Date(entry.at).toLocaleString() : ""].filter(Boolean).join(" · ")}</small>
        {entry.comment && <small className="post-history-comment">“{entry.comment}”</small>}
        {entry.changes && <small>Changed: {Object.keys(entry.changes).join(", ")}</small>}
      </div>)}
      <button type="button" onClick={downloadActivity}>Download version ↓</button>
    </section>
  );

  const tradeSections = [
    {title: "Target outlets", rows: [
      ["Outlet types targeted", tradeOutletTypes], ["Named outlet list available", tradeListAvailable],
      ...(tradeListAvailable === "Yes" ? [["Target outlet list", tradeOutletList]] : []),
      ["Outlets targeted", tradeOutletCount]]},
    {title: "Execution and compliance", rows: [
      ["Assets or mechanics deployed", tradeAssets], ["Visibility / compliance standard", tradeStandard],
      ["Compliance check date", tradeComplianceDate]]},
    {title: "Commercial outcome", rows: [
      ["Commercial outcome", tradeOutcome], ["Direct sales or depletion captured", tradeSalesCapture]]},
  ];

  const joinValue = (...parts) => parts.filter(part => part !== "" && part !== undefined && part !== null).join(" ");
  const baseSections = [
    {title: "The activity", rows: [
      ["Activity name", activityName], ["Brand", brand], ["Division", division], ["City", city]]},
    {title: "Strategy and timing", rows: [
      ["Strategy pillar", strategyPillar], ["Main objective", activityObjective],
      ["Activity dates", `${startDate} – ${endDate}`]]},
    {title: "Ownership", rows: [
      ["Accountable owner", accountablePerson],
      ["Commercial / Trade counterpart", counterpartRequired === "not-required" ? "Not required" : [...counterparts.filter(x => x !== "Other"), ...otherCounterparts]],
      ["Delivery partner", deliveryType === "internal" ? "Internal delivery" : externalDeliveryName]]},
    {title: "Budget", rows: [
      ["Planned budget", `${(isSponsorship ? sponsorshipTotal : isMedia ? mediaTotal : Number(plannedBudget || 0)).toLocaleString("en-US")} ETB`],
      ["IO number", ioNumber], ["PO number", poNumber]]},
  ];
  const typeSectionsByType = {
    "Sponsorship": [
      {title: "The sponsored property", rows: [
        ["Sponsored property", sponsorProperty], ["Strategic fit", sponsorFit], ["Sponsorship dates", `${sponsorStart} – ${sponsorEnd}`], ["Claimed audience and evidence", sponsorAudience]]},
      {title: "Negotiated rights", rows: [
        ["Included rights", sponsorRights], ["Contracted commitments", sponsorRightRows.map(row => `${row.right}: ${row.quantity} | Evidence: ${row.evidence}`)]]},
      {title: "Activation, budget and verification", rows: [
        ["Additional activation", sponsorActivation], ["Rights fee", `${sponsorRightsFee} ETB`], ["Activation and amplification budget", `${sponsorActivationBudget} ETB`],
        ["Total sponsorship budget", `${sponsorshipTotal.toLocaleString("en-US")} ETB`], ["Rights delivery verification", sponsorVerification],
        ["Brand recall / association", sponsorRecall], ["Final payment evidence", sponsorFinalEvidence]]},
    ],
    "Trade/POS": tradeSections,
    "Events/Activations": [
      {title: "Format and audience", rows: [
        ["Activation format", eventFormat], ["Activity runs", eventRuns],
        ["Expected per run", eventAttendance], ["Primary audience", eventAudience],
        ["Participant experience", eventExperiences]]},
      {title: "Product, sales and quality", rows: [
        ["Sampling or sale", eventSamplingSale], ["Outlet sales tracked", eventSalesTracked],
        ["Quality assessment", eventQualityAssessment]]},
    ],
    "Sampling": [
      {title: "Sampling set-up", rows: [
        ["Sampling format", samplingFormat], ["Sampling days or sessions", samplingSessions],
        ["Promoters or servers", samplingPromoters], ["Samples or serves planned", samplingServes],
        ["Priority trial audience", samplingAudience]]},
      {title: "Verification and conversion", rows: [
        ["Verified trial", samplingVerifiedTrial], ["Immediate purchase measured", samplingPurchase],
        ["Samples and trials counted by", samplingCounting], ["Cost per verified trial calculated", samplingCostPerTrial]]},
    ],
    "Media/ATL": [
      {title: "Media plan", rows: [
        ["Media type", mediaTypes], ["Campaign flight dates", `${mediaFlightStart} – ${mediaFlightEnd}`],
        ["Media target audience", mediaAudience], ["Planned reach", joinValue(mediaReach, mediaReachUnit)],
        ["Planned frequency", mediaFrequency]]},
      {title: "Buying and budgets", rows: [
        ["Inventory bought", mediaInventory], ["Production budget", `${mediaProductionBudget} ETB`],
        ["Media-placement budget", `${mediaPlacementBudget} ETB`], ["Total media budget", `${mediaTotal.toLocaleString("en-US")} ETB`]]},
      {title: "Message and verification", rows: [
        ["Creative or message tested", mediaCreative], ["Reach and frequency verification", mediaVerification],
        ["Awareness, recall or association", mediaRecall]]},
    ],
    "Partnership": [
      {title: "The partner", rows: [
        ["Partner", partnerName], ["Relevance to brand and objective", partnerFit],
        ["Partner contribution", partnerContribution], ["Brand contribution", partnerBrandContribution]]},
      {title: "Audience and deliverables", rows: [
        ["Incremental audience or access", partnerAudienceNumber], ["Audience description", partnerAudienceDescription],
        ["Deliverables", partnerDeliverables.filter(row => row.deliverable.trim()).map(row => `${row.deliverable}: ${row.quantity} | Due: ${row.dueDate} | Evidence: ${row.evidence}`)]]},
      {title: "Value and evaluation", rows: [
        ["Would not happen without the partnership", partnerIncrementalValue], ["Evaluation", partnerEvaluation],
        ["Evidence to renew or expand", partnerRenewalEvidence]]},
    ],
    "Other": [
      {title: "An activity outside the types", rows: [
        ["Activity description", otherDescription], ["Behaviour or business outcome to change", otherOutcome],
        ["Source", otherSource], ["Baseline", joinValue(otherBaselineValue, otherBaselineUnit)],
        ["Approved by", otherApprover]]},
    ],
  };
  const defaultTypeSections = [
    {title: "Outlets and equipment", rows: [
      ["Draught outlets", draughtOutlets], ["New outlets", newOutlets],
      ["Existing outlets", existingOutlets], ["Active taps / towers", activeTaps],
      ["Equipment-readiness checks", equipmentReadiness]]},
    {title: "Objective, volumes and consumers", rows: [
      ["Main draught job", draughtJob], ["Target throughput", `${targetVolume} ${targetUnit}`],
      ["Pre-activity throughput", `${baselineVolume} ${baselineUnit}`],
      ["Verified trials counted", verifiedTrials === "yes" ? "Yes" : "No"],
      ["Repeat / reorder observation", repeatObservation]]},
  ];
  const summarySections = [
    ...baseSections,
    ...(typeSectionsByType[activityType] || defaultTypeSections),
    {title: "Measuring success", rows: [
      ["Primary KPI", primaryKpi], ["Success target", `${successValue} ${successUnit}`],
      ["Measurement method", measurementMethod], ...(hasEvidenceQuestion ? [["Evidence submitted", submittedEvidence]] : []),
      ["Business decision", businessDecision]]},
  ];

  const renderProgress = (step, total) => (
    <div
      className="wizard-progress"
      aria-label={`Step ${step} of ${total}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={[
            "wizard-progress-segment",
            index < step - 1 ? "completed" : "",
            index === step - 1 ? "current" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </div>
  );

  return (
    <div className="activation-page">
      {stage !== postStage && !approverMode && <header className={`activation-header ${onHome ? "with-home" : ""}`}>
        {onHome && <button type="button" className="activation-home-button" onClick={goHome} aria-label="Go to the home page">
          <Icon name="home" size={19} />
        </button>}
        <button
          className="save-draft-button"
          type="button"
          onClick={() => saveDraft(false)}
        >
          {draftSaved ? "Saved" : "Save in draft"}
          <Icon name="edit" size={16} />
        </button>
      </header>}

      {stage === postStage ? (
        <main className="post-submit-page">
          <button type="button" className="post-back" onClick={onClose}>{approverMode ? "← Back to the list" : "← Back"}</button>
          <div className="post-tabs" role="tablist" aria-label="Activity information">
            <button type="button" role="tab" aria-selected={detailTab === "details"} className={detailTab === "details" ? "selected" : ""} onClick={() => setDetailTab("details")}>Activity details</button>
            <button type="button" role="tab" aria-selected={detailTab === "reports"} className={detailTab === "reports" ? "selected" : ""} onClick={() => setDetailTab("reports")}>Reports</button>
          </div>
          {detailTab === "details" ? <>
            <section className="post-hero">
              <div className="post-hero-top"><span className="post-pill">{activityType}</span><span className={`post-status ${statusClass(savedRecord?.status)}`}>{statusLabel(savedRecord?.status)}</span></div>
              <span className="post-code">{savedRecord?.code || ""}</span>
              <h1>{activityName || "Untitled activity"}</h1>
              <p>◷ {startDate} – {endDate}</p>
              <p>◎ {city || division.join(", ")}</p>
              <p>◷ Last updated: {submissionTime ? new Date(submissionTime).toLocaleString() : "—"}</p>
              <button type="button" onClick={downloadActivity}>Download activity <span>↓</span></button>
            </section>
            {actionError && <p className="post-action-error" role="alert">{actionError}</p>}
            {savedRecord?.decision && <section className={`post-decision-note ${savedRecord.decision.outcome}`} role="status">
              <strong>{savedRecord.decision.outcome === "approved" ? "Approved" : "Rejected"} by {savedRecord.decision.by}</strong>
              <small>{new Date(savedRecord.decision.at).toLocaleString()}</small>
              {savedRecord.decision.comment && <p>{savedRecord.decision.comment}</p>}
              {savedRecord.decision.outcome === "rejected" && !approverMode && <p className="post-decision-hint">Edit the activity and submit it again.</p>}
            </section>}
            {summarySections.map((section, index) => <section className="post-section" key={section.title}>
              <div className="post-section-head"><div><span className="post-index">{String(index + 1).padStart(2, "0")}</span><strong>{section.title}</strong></div>{(canEdit || canReopen) && !approverMode && <button type="button" disabled={busy} onClick={() => startEditing(index + 1)}><Icon name="edit" size={12}/> Edit</button>}</div>
              {section.rows.map(([label, value]) => <div className="post-data-row" key={label}><span>{label}</span><div>{Array.isArray(value) ? (value.length ? value.map(v => <span className="post-chip" key={v}>{v}</span>) : "—") : (value || "—")}</div></div>)}
            </section>)}
            {renderHistory()}
            {approverMode ? (savedRecord?.status === "submitted" && <section className="post-decision">
              <label htmlFor="decisionComment">Comment</label>
              <textarea id="decisionComment" rows={3} placeholder="Required when rejecting" value={decisionComment} onChange={e => {setDecisionComment(e.target.value); setDecisionError("");}} />
              {decisionError && <p className="field-error" role="alert">{decisionError}</p>}
              <div className="post-decision-actions">
                <button type="button" className="post-reject" disabled={busy} onClick={() => decide("rejected")}>Reject</button>
                <button type="button" className="post-approve" disabled={busy} onClick={() => decide("approved")}>Approve</button>
              </div>
            </section>) : <>
              {lockMessage && <p className="post-lock-note">{lockMessage}</p>}
              <div className="post-actions"><button type="button" disabled={activityCancelled || busy} onClick={cancelActivity}>Cancel ♧</button><button type="button" disabled={!(canEdit || canReopen) || busy} onClick={() => startEditing(reviewStage)}>Edit <Icon name="edit" size={13}/></button></div>
            </>}
          </> : <>
            <span className="post-overline">RESULT</span>
            <section className="post-report-empty"><strong>Not recorded yet</strong><p>Click the button below to submit the report of this activity.</p><button type="button" disabled>Record the result →</button><small>The result can be recorded once the activity is approved and has started.</small></section>
            {renderHistory()}
          </>}
        </main>
      ) : stage === reviewStage ? (
        <>
          <main className="review-content">
            <div className="review-heading">
              <div className="review-heading-line"><h1>REVIEW AND SUBMIT</h1><span>✓ {totalSteps} steps completed</span></div>
              <p>Check the details below. Use Edit to update a section before your final submission.</p>
            </div>
            <div className="review-hero">
              <span className="review-type">{activityType || "Activity"}</span>
              <h2>{activityName || "Untitled activity"}</h2>
              <span className="review-location">◎ {division.join(", ") || city || "Not specified"}</span>
            </div>
            {summarySections.map((section, index) => (
              <section className="review-section" key={section.title}>
                <div className="review-section-heading">
                  <div><span className="review-index">{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
                  <button type="button" className="review-edit" onClick={() => {setStage(index + 1); setActivityCompleted(false);}}><Icon name="edit" size={12} /> Edit</button>
                </div>
                {section.rows.map(([label, value]) => (
                  <div className="review-row" key={label}>
                    <span className="review-row-label">{label}</span>
                    <div className="review-row-value">
                      {Array.isArray(value) ? (value.length ? value.map(v => <span className="review-chip" key={v}>{v}</span>) : "—") : (value || "—")}
                    </div>
                  </div>
                ))}
              </section>
            ))}
            {activityCompleted && <div className="review-confirmation" role="status"><strong>Activity submitted.</strong><p>It is now waiting for a decision.</p></div>}
            {actionError && <p className="post-action-error" role="alert">{actionError}</p>}
          </main>
          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19} /></button>
            <button className="wizard-continue-button" type="button" disabled={activityCompleted || busy} onClick={submitActivity}>{activityCompleted ? "Submitted" : busy ? "Submitting…" : "Submit activity"} <Icon name="arrow" size={16} /></button>
            <span className="review-footer-note">{draftOffline ? "Not synced — kept on this phone until you are online." : "Your draft stays saved until you submit."}</span>
          </footer>
        </>
      ) : stage === 0 ? (

        <>
          <main className="activation-content">
            <section className="activity-type-question">
              <h2>
                What type of activity is this?
                <span className="required-mark"> *</span>
              </h2>

              <div className="activity-type-options">
                {activityTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`activity-type-option ${
                      activityType === type ? "selected" : ""
                    }`}
                    aria-pressed={activityType === type}
                    onClick={() => {
                      setActivityType(type);
                      setDraftSaved(false);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>
          </main>

          <footer className="wizard-footer">
            <button
              className="wizard-back-button"
              type="button"
              onClick={handleBack}
              aria-label="Go back"
            >
              <Icon name="back" size={19} />
            </button>

            <button
              className="wizard-continue-button"
              type="button"
              disabled={!activityType}
              onClick={handleContinue}
            >
              Continue <Icon name="arrow" size={16} />
            </button>
          </footer>
        </>
      ) : stage === 1 ? (
        <>
          <main className="activation-content activity-details-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>

            <section className="wizard-step-card">
              {renderProgress(1, totalSteps)}
              <p className="wizard-step-count">STEP 1 OF {totalSteps}</p>
              <h2>The activity</h2>
            </section>

            <p className="draft-storage-note">{saveNote}</p>

            <form
              className="activity-details-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="form-field">
                <label htmlFor="activityName">
                  What is the name of the activity?
                  <span className="required-mark"> *</span>
                </label>

                <input
                  id="activityName"
                  name="activityName"
                  type="text"
                  value={activityName}
                  onChange={(event) => {
                    setActivityName(event.target.value);
                    setDraftSaved(false);
                  }}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="activityBrand">
                  Which brand is this activity for?
                  <span className="required-mark"> *</span>
                </label>

                <select
                  id="activityBrand"
                  name="brand"
                  value={brand}
                  onChange={(event) => {
                    setBrand(event.target.value);
                    setDraftSaved(false);
                  }}
                  required
                >
                  <option value="">Select</option>
                  {brands.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field division-field">
                <label id="division-label">
                  Which Division?
                  <span className="required-mark"> *</span>
                </label>

                <div className="division-dropdown">
                  <button
                    type="button"
                    className="division-dropdown-trigger"
                    aria-expanded={divisionOpen}
                    aria-haspopup="listbox"
                    aria-labelledby="division-label"
                    onClick={() => setDivisionOpen((previous) => !previous)}
                  >
                    <span>
                      {division.length > 0 ? division.join(", ") : "Select"}
                    </span>

                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {divisionOpen && (
                    <div
                      className="division-dropdown-menu"
                      role="group"
                      aria-labelledby="division-label"
                    >
                      {divisions.map((item) => (
                        <label
                          key={item}
                          className="division-dropdown-option"
                        >
                          <input
                            type="checkbox"
                            checked={division.includes(item)}
                            onChange={(event) => {
                              // National is exclusive: it replaces the other divisions, and they replace it.
                              const next = !event.target.checked
                                ? division.filter((value) => value !== item)
                                : item === NATIONAL ? [NATIONAL]
                                : [...division.filter((value) => value !== NATIONAL), item];
                              setDivision(next);
                              if (next.includes(NATIONAL)) setCity(NATIONAL);
                              else if (city === NATIONAL) setCity("");
                              else if (city && divisionsAllMapped(divisionCities, next) && !citiesFor(divisionCities, next).includes(city)) setCity("");
                              setDraftSaved(false);
                            }}
                          />
                          <span>{item}</span>
                        </label>
                      ))}

                      <button
                        type="button"
                        className="division-dropdown-done"
                        onClick={() => setDivisionOpen(false)}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="activityCity">
                  Which City?
                  <span className="required-mark"> *</span>
                </label>

                <input
                  id="activityCity"
                  name="city"
                  type="text"
                  list="ethiopian-cities"
                  value={city}
                  readOnly={division.includes(NATIONAL)}
                  className={division.includes(NATIONAL) ? "city-national" : undefined}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setDraftSaved(false);
                  }}
                  placeholder="Select or enter a city"
                  autoComplete="off"
                  required
                />

                {division.includes(NATIONAL) && <p className="field-help">National activity: it covers all cities.</p>}
                <datalist id="ethiopian-cities">
                  {citiesFor(divisionCities, division).map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </form>
          </main>

          <footer className="wizard-footer">
            <button
              className="wizard-back-button"
              type="button"
              onClick={handleBack}
              aria-label="Go back"
            >
              <Icon name="back" size={19} />
            </button>

            <button
              className="wizard-continue-button"
              type="button"
              disabled={!isActivityDetailsValid}
              onClick={handleContinue}
            >
              Continue <Icon name="arrow" size={16} />
            </button>
          </footer>
        </>
      ) : stage === 2 ? (
        <>
          <main className="activation-content activity-details-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>

            <section className="wizard-step-card">
              {renderProgress(2, totalSteps)}
              <p className="wizard-step-count">STEP 2 OF {totalSteps}</p>
              <h2>Strategy and timing</h2>
            </section>

            <p className="draft-storage-note">
              {saveNote}
            </p>

            <form
              className="activity-details-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="form-field">
                <label htmlFor="strategyPillar">
                  Which 2026 strategy pillar does the activity support?
                  <span className="required-mark"> *</span>
                </label>

                <select
                  id="strategyPillar"
                  name="strategyPillar"
                  value={strategyPillar}
                  onChange={(event) => {
                    setStrategyPillar(event.target.value);
                    setDraftSaved(false);
                  }}
                  required
                >
                  <option value="">Select</option>
                  {strategyPillars.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="activityObjective">
                  What is the main objective of the activity?
                  <span className="required-mark"> *</span>
                </label>

                <select
                  id="activityObjective"
                  name="activityObjective"
                  value={activityObjective}
                  onChange={(event) => {
                    setActivityObjective(event.target.value);
                    setDraftSaved(false);
                  }}
                  required
                >
                  <option value="">Select</option>
                  {activityObjectives.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="startDate">
                  When will the activity start?
                  <span className="required-mark"> *</span>
                </label>

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setDraftSaved(false);
                  }}
                  max={endDate || undefined}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="endDate">
                  When will the activity end?
                  <span className="required-mark"> *</span>
                </label>

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setDraftSaved(false);
                  }}
                  min={startDate || undefined}
                  required
                />
              </div>
            </form>
          </main>

          <footer className="wizard-footer">
            <button
              className="wizard-back-button"
              type="button"
              onClick={handleBack}
              aria-label="Go back"
            >
              <Icon name="back" size={19} />
            </button>

            <button
              className="wizard-continue-button"
              type="button"
              disabled={!isStrategyTimingValid}
              onClick={handleContinue}
            >
              Continue <Icon name="arrow" size={16} />
            </button>
          </footer>
        </>
      ) : stage === totalSteps ? (
        <>
          <main className="activation-content activity-details-content step7-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>
            <section className="wizard-step-card">
              {renderProgress(totalSteps, totalSteps)}
              <p className="wizard-step-count">STEP {totalSteps} OF {totalSteps}</p>
              <h2>Measuring success</h2>
            </section>
            <p className="draft-storage-note">{saveNote}</p>
            {activityCompleted ? (
              <div className="step7-completed" role="status">
                <h2>Activity completed</h2>
                <p>The activity has been saved in this browser. It has not been submitted to a server.</p>
                <button type="button" onClick={() => setActivityCompleted(false)}>Review Step 7</button>
              </div>
            ) : (
              <form className="activity-details-form step7-form" onSubmit={event => event.preventDefault()}>
                <div className="form-field">
                  <label htmlFor="primaryKpi">What single KPI will determine whether the activity succeeded? <span className="required-mark">*</span></label>
                  <select id="primaryKpi" value={primaryKpi} onChange={e => {setPrimaryKpi(e.target.value); setDraftSaved(false);}} required>
                    <option value="">Select KPI</option>
                    {kpiOptions.map((item, i) => <option key={item} value={item}>{item}{i < 2 ? " (Recommended)" : ""}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="successValue">What result will define success? (Number + Unit) <span className="required-mark">*</span></label>
                  <div className="step7-value-row">
                    <select aria-label="Success target unit" value={successUnit} onChange={e => {setSuccessUnit(e.target.value); setDraftSaved(false);}} required>
                      <option value="">Unit</option>
                      {!isEightStep && volumeUnits.map(item => <option key={item} value={item}>{item}</option>)}
                      {isEightStep && <><option value="%">%</option><option value="Rights">Rights</option><option value="People">People</option><option value="Score">Score</option></>}
                      <option value="Taps">Taps</option>
                      <option value="Outlets">Outlets</option>
                      <option value="Trials">Trials</option>
                      <option value="Reorders">Reorders</option>
                      <option value="%">%</option>
                    </select>
                    <input id="successValue" type="number" min="0" step="any" inputMode="decimal" value={successValue} onChange={e => {setSuccessValue(e.target.value); setDraftSaved(false);}} required />
                  </div>
                </div>
                <div className="form-field step7-dropdown-field">
                  <label>How will the primary KPI be measured? <span className="required-mark">*</span></label>
                  <button type="button" className="step7-dropdown-trigger" aria-expanded={measurementOpen} onClick={() => {setMeasurementOpen(v => !v); setEvidenceOpen(false); setDecisionOpen(false);}}>
                    <span>{measurementMethod || "Select"}</span><span>{measurementOpen ? "⌃" : "⌄"}</span>
                  </button>
                  {measurementOpen && <div className="step7-dropdown-menu">
                    <input aria-label="Search measurement methods" placeholder="⌕  Search" value={measurementSearch} onChange={e => setMeasurementSearch(e.target.value)} />
                    <div className="step7-dropdown-scroll">{(isSponsorship ? sponsorshipVerificationOptions : MEASUREMENT_OPTIONS).filter(x => x.toLowerCase().includes(measurementSearch.toLowerCase())).map(x => <button type="button" key={x} onClick={() => {setMeasurementMethod(x); setMeasurementOpen(false); setDraftSaved(false);}}>{x}</button>)}</div>
                  </div>}
                </div>
                {hasEvidenceQuestion && <div className="form-field step7-dropdown-field">
                  <label>{evidenceLabel} <span className="required-mark">*</span></label>
                  <button type="button" className="step7-dropdown-trigger" aria-expanded={evidenceOpen} onClick={() => {setEvidenceOpen(v => !v); setMeasurementOpen(false); setDecisionOpen(false);}}>
                    <span>{submittedEvidence.length ? `${submittedEvidence.length} selected` : "Select"}</span><span>{evidenceOpen ? "⌃" : "⌄"}</span>
                  </button>
                  {evidenceOpen && <div className="step7-dropdown-menu">
                    <input aria-label="Search evidence" placeholder="⌕  Search" value={evidenceSearch} onChange={e => setEvidenceSearch(e.target.value)} />
                    <div className="step7-dropdown-scroll">
                      <label className="step7-checkbox-option"><input type="checkbox" checked={submittedEvidence.length === evidenceOptions.length} onChange={e => {setSubmittedEvidence(e.target.checked ? [...evidenceOptions] : []); setDraftSaved(false);}} />Select all</label>
                      {evidenceOptions.filter(x => x.toLowerCase().includes(evidenceSearch.toLowerCase())).map(x => <label key={x} className="step7-checkbox-option"><input type="checkbox" checked={submittedEvidence.includes(x)} onChange={e => {setSubmittedEvidence(prev => e.target.checked ? [...prev, x] : prev.filter(v => v !== x)); setDraftSaved(false);}} />{x}</label>)}
                    </div>
                  </div>}
                </div>}
                <div className="form-field step7-dropdown-field">
                  <label>If this activity succeeds, what decision should the evidence help the business make?</label>
                  <button type="button" className="step7-dropdown-trigger" aria-expanded={decisionOpen} onClick={() => {setDecisionOpen(v => !v); setEvidenceOpen(false); setMeasurementOpen(false);}}>
                    <span>{businessDecision || "Select"}</span><span>{decisionOpen ? "⌃" : "⌄"}</span>
                  </button>
                  {decisionOpen && <div className="step7-dropdown-menu">
                    <input aria-label="Search business decisions" placeholder="⌕  Search" value={decisionSearch} onChange={e => setDecisionSearch(e.target.value)} />
                    <div className="step7-dropdown-scroll">{businessDecisions.filter(x => x.toLowerCase().includes(decisionSearch.toLowerCase())).map(x => <button type="button" key={x} onClick={() => {setBusinessDecision(x); setDecisionOpen(false); setDraftSaved(false);}}>{x}</button>)}</div>
                  </div>}
                </div>
              </form>
            )}
          </main>
          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19} /></button>
            <button className="wizard-continue-button" type="button" disabled={!isStep7Valid || activityCompleted} onClick={handleContinue}>{activityCompleted ? "Saved" : "Continue"} <Icon name="arrow" size={16} /></button>
          </footer>
        </>
      ) : stage === 7 && isSponsorship ? sponsorshipStep(7, "Activation, budget and verification", <>
        {sponsorField("sponsorActivation", "What additional activation will Habesha execute beyond the sponsorship fee?", sponsorActivation, setSponsorActivation, "Planned brand activation and amplification", true)}
        {sponsorCurrency("sponsorRightsFee", "What is the rights fee?", sponsorRightsFee, setSponsorRightsFee)}
        {sponsorCurrency("sponsorActivationBudget", "What is the activation and amplification budget?", sponsorActivationBudget, setSponsorActivationBudget)}
        <div className="sponsor-total"><span>Combined sponsorship budget (calculated)</span><strong>{sponsorshipTotal.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2})} ETB</strong></div>
        {sponsorSelect("sponsorVerification", "How will rights delivery be verified?", sponsorVerification, setSponsorVerification, sponsorshipVerificationOptions)}
        {sponsorSelect("sponsorRecall", "Will brand recall or association be measured?", sponsorRecall, setSponsorRecall, sponsorshipRecallOptions)}
        {sponsorMultiSelect("What must the sponsor or rights holder submit before final payment?", sponsorshipEvidenceOptions, sponsorFinalEvidence, setSponsorFinalEvidence)}
      </>, isSponsorshipStep7Valid)
      : stage === 6 && isSponsorship ? sponsorshipStep(6, "Negotiated rights", <>
        {sponsorMultiSelect("Which sponsorship rights are included?", sponsorshipRightsOptions, sponsorRights, value => {
          setSponsorRights(value);
          const next = typeof value === "function" ? value(sponsorRights) : value;
          setSponsorRightRows(rows => {
            const retained = rows.filter(row => next.includes(row.right));
            return retained.length ? retained : [{right:"", evidence:"", quantity:""}];
          });
        })}
        <div className="sponsor-rights-heading">What quantity or standard is committed for each right?</div>
        {sponsorRightRows.map((row, index) => <div className="sponsor-right-row" key={index}>
          <div className="sponsor-right-row-top"><strong>Right {index + 1}</strong><button type="button" className="sponsor-delete" onClick={() => {setSponsorRightRows(rows => rows.length === 1 ? [{right:"",evidence:"",quantity:""}] : rows.filter((_,i) => i !== index));setDraftSaved(false);}}>− Delete</button></div>
          <div className="form-field"><label htmlFor={`sponsorRight${index}`}>Right <span className="required-mark">*</span></label><select id={`sponsorRight${index}`} value={row.right} onChange={e => updateSponsorRightRow(index,"right",e.target.value)} required><option value="">Select</option>{sponsorRights.filter(right => right === row.right || !sponsorRightRows.some((r,i) => i !== index && r.right === right)).map(right => <option key={right}>{right}</option>)}</select></div>
          <div className="form-field"><label htmlFor={`sponsorEvidence${index}`}>Evidence required <span className="required-mark">*</span></label><input id={`sponsorEvidence${index}`} value={row.evidence} onChange={e => updateSponsorRightRow(index,"evidence",e.target.value)} required /></div>
          <div className="form-field"><label htmlFor={`sponsorQuantity${index}`}>Contracted quantity/standard <span className="required-mark">*</span></label><input id={`sponsorQuantity${index}`} value={row.quantity} onChange={e => updateSponsorRightRow(index,"quantity",e.target.value)} required /></div>
        </div>)}
        <button type="button" className="sponsor-add" disabled={sponsorRightRows.length >= sponsorRights.length} onClick={() => {setSponsorRightRows(rows => [...rows,{right:"",evidence:"",quantity:""}]);setDraftSaved(false);}}>+ Add</button>
        {sponsorRights.length > 0 && <p className="sponsor-helper">Enter one completed commitment for each selected right.</p>}
      </>, isSponsorshipStep6Valid)
      : stage === 5 && isSponsorship ? sponsorshipStep(5, "The sponsored property", <>
        {sponsorField("sponsorProperty", "What property, event, team or platform is being sponsored?", sponsorProperty, setSponsorProperty, "Write here")}
        {sponsorField("sponsorFit", "Why is this sponsorship the right fit for the brand and objective?", sponsorFit, setSponsorFit, "State the audience and brand fit", true)}
        <div className="form-field"><label htmlFor="sponsorStart">What is the sponsorship start date? <span className="required-mark">*</span></label><input id="sponsorStart" type="date" value={sponsorStart} max={sponsorEnd || undefined} onChange={e => {setSponsorStart(e.target.value);setDraftSaved(false);}} required /></div>
        <div className="form-field"><label htmlFor="sponsorEnd">What is the sponsorship end date? <span className="required-mark">*</span></label><input id="sponsorEnd" type="date" value={sponsorEnd} min={sponsorStart || undefined} onChange={e => {setSponsorEnd(e.target.value);setDraftSaved(false);}} required /></div>
        {sponsorField("sponsorAudience", "What audience does the property claim to deliver, and on what evidence?", sponsorAudience, setSponsorAudience, "Describe audience and estimated size", true)}
      </>, isSponsorshipStep5Valid)
      : stage === 5 && isTradePos ? sponsorshipStep(5, "Target outlets", <>
        {sponsorMultiSelect("What outlet types are targeted?", tradeOutletTypeOptions, tradeOutletTypes, setTradeOutletTypes)}
        {sponsorSelect("tradeListAvailable", "Is the named outlet list available?", tradeListAvailable, value => {setTradeListAvailable(value); if (value !== "Yes") setTradeOutletList("");}, ["Yes", "No"])}
        {tradeListAvailable === "Yes" && <div className="form-field trade-list-field">
          <label htmlFor="tradeOutletList">Upload or reference the target outlet list. <span className="required-mark">*</span></label>
          <input id="tradeOutletListFile" type="file" aria-label="Upload target outlet list" onChange={e => {const file = e.target.files?.[0]; if (file) {setTradeOutletList(file.name); setDraftSaved(false);}}} />
          <input id="tradeOutletList" type="text" placeholder="File or list reference" value={tradeOutletList} onChange={e => {setTradeOutletList(e.target.value); setDraftSaved(false);}} required />
        </div>}
        <div className="form-field">
          <label htmlFor="tradeOutletCount">How many outlets are targeted? <span className="required-mark">*</span></label>
          <input id="tradeOutletCount" type="number" min="0" step="1" inputMode="numeric" value={tradeOutletCount} onChange={e => {setTradeOutletCount(e.target.value); setDraftSaved(false);}} required />
        </div>
      </>, isTradeStep5Valid)
      : stage === 6 && isTradePos ? sponsorshipStep(6, "Execution and compliance", <>
        {sponsorMultiSelect("Which assets or mechanics will be deployed?", tradeAssetOptions, tradeAssets, setTradeAssets)}
        {sponsorField("tradeStandard", "What is the visibility or compliance standard for a successful outlet?", tradeStandard, setTradeStandard, "Define the minimum execution standard", true)}
        <div className="form-field">
          <label htmlFor="tradeComplianceDate">When will post-implementation compliance be checked? <span className="required-mark">*</span></label>
          <input id="tradeComplianceDate" type="date" value={tradeComplianceDate} onChange={e => {setTradeComplianceDate(e.target.value); setDraftSaved(false);}} required />
        </div>
      </>, isTradeStep6Valid)
      : stage === 7 && isTradePos ? sponsorshipStep(7, "Commercial outcome", <>
        {sponsorSelect("tradeOutcome", "What commercial outcome should change?", tradeOutcome, setTradeOutcome, tradeOutcomeOptions)}
        {sponsorSelect("tradeSalesCapture", "Will direct sales or depletion be captured?", tradeSalesCapture, setTradeSalesCapture, tradeSalesCaptureOptions)}
      </>, isTradeStep7Valid)
      : stage === 5 && isSampling ? sponsorshipStep(5, "Sampling set-up", <>
        {sponsorSelect("samplingFormat", "What sampling format will be used?", samplingFormat, setSamplingFormat, samplingFormatOptions)}
        {wholeNumberField("samplingSessions", "How many sampling days or sessions are planned?", samplingSessions, setSamplingSessions)}
        {wholeNumberField("samplingPromoters", "How many promoters or servers will participate?", samplingPromoters, setSamplingPromoters)}
        {wholeNumberField("samplingServes", "How many samples or serves are planned?", samplingServes, setSamplingServes)}
        {sponsorField("samplingAudience", "Who is the priority trial audience?", samplingAudience, setSamplingAudience, "State the audience and brand fit", true)}
      </>, isSamplingStep5Valid)
      : stage === 6 && isSampling ? sponsorshipStep(6, "Verification and conversion", <>
        {sponsorSelect("samplingVerifiedTrial", "What counts as a verified trial?", samplingVerifiedTrial, setSamplingVerifiedTrial, samplingVerifiedOptions)}
        {sponsorSelect("samplingPurchase", "Will immediate purchase be measured?", samplingPurchase, setSamplingPurchase, samplingPurchaseOptions)}
        {sponsorSelect("samplingCounting", "How will samples and trials be counted?", samplingCounting, setSamplingCounting, samplingCountingOptions)}
        <fieldset className="step6-trials">
          <legend>Will cost per verified trial be calculated? <span className="required-mark">*</span></legend>
          <label><input type="radio" name="samplingCostPerTrial" checked={samplingCostPerTrial === "Yes"} onChange={() => {setSamplingCostPerTrial("Yes"); setDraftSaved(false);}} /> Yes</label>
          <label><input type="radio" name="samplingCostPerTrial" checked={samplingCostPerTrial === "No"} onChange={() => {setSamplingCostPerTrial("No"); setDraftSaved(false);}} /> No</label>
        </fieldset>
      </>, isSamplingStep6Valid)
      : stage === 5 && isMedia ? sponsorshipStep(5, "Media plan", <>
        {sponsorMultiSelect("Which media type will be used?", mediaTypeOptions, mediaTypes, setMediaTypes)}
        <div className="type-field-group">
          <p className="type-group-heading type-group-heading-large">What are the campaign flight dates?</p>
          <div className="outlets-breakdown-grid">
            <div className="form-field">
              <label htmlFor="mediaFlightStart">Start date <span className="required-mark">*</span></label>
              <input id="mediaFlightStart" type="date" value={mediaFlightStart} max={mediaFlightEnd || undefined} onChange={e => {setMediaFlightStart(e.target.value); setDraftSaved(false);}} required />
            </div>
            <div className="form-field">
              <label htmlFor="mediaFlightEnd">End date <span className="required-mark">*</span></label>
              <input id="mediaFlightEnd" type="date" value={mediaFlightEnd} min={mediaFlightStart || undefined} onChange={e => {setMediaFlightEnd(e.target.value); setDraftSaved(false);}} required />
            </div>
          </div>
        </div>
        {sponsorField("mediaAudience", "Who is the media target audience?", mediaAudience, setMediaAudience, "Write here...", true)}
        <div className="form-field">
          <label htmlFor="mediaReach">What reach is planned? <span className="required-mark">*</span></label>
          <div className="step7-value-row">
            <select aria-label="Reach unit" value={mediaReachUnit} onChange={e => {setMediaReachUnit(e.target.value); setDraftSaved(false);}} required>
              <option value="">Unit</option>
              {mediaReachUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </select>
            <input id="mediaReach" type="number" min="0" step="any" inputMode="decimal" value={mediaReach} onChange={e => {setMediaReach(e.target.value); setDraftSaved(false);}} required />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="mediaFrequency">What frequency is planned?</label>
          <input id="mediaFrequency" type="number" min="0" step="any" inputMode="decimal" value={mediaFrequency} onChange={e => {setMediaFrequency(e.target.value); setDraftSaved(false);}} />
        </div>
      </>, isMediaStep5Valid)
      : stage === 6 && isMedia ? sponsorshipStep(6, "Buying and budgets", <>
        {sponsorField("mediaInventory", "What inventory is being bought?", mediaInventory, setMediaInventory, "Write here...", true)}
        {sponsorCurrency("mediaProductionBudget", "What is the production budget?", mediaProductionBudget, setMediaProductionBudget)}
        {sponsorCurrency("mediaPlacementBudget", "What is the media-placement budget?", mediaPlacementBudget, setMediaPlacementBudget)}
      </>, isMediaStep6Valid)
      : stage === 7 && isMedia ? sponsorshipStep(7, "Message and verification", <>
        {sponsorField("mediaCreative", "What creative or message is being tested?", mediaCreative, setMediaCreative, "Write here...", true)}
        {sponsorSelect("mediaVerification", "How will delivered reach and frequency be verified?", mediaVerification, setMediaVerification, mediaVerificationOptions)}
        {sponsorSelect("mediaRecall", "Will awareness, recall or association be measured?", mediaRecall, setMediaRecall, mediaRecallOptions)}
      </>, isMediaStep7Valid)
      : stage === 5 && isPartnership ? sponsorshipStep(5, "The partner", <>
        <div className="form-field">
          <label htmlFor="partnerName">Who is the partner? <span className="required-mark">*</span></label>
          <input id="partnerName" type="text" placeholder="Write here..." className={partnerNameTouched && !partnerName.trim() ? "is-invalid" : ""} value={partnerName} onChange={e => {setPartnerName(e.target.value); setDraftSaved(false);}} onBlur={() => setPartnerNameTouched(true)} required />
          {partnerNameTouched && !partnerName.trim() && <p className="field-error">This field is required.</p>}
        </div>
        {sponsorField("partnerFit", "Why is this partner relevant to the brand and objective?", partnerFit, setPartnerFit, "Write here...", true)}
        {sponsorMultiSelect("What contribution will the partner provide?", partnerContributionOptions, partnerContribution, setPartnerContribution)}
        {sponsorMultiSelect("What will the brand contribute?", partnerBrandContributionOptions, partnerBrandContribution, setPartnerBrandContribution)}
      </>, isPartnerStep5Valid)
      : stage === 6 && isPartnership ? sponsorshipStep(6, "Audience and deliverables", <>
        <div className="type-field-group">
          <p className="type-group-heading">What incremental audience or access will the partnership create?</p>
          {wholeNumberField("partnerAudienceNumber", "Number", partnerAudienceNumber, setPartnerAudienceNumber)}
          {sponsorField("partnerAudienceDescription", "Description", partnerAudienceDescription, setPartnerAudienceDescription, "Write here...", true)}
        </div>
        <div className="type-field-group">
          <p className="type-group-heading">What exact deliverables must the partner provide?</p>
          {partnerDeliverables.map((row, index) => <div className="partner-deliverable-row" key={index}>
            <div className="partner-deliverable-top"><button type="button" className="sponsor-delete" onClick={() => {setPartnerDeliverables(rows => rows.length === 1 ? [{...emptyDeliverable}] : rows.filter((_, i) => i !== index)); setDraftSaved(false);}}>− Delete</button></div>
            <div className="form-field"><label htmlFor={`partnerDeliverable${index}`}>Deliverable <span className="required-mark">*</span></label><input id={`partnerDeliverable${index}`} type="text" placeholder="write here..." value={row.deliverable} onChange={e => updatePartnerDeliverable(index, "deliverable", e.target.value)} required /></div>
            <div className="form-field"><label htmlFor={`partnerQuantity${index}`}>Quantity <span className="required-mark">*</span></label><input id={`partnerQuantity${index}`} type="text" value={row.quantity} onChange={e => updatePartnerDeliverable(index, "quantity", e.target.value)} required /></div>
            <div className="form-field"><label htmlFor={`partnerDueDate${index}`}>Due date <span className="required-mark">*</span></label><input id={`partnerDueDate${index}`} type="date" value={row.dueDate} onChange={e => updatePartnerDeliverable(index, "dueDate", e.target.value)} required /></div>
            <div className="form-field"><label htmlFor={`partnerEvidence${index}`}>Evidence <span className="required-mark">*</span></label><input id={`partnerEvidence${index}`} type="text" placeholder="write here..." value={row.evidence} onChange={e => updatePartnerDeliverable(index, "evidence", e.target.value)} required /></div>
          </div>)}
          <button type="button" className="sponsor-add" onClick={() => {setPartnerDeliverables(rows => [...rows, {...emptyDeliverable}]); setDraftSaved(false);}}>+ Add</button>
        </div>
      </>, isPartnerStep6Valid)
      : stage === 7 && isPartnership ? sponsorshipStep(7, "Value and evaluation", <>
        {sponsorField("partnerIncrementalValue", "What would not happen without this partnership?", partnerIncrementalValue, setPartnerIncrementalValue, "Write here...", true)}
        {sponsorMultiSelect("How will the partnership be evaluated?", partnerEvaluationOptions, partnerEvaluation, setPartnerEvaluation)}
        {sponsorField("partnerRenewalEvidence", "What evidence is required to renew or expand?", partnerRenewalEvidence, setPartnerRenewalEvidence, "Write here...", true)}
      </>, isPartnerStep7Valid)
      : stage === 5 && isOther ? sponsorshipStep(5, "An activity outside the types", <>
        {sponsorField("otherDescription", "Describe the activity and why it does not fit an existing activity type.", otherDescription, setOtherDescription, "Write here...", true)}
        {sponsorField("otherOutcome", "What behaviour or business outcome should change?", otherOutcome, setOtherOutcome, "Write here...", true)}
        {sponsorField("otherSource", "What is the source?", otherSource, setOtherSource, "...")}
        <div className="form-field">
          <label htmlFor="otherBaselineValue">What is the baseline unit and value? <span className="required-mark">*</span></label>
          <div className="step7-value-row">
            <input aria-label="Baseline unit" type="text" placeholder="Unit" value={otherBaselineUnit} onChange={e => {setOtherBaselineUnit(e.target.value); setDraftSaved(false);}} required />
            <input id="otherBaselineValue" type="number" step="any" inputMode="decimal" value={otherBaselineValue} onChange={e => {setOtherBaselineValue(e.target.value); setDraftSaved(false);}} required />
          </div>
        </div>
        <div className="form-field person-select">
          <label htmlFor="otherApprover">Who has approved the custom activity type and KPI? <span className="required-mark">*</span></label>
          <select id="otherApprover" value={otherApprover} onChange={e => {setOtherApprover(e.target.value); setDraftSaved(false);}} required>
            <option value="">Select</option>
            {accountablePeople.map(person => <option key={person} value={person}>{person}</option>)}
          </select>
        </div>
      </>, isOtherStep5Valid)
      : stage === 6 && activityType === "Events/Activations" ? (
        <>
          <main className="activation-content activity-details-content step6-content events-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>
            <section className="wizard-step-card">
              {renderProgress(6, 7)}
              <p className="wizard-step-count">STEP 6 OF 7</p>
              <h2>Product, sales and quality</h2>
            </section>
            <p className="draft-storage-note">{saveNote}</p>
            <form className="activity-details-form step6-form" onSubmit={e => e.preventDefault()}>
              <div className="form-field">
                <label htmlFor="eventSamplingSale">Will product sampling or sale take place? <span className="required-mark">*</span></label>
                <select id="eventSamplingSale" value={eventSamplingSale} onChange={e => {setEventSamplingSale(e.target.value);setDraftSaved(false);}} required>
                  <option value="">Select</option>
                  {eventSamplingOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <fieldset className="step6-trials" style={{border:0, padding:0, margin:0}}>
                <legend>Will outlet sales or depletion be tracked? <span className="required-mark">*</span></legend>
                <label><input type="radio" name="eventSalesTracked" checked={eventSalesTracked === "Yes"} onChange={() => {setEventSalesTracked("Yes");setDraftSaved(false);}} /> Yes</label>
                <label><input type="radio" name="eventSalesTracked" checked={eventSalesTracked === "No"} onChange={() => {setEventSalesTracked("No");setDraftSaved(false);}} /> No</label>
              </fieldset>
              <div className="form-field">
                <label htmlFor="eventQualityAssessment">How will event quality be assessed?</label>
                <select id="eventQualityAssessment" value={eventQualityAssessment} onChange={e => {setEventQualityAssessment(e.target.value);setDraftSaved(false);}}>
                  <option value="">Select</option>
                  {eventQualityOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </form>
          </main>
          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19} /></button>
            <button className="wizard-continue-button" type="button" disabled={!isEventsStep6Valid} onClick={handleContinue}>Continue <Icon name="arrow" size={16} /></button>
          </footer>
        </>
      ) : stage === 6 ? (
        <>
          <main className="activation-content activity-details-content step6-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>
            <section className="wizard-step-card">
              {renderProgress(6, 7)}
              <p className="wizard-step-count">STEP 6 OF 7</p>
              <h2>Objective, volumes and consumers</h2>
            </section>
            <p className="draft-storage-note">{saveNote}</p>
            <form className="activity-details-form step6-form" onSubmit={event => event.preventDefault()}>
              <div className="form-field">
                <label htmlFor="draughtJob">What is the main draught job? <span className="required-mark">*</span></label>
                <select id="draughtJob" value={draughtJob} onChange={e => {setDraughtJob(e.target.value); setDraftSaved(false);}} required>
                  <option value="">Select</option>
                  {draughtJobs.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="targetVolume">What draught volume or throughput target is expected? <span className="required-mark">*</span></label>
                <div className="step6-volume-row">
                  <select aria-label="Target volume unit" value={targetUnit} onChange={e => {setTargetUnit(e.target.value); setDraftSaved(false);}} required>
                    <option value="">Unit</option>
                    {volumeUnits.map(item => <option key={item}>{item}</option>)}
                  </select>
                  <input id="targetVolume" type="number" min="0" step="any" value={targetVolume} onChange={e => {setTargetVolume(e.target.value); setDraftSaved(false);}} required />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="baselineVolume">What was the pre-activity draught throughput for the same outlets? <span className="required-mark">*</span></label>
                <div className="step6-volume-row">
                  <select aria-label="Pre-activity volume unit" value={baselineUnit} onChange={e => {setBaselineUnit(e.target.value); setDraftSaved(false);}} required>
                    <option value="">Unit</option>
                    {volumeUnits.map(item => <option key={item}>{item}</option>)}
                  </select>
                  <input id="baselineVolume" type="number" min="0" step="any" value={baselineVolume} onChange={e => {setBaselineVolume(e.target.value); setDraftSaved(false);}} required />
                </div>
              </div>
              <fieldset className="step6-trials">
                <legend>Will verified trials be counted? <span className="required-mark">*</span></legend>
                <label><input type="radio" name="verifiedTrials" checked={verifiedTrials === "yes"} onChange={() => {setVerifiedTrials("yes"); setDraftSaved(false);}} /> Yes</label>
                <label><input type="radio" name="verifiedTrials" checked={verifiedTrials === "no"} onChange={() => {setVerifiedTrials("no"); setDraftSaved(false);}} /> No</label>
              </fieldset>
              <div className="form-field">
                <label htmlFor="repeatObservation">How will repeat or reorder be observed? <span className="required-mark">*</span></label>
                <select id="repeatObservation" value={repeatObservation} onChange={e => {setRepeatObservation(e.target.value); setDraftSaved(false);}} required>
                  <option value="">Select</option>
                  {repeatMethods.map(item => <option key={item}>{item}</option>)}
                </select>
              </div>
            </form>
          </main>
          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19} /></button>
            <button className="wizard-continue-button" type="button" disabled={!isStep6Valid} onClick={handleContinue}>Continue <Icon name="arrow" size={16} /></button>
          </footer>
        </>
      ) : stage === 5 && activityType === "Events/Activations" ? (
        <>
          <main className="activation-content activity-details-content events-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>
            <section className="wizard-step-card">
              {renderProgress(5, 7)}
              <p className="wizard-step-count">STEP 5 OF 7</p>
              <h2>Format and audience</h2>
            </section>
            <p className="draft-storage-note">{saveNote}</p>
            <form className="activity-details-form events-form" onSubmit={e => e.preventDefault()}>
              <div className="form-field">
                <label htmlFor="eventFormat">What format will the event or activation use? <span className="required-mark">*</span></label>
                <select id="eventFormat" value={eventFormat} onChange={e => {setEventFormat(e.target.value);setDraftSaved(false);}} required>
                  <option value="">Select</option>
                  {eventFormatOptions.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="eventRuns">How many activity runs are planned? <span className="required-mark">*</span></label>
                <input id="eventRuns" type="number" min="1" step="1" inputMode="numeric" value={eventRuns} onChange={e => {setEventRuns(e.target.value);setDraftSaved(false);}} required />
              </div>
              <div className="form-field">
                <label htmlFor="eventAttendance">How many people are expected to attend or participate per run? <span className="required-mark">*</span></label>
                <input id="eventAttendance" type="number" min="1" step="1" inputMode="numeric" value={eventAttendance} onChange={e => {setEventAttendance(e.target.value);setDraftSaved(false);}} required />
              </div>
              <div className="form-field">
                <label htmlFor="eventAudience">Who is the primary audience?</label>
                <textarea id="eventAudience" rows={3} placeholder="Describe age/life-stage, location and relevant behaviour without sensitive profiling" value={eventAudience} onChange={e => {setEventAudience(e.target.value);setDraftSaved(false);}} />
              </div>
              <div className="form-field">
                <label htmlFor="eventExperiences">What should participants experience or do? <span className="required-mark">*</span></label>
                <details className="events-multiselect" id="eventExperiences">
                  <summary>{eventExperiences.length ? `${eventExperiences.length} selected` : "Select"}</summary>
                  <div className="events-multiselect-options">
                    <label className="events-select-all"><input type="checkbox" checked={eventExperiences.length === eventExperienceOptions.length} ref={node => { if (node) node.indeterminate = eventExperiences.length > 0 && eventExperiences.length < eventExperienceOptions.length; }} onChange={e => {setEventExperiences(e.target.checked ? [...eventExperienceOptions] : []);setDraftSaved(false);}} />Select all</label>
                    {eventExperienceOptions.map(x => <label key={x}><input type="checkbox" checked={eventExperiences.includes(x)} onChange={e => {setEventExperiences(prev => e.target.checked ? [...prev,x] : prev.filter(v=>v!==x));setDraftSaved(false);}} />{x}</label>)}
                  </div>
                </details>
              </div>
            </form>
          </main>
          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19}/></button>
            <button className="wizard-continue-button" type="button" disabled={!isEventsStep5Valid} onClick={handleContinue}>Continue <Icon name="arrow" size={16}/></button>
          </footer>
        </>
      ) : stage === 5 ? (
        <>
          <main className="activation-content activity-details-content outlets-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>
            <section className="wizard-step-card">
              {renderProgress(5, 7)}
              <p className="wizard-step-count">STEP 5 OF 7</p>
              <h2>Outlets and equipment</h2>
            </section>
            <p className="draft-storage-note">{saveNote}</p>
            <form className="activity-details-form outlets-form" onSubmit={(event) => event.preventDefault()}>
              <div className="form-field">
                <label htmlFor="draughtOutlets">How many draught outlets are included? <span className="required-mark">*</span></label>
                <input id="draughtOutlets" type="number" min="0" step="1" value={draughtOutlets} onChange={(event) => { setDraughtOutlets(event.target.value); setDraftSaved(false); }} required />
              </div>
              <div className="outlets-breakdown">
                <p>How many are new versus existing draught outlets?</p>
                <div className="outlets-breakdown-grid">
                  <div className="form-field">
                    <label htmlFor="newOutlets">New outlets <span className="required-mark">*</span></label>
                    <input id="newOutlets" type="number" min="0" step="1" value={newOutlets} onChange={(event) => { setNewOutlets(event.target.value); setDraftSaved(false); }} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="existingOutlets">Existing outlets <span className="required-mark">*</span></label>
                    <input id="existingOutlets" type="number" min="0" step="1" value={existingOutlets} onChange={(event) => { setExistingOutlets(event.target.value); setDraftSaved(false); }} required />
                  </div>
                </div>
                {draughtOutlets !== "" && newOutlets !== "" && existingOutlets !== "" && Number(newOutlets) + Number(existingOutlets) !== Number(draughtOutlets) && (
                  <p className="outlets-validation">New and existing outlets must add up to the total.</p>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="activeTaps">How many taps or towers should be active? <span className="required-mark">*</span></label>
                <input id="activeTaps" type="number" min="0" step="1" value={activeTaps} onChange={(event) => { setActiveTaps(event.target.value); setDraftSaved(false); }} required />
              </div>
              <div className="form-field">
                <label htmlFor="equipmentReadiness">What equipment-readiness checks are required? <span className="required-mark">*</span></label>
                <div className="readiness-dropdown">
                  <button type="button" className={`readiness-trigger ${equipmentReadinessOpen ? "is-open" : ""}`} aria-expanded={equipmentReadinessOpen} aria-controls="readiness-options" onClick={() => setEquipmentReadinessOpen(open => !open)}>
                    <span>{equipmentReadiness.length ? equipmentReadiness.join(", ") : "Select"}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={equipmentReadinessOpen ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>
                  </button>
                  {equipmentReadinessOpen && (
                    <div id="readiness-options" className="readiness-menu" role="group" aria-label="Equipment readiness checks">
                      <label className="readiness-option readiness-select-all">
                        <input type="checkbox" checked={equipmentReadiness.length === readinessOptions.length} ref={node => { if (node) node.indeterminate = equipmentReadiness.length > 0 && equipmentReadiness.length < readinessOptions.length; }} onChange={event => { setEquipmentReadiness(event.target.checked ? [...readinessOptions] : []); setDraftSaved(false); }} />
                        <span>Select all</span>
                      </label>
                      {readinessOptions.map(option => (
                        <label key={option} className="readiness-option">
                          <input type="checkbox" checked={equipmentReadiness.includes(option)} onChange={event => { setEquipmentReadiness(previous => event.target.checked ? [...previous, option] : previous.filter(item => item !== option)); setDraftSaved(false); }} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </main>
          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19} /></button>
            <button className="wizard-continue-button" type="button" disabled={!isOutletsValid} onClick={handleContinue}>Continue <Icon name="arrow" size={16} /></button>
          </footer>
        </>
      ) : stage === 4 ? (
        <>
          <main className="activation-content activity-details-content budget-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>
            <section className="wizard-step-card">
              {renderProgress(4, totalSteps)}
              <p className="wizard-step-count">STEP 4 OF {totalSteps}</p>
              <h2>Budget</h2>
            </section>
            <p className="draft-storage-note">{saveNote}</p>
            <form className="activity-details-form budget-form" onSubmit={(event) => event.preventDefault()}>
              <div className="form-field">
                <label htmlFor="plannedBudget">{isSponsorship ? "Planned budget in ETB (calculated from sponsorship fees in Step 7)" : isMedia ? "Planned budget in ETB (calculated from production and media-placement budgets in Step 6)" : <>What is the planned budget in ETB? <span className="required-mark">*</span></>}</label>
                {isSponsorship || isMedia ? <input id="plannedBudget" type="text" value={`${(isSponsorship ? sponsorshipTotal : mediaTotal).toLocaleString("en-US")} ETB`} readOnly aria-readonly="true" /> : <input id="plannedBudget" type="number" min="0" step="0.01" inputMode="decimal" placeholder="ETB" value={plannedBudget} onChange={(event) => { setPlannedBudget(event.target.value); setDraftSaved(false); }} required />}
              </div>
              <div className="form-field">
                <label htmlFor="ioNumber">What is the IO number?</label>
                <input id="ioNumber" type="text" value={ioNumber} onChange={(event) => { setIoNumber(event.target.value); setDraftSaved(false); }} />
              </div>
              <div className="form-field">
                <label htmlFor="poNumber">What is the PO number?</label>
                <input id="poNumber" type="text" value={poNumber} onChange={(event) => { setPoNumber(event.target.value); setDraftSaved(false); }} />
              </div>
            </form>
          </main>
          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19} /></button>
            <button className="wizard-continue-button" type="button" disabled={!isBudgetValid} onClick={handleContinue}>Continue <Icon name="arrow" size={16} /></button>
          </footer>
        </>
      ) : (
        <>
          <main className="activation-content activity-details-content ownership-content">
            <h1 className="wizard-page-title">CREATE ACTIVITY</h1>

            <section className="wizard-step-card">
              {renderProgress(3, totalSteps)}
              <p className="wizard-step-count">STEP 3 OF {totalSteps}</p>
              <h2>Ownership</h2>
            </section>

            <p className="draft-storage-note">{saveNote}</p>

            <style>{`
              .ownership-radio-group { display:flex; flex-direction:column; gap:10px; }
              .ownership-radio-option { display:flex !important; align-items:center; gap:10px; min-height:18px; margin:0; padding:0; color:#333; font-size:12px !important; font-weight:400 !important; line-height:1.4; cursor:pointer; }
              .ownership-radio-option span { font-weight:400; }
              .ownership-radio-option input[type="radio"] { display:inline-block; }
              .counterpart-select-box { position:relative; width:100%; border:1px solid #262626; border-radius:11px; background:#fff; overflow:visible; }
              .counterpart-select-box.is-open { border-color:#b58a00; box-shadow:0 0 0 2px rgba(181,138,0,.12); }
              .counterpart-select-head { width:100%; min-height:39px; padding:10px 14px 6px; display:flex; align-items:center; justify-content:space-between; gap:12px; border:0; border-radius:10px; background:transparent; color:#444; font-family:inherit; font-size:12px; text-align:left; cursor:pointer; }
              .counterpart-select-head svg { flex-shrink:0; transition:transform .15s ease; }
              .counterpart-select-box.is-open .counterpart-select-head svg { transform:rotate(180deg); }
              .counterpart-selected-chips { display:flex; flex-wrap:wrap; gap:6px; padding:0 14px 10px; }
              .counterpart-chip { display:inline-flex; align-items:center; gap:7px; max-width:100%; padding:6px 10px; border-radius:18px; background:#e8e4dc; color:#333; font-size:11px; line-height:1.2; }
              .counterpart-chip button { border:0; padding:0; background:transparent; color:#555; font-size:13px; line-height:1; cursor:pointer; }
              .counterpart-options-menu { position:absolute; z-index:120; top:calc(100% + 4px); left:0; right:0; max-height:260px; overflow-y:auto; padding:0; border:1px solid #d7d0c3; border-radius:10px; background:#fff; box-shadow:0 8px 18px rgba(0,0,0,.13); }
              .counterpart-option { display:flex; align-items:center; gap:10px; min-height:39px; padding:9px 16px; color:#202020; font-size:12px; font-weight:400; cursor:pointer; }
              .counterpart-option:hover { background:#f2f0ec; }
              .counterpart-option input[type="checkbox"] { width:17px; height:17px; flex:0 0 17px; margin:0; accent-color:#a47900; }
              .counterpart-option.select-all { border-bottom:1px solid #eee9df; }
              .counterpart-menu-done { width:100%; padding:10px 14px; border:0; border-top:1px solid #eee9df; background:#fff; color:#9b7400; font-family:inherit; font-size:12px; font-weight:600; text-align:right; cursor:pointer; }
              .add-counterpart-row { display:flex; align-items:center; gap:8px; padding:7px 8px 7px 14px; border:1px solid #d8d0c1; border-radius:11px; background:#fff; }
              .add-counterpart-row input { flex:1; min-width:0; height:32px; padding:0; border:0 !important; outline:0; box-shadow:none !important; background:transparent; font-family:inherit; font-size:12px; }
              .add-counterpart-row input::placeholder { color:#a39b8b; opacity:1; }
              .add-counterpart-row button { min-width:44px; height:31px; padding:0 13px; border:0; border-radius:18px; background:#ddca97; color:#fff; font-family:inherit; font-size:11px; cursor:pointer; }
              .add-counterpart-row button:disabled { opacity:.7; cursor:not-allowed; }
              .field-help { margin:3px 0 0; color:#a39b8b; font-size:10px; line-height:1.4; }
              .added-counterparts { display:flex; flex-wrap:wrap; gap:6px; margin-top:7px; }
            `}</style>
            <form className="activity-details-form ownership-form" onSubmit={(event) => event.preventDefault()}>
              <div className="form-field">
                <label htmlFor="accountablePerson">Who is accountable for the activity?<span className="required-mark"> *</span></label>
                <select id="accountablePerson" value={accountablePerson} onChange={(event) => { setAccountablePerson(event.target.value); setDraftSaved(false); }} required>
                  <option value="">Select a person</option>
                  {accountablePeople.map((person) => <option key={person} value={person}>{person}</option>)}
                </select>
              </div>

              <fieldset
                className="ownership-radio-group"
                style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
              >
                <legend style={{ padding: 0, margin: "0 0 10px", color: "#171717", fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>
                  Commercial or Trade counterpart <span className="required-mark">*</span>
                </legend>
                <label className="ownership-radio-option">
                  <input
                    type="radio"
                    name="counterpartRequired"
                    value="not-required"
                    checked={counterpartRequired === "not-required"}
                    onChange={() => { setCounterpartRequired("not-required"); setDraftSaved(false); }}
                    style={{ appearance: "auto", width: 14, height: 14, minWidth: 14, margin: 0, padding: 0, accentColor: "#333", flex: "0 0 14px" }}
                  />
                  <span>Not required</span>
                </label>
                <label className="ownership-radio-option">
                  <input
                    type="radio"
                    name="counterpartRequired"
                    value="required"
                    checked={counterpartRequired === "required"}
                    onChange={() => { setCounterpartRequired("required"); setDraftSaved(false); }}
                    style={{ appearance: "auto", width: 14, height: 14, minWidth: 14, margin: 0, padding: 0, accentColor: "#333", flex: "0 0 14px" }}
                  />
                  <span>Required</span>
                </label>
              </fieldset>

              {counterpartRequired === "required" && <>
                <div className="form-field">
                  <label id="counterpart-label">Who is the Commercial or Trade counterpart? <span className="required-mark">*</span></label>
                  <div className={`counterpart-select-box ${counterpartOpen ? "is-open" : ""}`}>
                    <button type="button" className="counterpart-select-head" aria-expanded={counterpartOpen} aria-haspopup="listbox" aria-labelledby="counterpart-label" onClick={() => setCounterpartOpen((open) => !open)}>
                      <span>{counterparts.length} {counterparts.length === 1 ? "item" : "items"} selected</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                    {counterparts.length > 0 && <div className="counterpart-selected-chips">{counterparts.map((item) => <span className="counterpart-chip" key={item}>{item}<button type="button" aria-label={`Remove ${item}`} onClick={() => { setCounterparts((prev) => prev.filter((value) => value !== item)); setDraftSaved(false); }}>×</button></span>)}</div>}
                    {counterpartOpen && <div className="counterpart-options-menu" role="group" aria-labelledby="counterpart-label">
                      <label className="counterpart-option select-all">
                        <input type="checkbox" checked={counterparts.length === counterpartOptions.length} onChange={(event) => { setCounterparts(event.target.checked ? [...counterpartOptions] : []); setDraftSaved(false); }} />
                        <span>Select all</span>
                      </label>
                      {counterpartOptions.map((item) => <label key={item} className="counterpart-option"><input type="checkbox" checked={counterparts.includes(item)} onChange={(event) => { setCounterparts((prev) => event.target.checked ? [...prev, item] : prev.filter((value) => value !== item)); setDraftSaved(false); }} /><span>{item}</span></label>)}
                      <button type="button" className="counterpart-menu-done" onClick={() => setCounterpartOpen(false)}>Done</button>
                    </div>}
                  </div>
                </div>

                {counterparts.includes("Other") && <div className="form-field">
                  <label htmlFor="otherCounterpartInput">Specify the other counterpart <span className="required-mark">*</span></label>
                  <div className="add-counterpart-row"><input id="otherCounterpartInput" type="text" value={otherCounterpartInput} placeholder="Type a name, then tap Add" onChange={(event) => setOtherCounterpartInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addOtherCounterpart(); } }} /><button type="button" onClick={addOtherCounterpart} disabled={!otherCounterpartInput.trim()}>Add</button></div>
                  <p className="field-help">Type a name and tap Add, once for each counterpart.</p>
                  {otherCounterparts.length > 0 && <div className="added-counterparts">{otherCounterparts.map((name) => <span className="counterpart-chip" key={name}>{name}<button type="button" aria-label={`Remove ${name}`} onClick={() => setOtherCounterparts((prev) => prev.filter((item) => item !== name))}>×</button></span>)}</div>}
                </div>}
              </>}

              <fieldset
                className="ownership-radio-group"
                style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
              >
                <legend style={{ padding: 0, margin: "0 0 10px", color: "#171717", fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>
                  Which agency, vendor or partner will support delivery? <span className="required-mark">*</span>
                </legend>
                <label className="ownership-radio-option">
                  <input type="radio" name="deliveryType" value="internal" checked={deliveryType === "internal"} onChange={() => { setDeliveryType("internal"); setDraftSaved(false); }} style={{ appearance: "auto", width: 14, height: 14, minWidth: 14, margin: 0, padding: 0, accentColor: "#333", flex: "0 0 14px" }} />
                  <span>Internal delivery</span>
                </label>
                <label className="ownership-radio-option">
                  <input type="radio" name="deliveryType" value="external" checked={deliveryType === "external"} onChange={() => { setDeliveryType("external"); setDraftSaved(false); }} style={{ appearance: "auto", width: 14, height: 14, minWidth: 14, margin: 0, padding: 0, accentColor: "#333", flex: "0 0 14px" }} />
                  <span>External delivery</span>
                </label>
              </fieldset>

              {deliveryType === "external" && <div className="form-field">
                <label htmlFor="externalDeliveryName">Name of external delivery <span className="required-mark">*</span></label>
                <input id="externalDeliveryName" type="text" value={externalDeliveryName} onChange={(event) => { setExternalDeliveryName(event.target.value); setDraftSaved(false); }} required />
                {!externalDeliveryName.trim() && <p className="field-error">This field is required.</p>}
              </div>}
            </form>
          </main>

          <footer className="wizard-footer">
            <button className="wizard-back-button" type="button" onClick={handleBack} aria-label="Go back"><Icon name="back" size={19} /></button>
            <button className="wizard-continue-button" type="button" disabled={!isOwnershipValid} onClick={handleContinue}>Continue <Icon name="arrow" size={16} /></button>
          </footer>
        </>
      )}
    </div>
  );
}

function PlaceholderPage({ page, onBack }) {
  const titles = {
    activations: "Activations",
    activities: "Manage activities",
    results: "Manage Results",
    statistics: "Statistics",
    myspace: "My space",
  };

  return (
    <section className="placeholder-page">
      <h2>{titles[page] || page}</h2>
      <p>
        We&apos;ll recreate this screen from the corresponding reference
        screenshot.
      </p>
      <button
        className="back-home-button"
        onClick={onBack}
        type="button"
      >
        Return to Home
      </button>
    </section>
  );
}

const DRAFT_STORAGE = "marketing-effectiveness-activation-draft";
function ActivitiesList({ onCreate, onOpen, api = fieldApi }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [offlineDraft, setOfflineDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const load = () => {
    setLoading(true);
    api.listActivities()
      .then(records => { setItems(records); setLoadError(""); })
      .catch(error => setLoadError(error.message))
      .finally(() => setLoading(false));
    try { setOfflineDraft(JSON.parse(localStorage.getItem(DRAFT_STORAGE) || "null")); } catch { setOfflineDraft(null); }
  };
  useEffect(load, [api]);
  const drafts = items.filter(item => item.status === "draft");
  const records = items.filter(item => item.status !== "draft");
  const removeDraft = async (draft) => {
    if (!window.confirm("Delete this draft?")) return;
    try {
      await api.deleteDraft(draft.id);
      setItems(previous => previous.filter(item => item.id !== draft.id));
    } catch (error) {
      alert(error.message);
    }
  };
  const removeOfflineDraft = () => {
    if (!window.confirm("Delete the draft kept on this phone?")) return;
    localStorage.removeItem(DRAFT_STORAGE); setOfflineDraft(null);
  };
  const matches = item =>
    (!type || item.activityType === type) &&
    (!status || item.status === status) &&
    `${item.activityName || ""} ${item.activityType || ""} ${item.city || ""} ${item.code || ""}`.toLowerCase().includes(search.toLowerCase());
  const noFilters = !search && !type && !status;
  const draftCard = (draft, offline) => <article key={draft.id || "offline"} className="activities-item">
    <div className="activities-item-top"><span className="activities-type">{draft.activityType || "Draft"}</span><span className="activities-status draft">{offline ? "NOT SYNCED" : "DRAFT"}</span></div>
    <h2>{draft.activityName || "Untitled activity"}</h2>
    <button type="button" className="activities-open-link" onClick={() => onOpen({...draft, id: offline ? (draft.id || "offline-draft") : draft.id}, true)}>Open the draft →</button>
    <button type="button" className="activities-delete" onClick={() => offline ? removeOfflineDraft() : removeDraft(draft)}>♧ Delete</button>
  </article>;
  return <section className="activities-list-page">
    <div className="activities-list-header"><h1>Activities</h1><p>View and manage all your activities.</p></div>
    <div className="activities-list-body">
      <button type="button" className="activities-create" onClick={onCreate}>Create new activity ＋</button>
      <input className="activities-search" aria-label="Search activities" placeholder="⌕  Search" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="activities-filters">
        <select aria-label="Activity type" value={type} onChange={e => setType(e.target.value)}><option value="">Activity type</option>{[...new Set(items.map(x => x.activityType).filter(Boolean))].map(x => <option key={x}>{x}</option>)}</select>
        <select aria-label="Activity status" value={status} onChange={e => setStatus(e.target.value)}><option value="">Activity status</option><option value="submitted">Pending</option><option value="validated">Approved</option><option value="rejected">Rejected</option><option value="reopened">Being edited</option><option value="cancelled">Cancelled</option></select>
      </div>
      {loadError && <p className="activities-error" role="alert">{loadError} <button type="button" onClick={load}>Retry</button></p>}
      {noFilters && offlineDraft && <><p className="activities-group-label">ON THIS PHONE</p>{draftCard(offlineDraft, true)}</>}
      {noFilters && drafts.length > 0 && <><p className="activities-group-label">DRAFTS</p>{drafts.map(draft => draftCard(draft, false))}</>}
      {records.filter(matches).map(item => <article key={item.id} className="activities-item" onClick={() => onOpen(item, false)}>
        <div className="activities-item-top"><span className="activities-type">{item.activityType || "Activity"}</span><span className={`activities-status ${statusClass(item.status)}`}>{statusLabel(item.status)}</span></div>
        <h2>{item.activityName || "Untitled activity"} <small className="activities-code">{item.code}</small></h2>
        <p>◷ {item.startDate || "—"} – {item.endDate || "—"}</p>
        <p>◎ {item.city || (Array.isArray(item.division) ? item.division.join(", ") : item.division) || "—"}</p>
        <p>◷ Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}</p>
        {item.status === "rejected" && item.decision?.comment && <p className="activities-reject-reason">Rejected: {item.decision.comment}</p>}
      </article>)}
      {loading && <p className="activities-empty">Loading…</p>}
      {!loading && !loadError && !records.some(matches) && !drafts.length && !offlineDraft && <p className="activities-empty">No activities found. Create your first activity.</p>}
    </div>
  </section>;
}

// =========================================
// AUTHENTICATION (Supabase)
// Field users: employee ID → "field-login" Edge Function → one-time token → session.
// Admin users: email + password (Supabase Auth). Roles and brand scope come from the database.
// =========================================
const staffEmail = (employeeId) => `${employeeId.trim().toLowerCase()}@staff.habesha.invalid`;
const isAdminRoute = () => window.location.hash === "#admin" || /^\/manager-login\/?$/.test(window.location.pathname);

const authService = {
  async signInWithEmployeeId(employeeId) {
    const { data, error } = await fieldClient.functions.invoke("field-login", { body: { employeeId } });
    if (error) return { error: await readError(error, "Sign-in is unavailable. Check your connection and try again.") };
    const { error: otpError } = await fieldClient.auth.verifyOtp({ type: "email", token_hash: data.token_hash });
    if (otpError) return { error: "Sign-in failed. Open your access link again." };
    const user = await fieldApi.getProfile().catch(() => null);
    if (!user) { await fieldClient.auth.signOut(); return { error: "Your account is inactive. Contact your manager." }; }
    return { user };
  },
  // Managers sign in with their employee ID + password (internal sign-in address, see scripts/create-users.mjs).
  async signInAdmin(employeeId, password) {
    const { error } = await adminClient.auth.signInWithPassword({ email: staffEmail(employeeId), password });
    if (error) return { error: error.status === 400 ? "Employee ID or password is incorrect." : await readError(error, "Sign-in is unavailable. Check your connection and try again.") };
    const user = await adminApi.getProfile().catch(() => null);
    if (!user) { await adminClient.auth.signOut(); return { error: "Your account is inactive. Contact your administrator." }; }
    if (!ADMIN_ROLES.includes(user.role)) { await adminClient.auth.signOut(); return { error: "This account doesn’t have access to the admin dashboard." }; }
    return { user };
  },
  // FR-204-001: a deactivated account gets no profile, so its session is closed.
  async restore(kind) {
    const client = kind === "admin" ? adminClient : fieldClient;
    const api = kind === "admin" ? adminApi : fieldApi;
    const { data } = await client.auth.getSession();
    if (!data.session) return null;
    const user = await api.getProfile().catch(() => null);
    if (!user || (kind === "admin" && !ADMIN_ROLES.includes(user.role))) {
      await client.auth.signOut();
      return null;
    }
    return user;
  },
  async signOut(kind) {
    await (kind === "admin" ? adminClient : fieldClient).auth.signOut();
  },
};

const firstName = (user) => (user?.name || "").split(" ")[0];

// FR-105-001: the personal access link carries the employee ID, e.g. /login/HBX-FNFQ85CK (or ?id=HBX-FNFQ85CK).
const employeeIdFromLink = () => {
  const match = window.location.pathname.match(/\/login\/([^/]+)\/?$/);
  if (match) return decodeURIComponent(match[1]);
  return new URLSearchParams(window.location.search).get("id") || "";
};

// Amharic is Phase 2 (FR-105-004); only English is available for now.
function LanguageToggle() {
  return <div className="signin-lang" role="group" aria-label="Language">
    <button type="button" className="selected" aria-pressed="true">EN</button>
    <button type="button" disabled title="Not available yet">አማ</button>
    <button type="button" disabled title="Not available yet">FR</button>
  </div>;
}

function SignInLayout({ eyebrow, title, lead, children }) {
  return <div className="signin-page">
    <div className="signin-band" aria-hidden="true" />
    <img className="signin-watermark" src={habeshaWordmark} alt="" aria-hidden="true" />
    <main className="signin-main">
      <div className="signin-top">
        <img className="signin-logo" src={habeshaLogoHorizontal} alt="Habesha" />
        <LanguageToggle />
      </div>
      <p className="signin-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="signin-lead">{lead}</p>
      {children}
    </main>
    <div className="signin-band" aria-hidden="true" />
  </div>;
}

function UserLogin({ onSignedIn }) {
  const [employeeId, setEmployeeId] = useState(employeeIdFromLink);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const result = await authService.signInWithEmployeeId(employeeId);
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    onSignedIn(result.user);
  };

  return <SignInLayout
    eyebrow="MARKETING FIELD APP"
    title="Sign in with your employee ID"
    lead="Your access link was sent to you containing your ID. If you have forgotten your ID, contact your manager."
  >
    <form className="signin-form" onSubmit={submit} noValidate>
      <label className="signin-label" htmlFor="employeeId">EMPLOYEE ID</label>
      <input id="employeeId" className="signin-input" type="text" autoComplete="username" autoCapitalize="characters" spellCheck="false" value={employeeId} onChange={e => { setEmployeeId(e.target.value); setError(""); }} />
      {error && <p className="signin-error" role="alert">{error}</p>}
      <button type="submit" className="signin-submit" disabled={!employeeId.trim() || busy}>{busy ? "Signing in…" : "Continue"} <Icon name="arrow" size={16} /></button>
    </form>
  </SignInLayout>;
}

function AdminLogin({ onSignedIn }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const result = await authService.signInAdmin(employeeId, password);
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    onSignedIn(result.user);
  };

  return <SignInLayout
    eyebrow="ADMIN DASHBOARD"
    title="Sign in with your employee ID"
    lead="Use your employee ID and the password you were given. If you can’t sign in, contact your administrator."
  >
    <form className="signin-form" onSubmit={submit} noValidate>
      <label className="signin-label" htmlFor="adminEmployeeId">EMPLOYEE ID</label>
      <input id="adminEmployeeId" className="signin-input" type="text" autoComplete="username" autoCapitalize="characters" spellCheck="false" value={employeeId} onChange={e => { setEmployeeId(e.target.value); setError(""); }} />
      <label className="signin-label signin-label-spaced" htmlFor="adminPassword">PASSWORD</label>
      <div className="signin-password">
        <input id="adminPassword" className="signin-input" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} />
        <button type="button" onClick={() => setShowPassword(value => !value)} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
      </div>
      {error && <p className="signin-error" role="alert">{error}</p>}
      <button type="submit" className="signin-submit" disabled={!employeeId.trim() || !password || busy}>{busy ? "Signing in…" : "Continue"} <Icon name="arrow" size={16} /></button>
    </form>
  </SignInLayout>;
}

// =========================================
// ADMIN DASHBOARD (open with #admin in the URL)
// =========================================
const ADMIN_PERIODS = [["season", "Season to date"], ["month", "This month"], ["last-month", "Last month"], ["all", "All time"]];
const ADMIN_DEFAULT_FILTERS = {period: "season", brand: "", division: "", type: ""};

// Period is read from the brief's submission date. "Season to date" is treated as 1 January of the current year until the season start is confirmed.
function inAdminPeriod(iso, period) {
  if (period === "all") return true;
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  if (period === "season") return date >= new Date(now.getFullYear(), 0, 1);
  if (period === "month") return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  if (period === "last-month") return date >= new Date(now.getFullYear(), now.getMonth() - 1, 1) && date < new Date(now.getFullYear(), now.getMonth(), 1);
  return true;
}

// FR-102-010: an approved activity past its planned end date with no submitted result. Result reporting is not built yet, so no result exists.
function isReportLate(item) {
  if (item.status !== "validated" || !item.endDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${item.endDate}T00:00:00`) < today;
}

// Owner/Admin: maintain divisions and cities (FR-203-001: deactivate, never delete; NF-102-003: changes logged).
function AdminConfiguration({ api, onBack, onChanged }) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [divisionFilter, setDivisionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [newCity, setNewCity] = useState({ name: "", divisionId: "" });
  const [newDivision, setNewDivision] = useState("");
  const [editing, setEditing] = useState(null); // { kind: "city" | "division", id, value }
  const load = () => api.listConfiguration().then(data => { setConfig(data); setError(""); }).catch(e => setError(e.message));
  useEffect(() => { load(); }, [api]); // eslint-disable-line react-hooks/exhaustive-deps
  const run = async (action) => {
    setBusy(true); setError("");
    try { await action(); await load(); if (onChanged) onChanged(); setEditing(null); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  if (!config) return <main className="admin-main"><button type="button" className="admin-back" onClick={onBack}>← Dashboard</button><p className="admin-loading">{error || "Loading…"}</p></main>;
  const divisionName = Object.fromEntries(config.divisions.map(d => [d.id, d.name]));
  const cities = config.cities
    .filter(c => (showInactive || c.active) && (!divisionFilter || String(c.division_id) === divisionFilter) && c.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => byName(divisionName[a.division_id] || "", divisionName[b.division_id] || "") || byName(a.name, b.name));
  const nameCell = (kind, item) => editing && editing.kind === kind && editing.id === item.id
    ? <span className="config-edit"><input aria-label={`New name for ${item.name}`} value={editing.value} onChange={e => setEditing({ ...editing, value: e.target.value })} autoFocus />
        <button type="button" disabled={busy || !editing.value.trim()} onClick={() => run(() => kind === "city" ? api.updateCity(item.id, { name: editing.value.trim() }) : api.updateDivision(item.id, { name: editing.value.trim() }))}>Save</button>
        <button type="button" className="config-link" onClick={() => setEditing(null)}>Cancel</button></span>
    : <span className={item.active ? "" : "config-inactive"}>{item.name}</span>;
  const actions = (kind, item) => <span className="config-actions">
    <button type="button" className="config-link" disabled={busy} onClick={() => setEditing({ kind, id: item.id, value: item.name })}>Rename</button>
    <button type="button" className="config-link" disabled={busy} onClick={() => run(() => kind === "city" ? api.updateCity(item.id, { active: !item.active }) : api.updateDivision(item.id, { active: !item.active }))}>{item.active ? "Deactivate" : "Reactivate"}</button>
  </span>;
  return <main className="admin-main">
    <button type="button" className="admin-back" onClick={onBack}>← Dashboard</button>
    <h1 className="admin-page-title">Cities & divisions</h1>
    <p className="admin-page-subtitle">Changes apply to the activity forms straight away. Nothing is deleted: deactivated entries disappear from the forms and can be reactivated. Activities already saved keep the name they were saved with.</p>
    {error && <p className="activities-error" role="alert">{error}</p>}

    <section className="config-card">
      <h2>Add a city</h2>
      <div className="config-row">
        <select aria-label="Division for the new city" value={newCity.divisionId} onChange={e => setNewCity({ ...newCity, divisionId: e.target.value })}>
          <option value="">Division</option>{config.divisions.filter(d => d.active).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input aria-label="New city name" placeholder="City name" value={newCity.name} onChange={e => setNewCity({ ...newCity, name: e.target.value })} />
        <button type="button" disabled={busy || !newCity.name.trim() || !newCity.divisionId} onClick={() => run(async () => { await api.addCity(newCity.name, Number(newCity.divisionId)); setNewCity({ name: "", divisionId: newCity.divisionId }); })}>Add city</button>
      </div>
    </section>

    <section className="config-card">
      <div className="config-head">
        <h2>Cities <small>({config.cities.filter(c => c.active).length} active)</small></h2>
        <div className="config-row">
          <select aria-label="Filter by division" value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)}>
            <option value="">All divisions</option>{config.divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input aria-label="Search cities" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
          <label className="config-check"><input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} /> Show deactivated</label>
        </div>
      </div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>City</th><th>Division</th><th>Status</th><th></th></tr></thead>
        <tbody>{cities.map(c => <tr key={c.id}>
          <td>{nameCell("city", c)}</td>
          <td>{divisionName[c.division_id]}</td>
          <td>{c.active ? "Active" : "Deactivated"}</td>
          <td>{actions("city", c)}</td>
        </tr>)}</tbody>
      </table></div>
      {!cities.length && <p className="admin-empty">No cities match.</p>}
    </section>

    <section className="config-card">
      <h2>Divisions</h2>
      <div className="config-row">
        <input aria-label="New division name" placeholder="New division name" value={newDivision} onChange={e => setNewDivision(e.target.value)} />
        <button type="button" disabled={busy || !newDivision.trim()} onClick={() => run(async () => { await api.addDivision(newDivision); setNewDivision(""); })}>Add division</button>
      </div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Division</th><th>Active cities</th><th>Status</th><th></th></tr></thead>
        <tbody>{config.divisions.map(d => <tr key={d.id}>
          <td>{nameCell("division", d)}</td>
          <td>{config.cities.filter(c => c.division_id === d.id && c.active).length}</td>
          <td>{d.active ? "Active" : "Deactivated"}</td>
          <td>{actions("division", d)}</td>
        </tr>)}</tbody>
      </table></div>
    </section>

    <section className="config-card">
      <h2>Recent changes</h2>
      {config.history.length ? <ul className="config-history">{config.history.map((h, i) => <li key={i}>
        <strong>{h.action === "insert" ? "Added" : h.old_value?.name !== h.new_value?.name ? "Renamed" : h.new_value?.active ? "Reactivated" : "Deactivated"}</strong>{" "}
        {h.table_name === "cities" ? "city" : "division"} {h.action === "update" && h.old_value?.name !== h.new_value?.name ? `${h.old_value?.name} → ${h.new_value?.name}` : h.new_value?.name}
        <small>{[h.actor?.full_name, new Date(h.at).toLocaleString()].filter(Boolean).join(" · ")}</small>
      </li>)}</ul> : <p className="admin-loading">No changes yet.</p>}
    </section>
  </main>;
}

function AdminApp({ onExit, user, onSignOut, api = adminApi, people = [], referentials = null, onReferentialsChanged }) {
  const [page, setPage] = useState("home");
  const scopedBrands = user?.role === "Brand Lead" && user.brands?.length ? user.brands : null;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [returnPage, setReturnPage] = useState("approvals");
  const [filters, setFilters] = useState(ADMIN_DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [approvalTab, setApprovalTab] = useState("pending");
  const [expandedManager, setExpandedManager] = useState("");
  // Brand scope is enforced by the database (row-level security); drafts are never visible here.
  const refresh = () => api.listActivities()
    .then(records => { setItems(records.filter(item => item.status !== "draft")); setLoadError(""); })
    .catch(error => setLoadError(error.message))
    .finally(() => setLoading(false));
  useEffect(() => { refresh(); }, [api]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = items.filter(item =>
    inAdminPeriod(item.submittedAt, filters.period) &&
    (!filters.brand || item.brand === filters.brand) &&
    (!filters.division || (Array.isArray(item.division) ? item.division.includes(filters.division) : item.division === filters.division)) &&
    (!filters.type || item.activityType === filters.type));
  const filtersActive = filters.period !== ADMIN_DEFAULT_FILTERS.period || filters.brand || filters.division || filters.type;
  const pending = filtered.filter(item => item.status === "submitted");
  const decided = filtered.filter(item => item.status === "validated" || item.status === "rejected");
  const notCancelled = filtered.filter(item => item.status !== "cancelled");
  const managerSummary = (source) => [...new Set(source.map(item => item.accountablePerson).filter(Boolean))].sort().map(name => {
    const own = source.filter(item => item.accountablePerson === name);
    return {
      name,
      activities: own,
      pending: own.filter(item => item.status === "submitted").length,
      approved: own.filter(item => item.status === "validated").length,
      rejected: own.filter(item => item.status === "rejected").length,
      late: own.filter(isReportLate).length,
    };
  });
  const managers = managerSummary(filtered);
  const lateReports = managers.reduce((total, manager) => total + manager.late, 0);

  const cards = [
    {id: "approvals", variant: "dark", title: "Activities to approve", description: "Read each brief submitted by brand managers, then approve or reject it with a comment.",
      value: <><span className="admin-value-accent">{pending.length}</span>/{notCancelled.length}</>, caption: "activities awaiting your decision"},
    {id: "brand-managers", variant: "gold", title: "Brand managers", description: "Every brand manager with their activations and the reports they submitted.",
      value: managers.length, caption: `${managers.length} brand managers · ${lateReports} reports late`},
    {id: "overview", title: "Overview", description: "Is the plan being delivered, and is every completed activity reported?"},
    {id: "activity-performance", title: "Activity performance", description: "Did activities reach their objectives, and where did the money go?"},
    {id: "planned-vs-realised", title: "Planned VS Realised", description: "How close do we land to what we planned?"},
    {id: "budget-efficiency", title: "Budget & efficiency", description: "What does each contact, case and outlet cost?"},
    {id: "digital-performance", title: "Digital performance", description: "Which assets earn attention, and which should we stop?"},
  ];

  const openPage = (id) => { setPage(id); setSearchOpen(false); setSearch(""); window.scrollTo(0, 0); };
  const openActivity = (item, from) => { setSelected({...item, _isDraft: false}); setReturnPage(from); openPage("activity"); };
  const query = search.trim().toLowerCase();
  const searchResults = query ? [
    ...cards.filter(card => card.title.toLowerCase().includes(query)).map(card => ({key: `page-${card.id}`, kind: "Page", label: card.title, available: Boolean(card.variant), action: () => openPage(card.id)})),
    ...managerSummary(items).filter(manager => manager.name.toLowerCase().includes(query)).map(manager => ({key: `bm-${manager.name}`, kind: "Brand manager", label: manager.name, available: true, action: () => { setExpandedManager(manager.name); openPage("brand-managers"); }})),
    ...items.filter(item => `${item.activityName || ""} ${item.activityType || ""}`.toLowerCase().includes(query)).map(item => ({key: `act-${item.id}`, kind: "Activity", label: item.activityName || "Untitled activity", available: true, action: () => openActivity(item, "approvals")})),
  ].slice(0, 8) : [];

  const filterBar = (
    <div className="admin-filters">
      <select aria-label="Period" value={filters.period} onChange={e => setFilters(f => ({...f, period: e.target.value}))}>
        {ADMIN_PERIODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select aria-label="Brand" value={filters.brand} onChange={e => setFilters(f => ({...f, brand: e.target.value}))}>
        <option value="">All brands</option>{(scopedBrands || BRANDS).map(item => <option key={item} value={item}>{item}</option>)}
      </select>
      <select aria-label="Division" value={filters.division} onChange={e => setFilters(f => ({...f, division: e.target.value}))}>
        <option value="">All divisions</option>{(referentials?.divisions || DIVISIONS).map(item => <option key={item} value={item}>{item}</option>)}
      </select>
      <select aria-label="Activity type" value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))}>
        <option value="">All types</option>{activityTypes.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
      {filtersActive && <button type="button" className="admin-filter-reset" onClick={() => setFilters(ADMIN_DEFAULT_FILTERS)}>Reset</button>}
    </div>
  );

  const activityRow = (item, from) => (
    <button type="button" key={item.id} className="admin-activity-row" onClick={() => openActivity(item, from)}>
      <span className="admin-row-top"><span className="activities-type">{item.activityType || "Activity"}</span><span className={`activities-status ${statusClass(item.status)}`}>{statusLabel(item.status)}</span></span>
      <strong>{item.activityName || "Untitled activity"}</strong>
      <span className="admin-row-meta">{[item.accountablePerson, item.brand, Array.isArray(item.division) ? item.division.join(", ") : item.division].filter(Boolean).join(" · ")}</span>
      <span className="admin-row-meta">◷ {item.startDate || "—"} – {item.endDate || "—"} · Submitted {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "—"}</span>
      {isReportLate(item) && <span className="admin-row-flag">Report late</span>}
    </button>
  );

  let content;
  if (page === "activity" && selected) {
    content = <div className="admin-activity-detail">
      <CreateActivation key={selected.id} initialActivity={selected} approverMode currentUser={user} api={api} people={people} referentials={referentials} onClose={() => { refresh(); openPage(returnPage); }} onDecision={refresh} />
    </div>;
  } else if (page === "approvals") {
    const list = approvalTab === "pending" ? pending : decided;
    content = <main className="admin-main">
      <button type="button" className="admin-back" onClick={() => openPage("home")}>← Dashboard</button>
      <h1 className="admin-page-title">Activities to approve</h1>
      <p className="admin-page-subtitle">Read each brief submitted by brand managers, then approve or reject it with a comment.</p>
      {filterBar}
      <div className="admin-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={approvalTab === "pending"} className={approvalTab === "pending" ? "selected" : ""} onClick={() => setApprovalTab("pending")}>Awaiting decision ({pending.length})</button>
        <button type="button" role="tab" aria-selected={approvalTab === "decided"} className={approvalTab === "decided" ? "selected" : ""} onClick={() => setApprovalTab("decided")}>Decided ({decided.length})</button>
      </div>
      <div className="admin-list">{list.length ? list.map(item => activityRow(item, "approvals")) : <p className="admin-empty">{approvalTab === "pending" ? "No activities are waiting for your decision." : "No decisions yet for these filters."}</p>}</div>
    </main>;
  } else if (page === "configuration" && user?.role === "Owner/Admin") {
    content = <AdminConfiguration api={api} onBack={() => openPage("home")} onChanged={onReferentialsChanged} />;
  } else if (page === "brand-managers") {
    content = <main className="admin-main">
      <button type="button" className="admin-back" onClick={() => openPage("home")}>← Dashboard</button>
      <h1 className="admin-page-title">Brand managers</h1>
      <p className="admin-page-subtitle">Every brand manager with their activations and the reports they submitted.</p>
      {filterBar}
      {managers.length ? <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Brand manager</th><th>Activations</th><th>Awaiting decision</th><th>Approved</th><th>Rejected</th><th>Reports submitted</th><th>Reports late</th></tr></thead>
        <tbody>{managers.map(manager => <Fragment key={manager.name}>
          <tr className={expandedManager === manager.name ? "expanded" : ""} onClick={() => setExpandedManager(current => current === manager.name ? "" : manager.name)}>
            <td><span className="admin-table-name"><Icon name="chevron" size={13} /> {manager.name}</span></td>
            <td>{manager.activities.length}</td><td>{manager.pending}</td><td>{manager.approved}</td><td>{manager.rejected}</td>
            <td title="Result reporting is not built yet">—</td>
            <td className={manager.late ? "admin-late" : ""}>{manager.late}</td>
          </tr>
          {expandedManager === manager.name && <tr className="admin-table-detail"><td colSpan={7}><div className="admin-list">{manager.activities.map(item => activityRow(item, "brand-managers"))}</div></td></tr>}
        </Fragment>)}</tbody>
      </table></div> : <p className="admin-empty">No brand manager has submitted an activity for these filters.</p>}
    </main>;
  } else {
    content = <main className="admin-main">
      <h1 className="admin-welcome">Welcome, {firstName(user)}</h1>
      <p className="admin-page-subtitle">Have a look at what the team has been up to.</p>
      {loadError && <p className="activities-error" role="alert">{loadError} <button type="button" onClick={refresh}>Retry</button></p>}
      {loading && <p className="admin-loading">Loading activities…</p>}
      {filterBar}
      <div className="admin-grid">
        {cards.map(card => {
          const available = Boolean(card.variant);
          return <article key={card.id} className={`admin-card admin-card-${card.variant || "muted"}`}>
            <img className="admin-card-watermark" src={habeshaWordmark} alt="" aria-hidden="true" />
            <h2>{card.title}</h2>
            <p className="admin-card-description">{card.description}</p>
            <div className="admin-card-footer">
              <div>
                <div className="admin-card-value">{available ? card.value : "—"}</div>
                <div className="admin-card-caption">{available ? card.caption : "Not available yet"}</div>
              </div>
              <button type="button" className="admin-card-open" disabled={!available} onClick={() => openPage(card.id)}>Open <Icon name="arrow" size={14} /></button>
            </div>
          </article>;
        })}
      </div>
    </main>;
  }

  return <div className="admin-shell">
    <div className="gold-pattern" />
    <header className="admin-header">
      <div className="admin-header-inner">
        <button type="button" className="admin-brand" onClick={() => openPage("home")}>
          <img className="admin-logo-img" src={habeshaLogoHorizontal} alt="Habesha" />
          <span className="admin-brand-label">ADMIN DASHBOARD</span>
        </button>
        <div className="admin-search">
          <Icon name="search" size={14} />
          <input aria-label="Search" placeholder="Search activities, brand managers, pages..." value={search} onFocus={() => setSearchOpen(true)} onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)} onChange={e => { setSearch(e.target.value); setSearchOpen(true); }} />
          {searchOpen && query && <div className="admin-search-results">
            {searchResults.length ? searchResults.map(result => <button type="button" key={result.key} disabled={!result.available} onMouseDown={e => e.preventDefault()} onClick={result.action}>
              <span>{result.label}</span><small>{result.available ? result.kind : "Not available yet"}</small>
            </button>) : <p>No results for “{search.trim()}”.</p>}
          </div>}
        </div>
        <div className="admin-header-actions">
          <div className="admin-popover-anchor">
            <button type="button" className="admin-icon-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(open => !open); setMenuOpen(false); }}><Icon name="bell" size={16} /></button>
            {notificationsOpen && <div className="admin-popover"><strong>Notifications</strong><p>{pending.length ? `${pending.length} ${pending.length === 1 ? "activity is" : "activities are"} awaiting your decision.` : "No new notifications."}</p></div>}
          </div>
          <span className="admin-lang"><Icon name="globe" size={15} /> EN</span>
          <span className="admin-divider" aria-hidden="true" />
          <div className="admin-popover-anchor">
            <button type="button" className="admin-user" aria-expanded={menuOpen} onClick={() => { setMenuOpen(open => !open); setNotificationsOpen(false); }}>
              <span className="admin-avatar">{user?.initials}</span><span>{user?.shortName}</span><Icon name="chevron" size={14} />
            </button>
            {menuOpen && <div className="admin-popover admin-menu"><p className="admin-menu-identity"><strong>{user?.name}</strong><small>{user?.role}</small></p>{user?.role === "Owner/Admin" && <button type="button" onClick={() => { setMenuOpen(false); openPage("configuration"); }}>Cities & divisions</button>}<button type="button" onClick={onExit}>Open the brand manager app</button><button type="button" onClick={onSignOut}>Sign out</button></div>}
          </div>
        </div>
      </div>
    </header>
    {content}
  </div>;
}

function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activationKey, setActivationKey] = useState(0);
  const isCreating = activePage === "create" || activePage === "activity-detail";
  const openActivity = (item, isDraft) => {
    setSelectedActivity({...item, _isDraft: isDraft});
    setActivationKey(v => v + 1);
    setActivePage("activity-detail");
  };
  const startNew = () => { setSelectedActivity(null); setActivationKey(v => v + 1); setActivePage("create"); };
  const [isAdmin, setIsAdmin] = useState(isAdminRoute);
  useEffect(() => {
    const onHashChange = () => {
      const admin = isAdminRoute();
      setIsAdmin(admin);
      if (!admin) setActivePage("home");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [people, setPeople] = useState([]);
  const [referentials, setReferentials] = useState(null);
  const loadReferentials = () => {
    const api = isAdmin ? adminApi : fieldApi;
    api.getReferentials().then(setReferentials).catch(() => setReferentials(null)); // falls back to the built-in list
  };
  useEffect(() => {
    Promise.all([authService.restore("field"), authService.restore("admin")]).then(([field, admin]) => {
      setUser(field);
      setAdminUser(admin);
      setAuthReady(true);
    });
    // An expired or revoked session signs the person out.
    const field = fieldClient.auth.onAuthStateChange(event => { if (event === "SIGNED_OUT") setUser(null); });
    const admin = adminClient.auth.onAuthStateChange(event => { if (event === "SIGNED_OUT") setAdminUser(null); });
    return () => { field.data.subscription.unsubscribe(); admin.data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    const api = isAdmin ? adminApi : fieldApi;
    if (isAdmin ? adminUser : user) {
      api.listPeople().then(setPeople).catch(() => setPeople([]));
      loadReferentials();
    }
  }, [isAdmin, user, adminUser]);
  const leaveAdmin = () => {
    if (window.location.pathname.startsWith("/manager-login")) window.history.pushState(null, "", "/");
    window.location.hash = "";
    setIsAdmin(false);
    setActivePage("home");
  };
  const signOutUser = async () => { await authService.signOut("field"); setUser(null); setActivePage("home"); };
  const signOutAdmin = async () => { await authService.signOut("admin"); setAdminUser(null); };
  if (!authReady) return <div className="app-loading"><img src={habeshaLogoHorizontal} alt="Habesha" /></div>;
  if (isAdmin) return adminUser
    ? <AdminApp user={adminUser} onExit={leaveAdmin} onSignOut={signOutAdmin} people={people} referentials={referentials} onReferentialsChanged={loadReferentials} />
    : <AdminLogin onSignedIn={setAdminUser} />;
  if (!user) return <UserLogin onSignedIn={(signedIn) => { setUser(signedIn); setActivePage("home"); }} />;
  return <div className="app-shell">
    <div className="gold-pattern" />
    {isCreating ? <CreateActivation key={activationKey} initialActivity={selectedActivity} currentUser={user} people={people} referentials={referentials} onClose={() => setActivePage("activations")} onHome={() => setActivePage("home")} /> : activePage === "activations" || activePage === "activities" ?
      <><ActivitiesList onCreate={startNew} onOpen={openActivity}/><BottomNavigation activePage="activations" onNavigate={setActivePage}/></> :
      <><Header user={user} onSignOut={signOutUser}/><main className="main-content">{activePage === "home" ? <><AttentionCard user={user}/><ModulesSection user={user} onOpen={page => page === "create" ? startNew() : setActivePage(page)}/></> : <PlaceholderPage page={activePage} onBack={() => setActivePage("home")}/>}</main><BottomNavigation activePage={activePage} onNavigate={setActivePage}/></>}
  </div>;
}
export default App;