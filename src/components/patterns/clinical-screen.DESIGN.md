# Clinical screen

ClinicalScreen owns the viewport geometry for caregiver routes, parent routes, and the clinical-dashboard example: h-dvh white canvas, stationary supplied header, optional notice, independently scrolling main, max-w-6xl content, 16px horizontal/24px vertical main padding, and a 24px content gap. Optional navigation is a normal flex child after main; NavBar uses position="static" and shrink-0. Do not add fixed-nav bottom padding inside these screens.

Props: header and children are required ReactNode; navigation and notice are optional ReactNode. The notice identifies static prototype data. Page content, navigation destinations, and application state remain with callers. The example's scenario controls and black frame remain outside the product canvas in ExampleBrowser.

ClinicalMetricGrid supplies the shared six-card layout: 12px gap, one column on phone, two from 768px, three from 1280px. Pass VitalDetailCard children, preserving each caller's actual values and availability. This layout does not convert illustrative examples into supported backend data.

Use ClinicalScreen for a full clinical viewport; use PageShell for an ordinary article page. Both product and example consumers must import this implementation rather than reproducing its classes.
