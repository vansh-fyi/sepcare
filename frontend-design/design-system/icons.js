/**
 * SepCare Iconography System
 * Clean, minimal, outline-based healthcare icon pack.
 * Consistent 24x24 viewBox, 1.75px stroke, rounded terminals.
 */

const SepCareIcons = {
  // =========================================================================
  // NAVIGATION
  // =========================================================================
  home: `<path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15C14 14.4477 13.5523 14 13 14H11C10.4477 14 10 14.4477 10 15V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V10.5Z" />`,
  monitoring: `<path d="M3 13.5L7 13.5L9.5 7.5L14.5 17.5L17 13.5L21 13.5" /><rect x="3" y="3" width="18" height="18" rx="4" />`,
  history: `<circle cx="12" cy="12" r="9" /><path d="M12 7V12L15.5 14" />`,
  alerts: `<path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z" /><path d="M10.3 21A1.94 1.94 0 0 0 13.7 21" />`,
  profile: `<circle cx="12" cy="8" r="4" /><path d="M6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20" />`,
  settings: `<circle cx="12" cy="12" r="3" /><path d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.8 16.9A2 2 0 0 1 17 19.72L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14 20.84V21A2 2 0 0 1 10 21V20.84A1.65 1.65 0 0 0 8.92 19.32A1.65 1.65 0 0 0 7.1 19.65L7 19.72A2 2 0 0 1 4.18 16.9L4.25 16.82A1.65 1.65 0 0 0 3.92 15A1.65 1.65 0 0 0 2.4 13.92H2.24A2 2 0 0 1 2.24 9.92H2.4A1.65 1.65 0 0 0 3.92 8.84A1.65 1.65 0 0 0 3.59 7.02L3.52 6.94A2 2 0 0 1 6.34 4.12L6.42 4.19A1.65 1.65 0 0 0 8.24 4.52A1.65 1.65 0 0 0 9.32 3V2.84A2 2 0 0 1 13.32 2.84V3A1.65 1.65 0 0 0 14.4 4.52A1.65 1.65 0 0 0 16.22 4.19L16.3 4.12A2 2 0 0 1 19.12 6.94L19.05 7.02A1.65 1.65 0 0 0 19.38 8.84A1.65 1.65 0 0 0 20.9 9.92H21.06A2 2 0 0 1 21.06 13.92H20.9A1.65 1.65 0 0 0 19.4 15Z" />`,
  menu: `<line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />`,
  back: `<path d="M15 19L8 12L15 5" />`,
  forward: `<path d="M9 5L16 12L9 19" />`,
  close: `<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />`,
  more: `<circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="5" cy="12" r="1.5" />`,

  // =========================================================================
  // BABY / CARE
  // =========================================================================
  baby: `<circle cx="12" cy="11" r="5" /><path d="M10 11H10.01" stroke-width="2.5" /><path d="M14 11H14.01" stroke-width="2.5" /><path d="M11 13.5C11.3 14 12.7 14 13 13.5" /><path d="M12 6C12 4.5 13 4 14 4" /><path d="M6.5 13.5C5 13.5 4 15 4 17C4 18 5 19 7 19" /><path d="M17.5 13.5C19 13.5 20 15 20 17C20 18 19 19 17 19" />`,
  babyProfile: `<circle cx="12" cy="7" r="4" /><path d="M5 21C5 17 8 15 12 15C16 15 19 17 19 21" /><circle cx="17.5" cy="6.5" r="1" />`,
  caregiver: `<circle cx="9" cy="7" r="3.5" /><path d="M3.5 19C3.5 16 6 14 9 14C12 14 14.5 16 14.5 19" /><circle cx="16.5" cy="10" r="2.5" /><path d="M15 19C15 17.5 16 16.5 17.5 16.5C19 16.5 20 17.5 20 19" />`,
  parent: `<path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />`,
  healthcareProfessional: `<circle cx="12" cy="7" r="4" /><path d="M5 21V19C5 16.2386 7.23858 14 10 14H14C16.7614 14 19 16.2386 19 19V21" /><path d="M12 11V15" /><path d="M10 13H14" />`,
  hospital: `<rect x="4" y="3" width="16" height="18" rx="2" /><path d="M12 7V13" /><path d="M9 10H15" /><path d="M9 21V17H15V21" />`,
  doctor: `<circle cx="12" cy="7" r="4" /><path d="M6 21V18C6 15.5 8 14 12 14C16 14 18 15.5 18 18V21" /><path d="M9 12V14C9 15.6569 10.3431 17 12 17C13.6569 17 15 15.6569 15 14V12" />`,
  medicalRecord: `<path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" /><path d="M14 2V8H20" /><path d="M12 12V18" /><path d="M9 15H15" />`,

  // =========================================================================
  // VITALS
  // =========================================================================
  heart: `<path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />`,
  heartRate: `<path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" /><path d="M3.5 12H7L9 8L12 15L14 10L16 12H20.5" />`,
  temperature: `<path d="M14 14.76V5C14 3.9 13.1 3 12 3C10.9 3 10 3.9 10 5V14.76C8.8 15.65 8 17.06 8 18.65C8 20.86 9.79 22.65 12 22.65C14.21 22.65 16 20.86 16 18.65C16 17.06 15.2 15.65 14 14.76Z" /><circle cx="12" cy="18.5" r="2" />`,
  movement: `<path d="M2 12C4.5 9 7.5 9 10 12C12.5 15 15.5 15 18 12C19.5 10.2 21 10.2 22 11" /><path d="M2 17C4.5 14 7.5 14 10 17C12.5 20 15.5 20 18 17C19.5 15.2 21 15.2 22 16" /><path d="M2 7C4.5 4 7.5 4 10 7C12.5 10 15.5 10 18 7C19.5 5.2 21 5.2 22 6" />`,
  breathing: `<path d="M4 14C5.5 10 8.5 8 12 8C15.5 8 18.5 10 20 14" /><path d="M7 17C8.5 15 10.2 14 12 14C13.8 14 15.5 15 17 17" /><circle cx="12" cy="4" r="1.5" />`,
  pulse: `<path d="M2 12H5L8 5L12 19L16 9L19 12H22" />`,
  activity: `<path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />`,
  sleep: `<path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" />`,

  // =========================================================================
  // DEVICE & WEARABLE
  // =========================================================================
  ankleBand: `<ellipse cx="12" cy="12" rx="9" ry="5" /><rect x="9.5" y="5" width="5" height="4" rx="1.5" /><circle cx="12" cy="7" r="0.75" />`,
  wearable: `<rect x="6" y="7" width="12" height="10" rx="3" /><path d="M9 7V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V7" /><path d="M9 17V21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V17" /><circle cx="12" cy="12" r="2" />`,
  connected: `<path d="M10 14L14 10" /><path d="M15 13L18 10C19.1 8.9 19.1 7.1 18 6C16.9 4.9 15.1 4.9 14 6L11 9" /><path d="M9 11L6 14C4.9 15.1 4.9 16.9 6 18C7.1 19.1 8.9 19.1 10 18L13 15" />`,
  disconnected: `<line x1="2" y1="2" x2="22" y2="22" /><path d="M10 14L11.5 12.5" /><path d="M15 13L18 10C19.1 8.9 19.1 7.1 18 6C16.9 4.9 15.1 4.9 14 6L13.5 6.5" /><path d="M9 11L6 14C4.9 15.1 4.9 16.9 6 18C7.1 19.1 8.9 19.1 10 18L11.5 16.5" />`,
  sync: `<path d="M21.5 2V6H17.5" /><path d="M21.34 15.57C20.37 18.17 18.05 20.08 15.25 20.67C12.45 21.26 9.53 20.47 7.43 18.57C5.33 16.67 4.31 13.88 4.7 11.11C5.09 8.34 6.84 5.92 9.4 4.67L21.5 6" />`,
  syncing: `<path d="M21 12A9 9 0 0 0 6 5.3L3 8" /><path d="M3 3V8H8" /><path d="M3 12A9 9 0 0 0 18 18.7L21 16" /><path d="M21 21V16H16" />`,
  battery: `<rect x="2" y="6" width="17" height="12" rx="2" /><path d="M21 10V14" /><line x1="6" y1="10" x2="6" y2="14" /><line x1="9" y1="10" x2="9" y2="14" /><line x1="12" y1="10" x2="12" y2="14" />`,
  charging: `<rect x="2" y="6" width="17" height="12" rx="2" /><path d="M21 10V14" /><path d="M11 8L8 13H12L10 16" />`,
  signal: `<line x1="4" y1="18" x2="4" y2="18.01" stroke-width="2.5" /><line x1="8" y1="18" x2="8" y2="15" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="16" y1="18" x2="16" y2="9" /><line x1="20" y1="18" x2="20" y2="6" />`,
  bluetooth: `<path d="M7 7L17 17L12 22V2L17 7L7 17" />`,

  // =========================================================================
  // STATUS & SEMANTICS
  // =========================================================================
  safe: `<circle cx="12" cy="12" r="9" /><path d="M8.5 12.5L11 15L15.5 9.5" />`,
  caution: `<path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.55 21H20.45A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" />`,
  critical: `<circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />`,
  information: `<circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="8.01" stroke-width="2" /><line x1="12" y1="11" x2="12" y2="16" />`,
  success: `<circle cx="12" cy="12" r="9" /><path d="M8 12L11 15L16 9" />`,
  warning: `<path d="M12 2L2 20H22L12 2Z" /><line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="17" r="0.75" />`,
  error: `<circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.75" />`,

  // =========================================================================
  // ACTIONS & UTILITIES
  // =========================================================================
  search: `<circle cx="11" cy="11" r="7" /><path d="M21 21L16.65 16.65" />`,
  filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />`,
  sort: `<path d="M3 6H15" /><path d="M3 12H11" /><path d="M3 18H7" /><path d="M18 9L21 6L24 9" /><path d="M21 6V18" />`,
  add: `<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />`,
  edit: `<path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" /><path d="M18.5 2.5A2.12 2.12 0 0 1 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" />`,
  delete: `<polyline points="3 6 5 6 21 6" /><path d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" />`,
  download: `<path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />`,
  share: `<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />`,
  refresh: `<polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9A9 9 0 0 1 18.36 5.64L23 10M1 14L5.64 18.36A9 9 0 0 0 20.49 15" />`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="3" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />`,
  clock: `<circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" />`,
  expand: `<polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />`,
  collapse: `<polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />`,
  view: `<path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" /><circle cx="12" cy="12" r="3" />`,
  hide: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.82 16.14" /><line x1="1" y1="1" x2="23" y2="23" />`,
  insight: `<path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />`
};

/**
 * Helper to render an icon SVG string
 * @param {string} name - Icon name from SepCareIcons
 * @param {number} size - Desired size in pixels (default: 24)
 * @param {string} className - Optional CSS class
 * @returns {string} SVG HTML string
 */
function renderSepCareIcon(name, size = 24, className = '') {
  const content = SepCareIcons[name] || SepCareIcons.information;
  return `<svg class="sc-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
}

// Icon Categorization metadata for the gallery showcase
const SepCareIconCategories = {
  "Navigation": ["home", "monitoring", "history", "alerts", "profile", "settings", "menu", "back", "forward", "close", "more"],
  "Baby / Care": ["baby", "babyProfile", "caregiver", "parent", "healthcareProfessional", "hospital", "doctor", "medicalRecord"],
  "Vitals": ["heart", "heartRate", "temperature", "movement", "breathing", "pulse", "activity", "sleep"],
  "Device": ["ankleBand", "wearable", "connected", "disconnected", "sync", "syncing", "battery", "charging", "signal", "bluetooth"],
  "Status": ["safe", "caution", "critical", "information", "success", "warning", "error"],
  "Actions": ["search", "filter", "sort", "add", "edit", "delete", "download", "share", "refresh", "calendar", "clock", "expand", "collapse", "view", "hide", "insight"]
};

if (typeof window !== 'undefined') {
  window.SepCareIcons = SepCareIcons;
  window.renderSepCareIcon = renderSepCareIcon;
  window.SepCareIconCategories = SepCareIconCategories;
}
