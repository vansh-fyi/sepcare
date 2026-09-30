# Input

Input uses the shared input radius, border, body size, and focus ring. Its size and color classes must both survive class merging. The merger's custom size groups are configured in `src/lib/utils.ts`.

For new forms, compose Input with Field, FieldLabel, FieldDescription, and FieldError. Connect helper text and errors with `aria-describedby`, and use `aria-invalid` for validation failures. Use an appropriate HTML type and autocomplete value.

The existing `error` and `errorMessage` props remain available for inline errors. Input generates an error ID, connects it to the input, and preserves any existing `aria-describedby` value. The icon comes from the shared Icon component.

Do not fix form spacing with per-page control overrides. Update Field or Input so the correction reaches every form. Examples are at `/design-system/docs/input` and `/design-system/docs/field`.

## Figma provenance

No dedicated Figma frame was found for Input.
