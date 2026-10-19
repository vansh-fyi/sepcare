# Home overview

HomeOverview is the shared Home composition for caregiver, parent, and the clinical-dashboard example. It renders InfantStatusSection, a Vitals heading and supplied See all action beside it, HomeVitals, and Instructions. It owns internal geometry and state-specific copy. Product routes supply measured values and units; examples supply explicitly illustrative scenarios.

Props: optional status (safe/caution/critical), required vitals (HomeVitals props), and required seeAll (ReactNode). Missing status shows an assessment-unavailable explanation and care-team guidance rather than safe feeding instructions. Do not infer status from missing data. Safe shows three routine instruction cards; caution asks the reader to review highlighted vitals with the care team; critical asks them to follow emergency instructions. The emergency button and demo feedback are owned by InfantStatusSection, never duplicated in Instructions.

InfantStatusSection retains the explicit status Badge for redundant coding. Its key follows status so demo feedback clears when the scenario changes. Parent and caregiver share this composition and the same underlying readings; the parent See all destination remains /parent/detail/vitals, while caregiver links to /caregiver/vitals. Parent Home has no persistent bottom navigation.

Use HomeVitals alone for a three-metric component preview; use HomeOverview for the complete Home screen content. Do not duplicate the summary, metric arrangement, and instructions in route files.
