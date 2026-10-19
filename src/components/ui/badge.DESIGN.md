# Badge

Badge renders a compact rounded rectangle with an 8px radius from --radius-badge. It uses soft semantic fills and contrasting text, with no border, ring, or shadow. Shape and geometry belong to this shared component; consumers supply status and label.

Clinical statuses safe, caution, and critical show the corresponding shared Icon before the label by default. Neutral and brand are nonclinical alternatives without an automatic icon. The status prop defaults to safe; variant is a compatibility alias. showIcon is an independent appearance choice: true (default) renders icon plus text for clinical tones; false renders text only. Neither choice changes status, fill, text color, or radius. The documentation playground controls both the rendered badges and copyable code. Standard span attributes and className are supported; asChild is not supported.

Use short labels and retain text so color never carries meaning alone. Vitals summaries use Stable, Caution, Critical, Unscored, or Unavailable; the last two use neutral so absent assessments and unsupported signals cannot imply health. VitalDetailCard owns placement at the far right of its summary header and always passes showIcon={false}. Other consumers choose icon visibility explicitly or retain the icon default. Trend cards retain their latest numeric value rather than a badge.

Live preview, copyable code, supported props, and token references: /design-system/docs/badge. Changing this component updates documentation, clinical cards, infant-status sections, and sensor-state examples together.


## Shared surface depth

Clinical badges use light tonal gradients: --gradient-badge-safe (green-100–200), --gradient-badge-caution (yellow-100–200), and --gradient-badge-critical (pink-100–200). Neutral and brand retain --gradient-status-sheen. This adds a soft highlight without changing icon options, 8px radius, or the borderless/shadowless contract.

## Connection and safe signifiers

DeviceCard and DeviceDetails share DeviceConnectionLabel: an sm non-emoji PulseWave beside Connected, or a static neutral pulse beside Disconnected. Connectivity is independent of battery and infant risk. Healthy device tiles and safe VitalDetailCard icon tiles (Vitals and Stats) use --gradient-signifier-safe with --color-signifier-safe-fill and white --color-signifier-safe-on-fill. The gradient runs from a green-700/800 blend through green-800 to green-900. Chart lines and values keep their existing semantic colors. Clinical badges use lighter 100–200 tonal gradients with dark text, retaining their borderless 8px radius and independent showIcon option; Vitals badges remain text-only. Other tile states retain their established caution, critical, and neutral treatments.
