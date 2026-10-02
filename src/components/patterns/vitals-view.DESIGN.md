# VitalsView

The same route-independent composition serves caregiver and parent detail screens. Supply ascending `ReadingEntry[]`; the latest entry supplies the summary and overall StatusCard/Badge. The Badge repeats the literal status word with its icon and color. Empty readings and absent risk do not claim an overall Safe status.

Six shared VitalDetailCards form one, two, or three columns. Temperature, HR/Temp Ratio, and Activity Level use original readings and computed breakdown values. Cardiac Autonomic, Perfusion Index, and Respiratory Pattern are explicitly unavailable, without values or charts. Vitals is a summary; Stats owns the trend charts.

`getVitalMetric` is the common data mapping for both views. The corresponding abnormal/trending boolean maps to critical when true and safe when explicitly false; the backend has no per-feature caution tier. This differs deliberately from the aggregate three-tier status. Null ratios remain missing, displayed as a dash with an explanation, never zero. Only the displayed ratio is rounded to one decimal.

RiskTimeline receives getRiskHistory's newest-first hourly readings, with backend status mapped at the boundary. This does not aggregate or modify chart readings. The stateless VitalDetailCard is usable in server and client trees; only its chart renderer requires a client boundary.

Missing risk assessments and null computed ratios use `unscored`, never Safe. VitalDetailCard preserves raw values and charts with neutral text/lines and visible “Not yet assessed.” copy; `unavailable` remains reserved for unsupported signals and suppresses measurements. RiskTimeline accepts `unscored` to retain unassessed history with a neutral icon and label.
