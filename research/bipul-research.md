# Bipul Research Notes

Source: FigJam section `1:61` (`Solutions & Technology`)

Note: The notes that had no exposed author in Figma MCP output are assigned to Bipul per user instruction.

## Telemedicine, Remote Care, And Monitoring

### `1:66` Telemedicine & rural health clinics

Telemedicine & rural health clinics eSanjeevani (India): 340M+ telehealth consultations; AI ambient scribes now cut clinician documentation time ~20 hrs/week

### `1:79` Remote patient monitoring

Remote patient monitoring Continuous glucose/cardiac monitors tied to AI alerts now standard for chronic disease management at scale

### `64:348` Mind Without Borders

Mind Without Borders connecting children across countries during infectious-disease outbreaks through anonymous peer communication, health tracking, and links to psychotherapists and volunteers, explicitly designed to reduce burden on healthcare workers by returning structured information back into the system rather than letting it dead-end with the child.

## Diagnostics, Screening, And Point-Of-Care Devices

### `1:70` AI disease diagnosis & health wearables

AI disease diagnosis & health wearables Wearables shown in RCTs to nearly double early detection of postoperative complications; emerging contactless mmWave/Wi-Fi vital-sign sensing

### `64:341` JivaScope

JivaScope a pocket sized AI device for self screening heart and lung disease without needing a doctor, internet, or electricity, designed specifically to bring clinical-grade diagnostics to rural and low resource settings in India, with UI adapted for low literacy users.

### `89:358` OncoALERT

OncoALERT (James Dyson Award 2025, India) — a rapid, needle-free, paper-based nanotech device for oral cancer screening. Oral cancer detection in India normally means a biopsy referral, a wait for lab results, often a trip to a city hospital — and by the time results return, many rural patients have already lost the window for early intervention or simply never returned for the report. This compresses that entire chain into a paper strip test done chairside. [Dyson](https://www.dyson.co.uk/discover/sustainability/james-dyson-award/james-dyson-award-2025-national-winners)

### `89:371` Schistoscope

Schistoscope (James Dyson Award finalist) — a 3D-printed, phone-based diagnostic device that automates and simplifies detection of a waterborne parasitic disease in remote areas, using a single urine-sample photo and an algorithm to grade infection severity, explicitly built so local healthcare workers with low education can perform the test themselves — same move as JivaScope: pushing lab-grade diagnostic capability down to whoever is actually present, not whoever is credentialed. [James Dyson AwardJames Dyson Award](https://www.jamesdysonaward.org/en-US/2019/project/schistoscope/)

### `89:378` DioTeX

DioTeX — a point-of-care internal hemorrhage diagnostic tool that requires minimal training, aimed at trauma cases where the normal path — imaging at a proper trauma center — simply isn't reachable in time in a low-resource or rural setting. Same underlying insight: for time-critical conditions, "the correct facility exists but is too far away" is functionally the same as "no facility exists."

### `89:412` BEMPU TempWatch

BEMPU TempWatchComponents: one thermistor (temperature sensor), a tiny microcontroller, an LED, and a speaker that's the entire device. It's a silicone bracelet worn on a newborn's wrist that continuously monitors temperature for up to a month, flashing a light and sounding an alarm when the temperature drops below 36.5°C, alerting even caregivers with low health literacy.The insight, not the tech: hypothermia is one of the leading preventable causes of newborn death in India, but most hospitals don't monitor it continuously because staff are stretched thin, and most parents don't know to check for it at home. The founder built it after a mother's baby died of undetected hypothermia in a Karnataka hospital.

### `90:429` Ayu Devices

Ayu Devices — digital stethoscope attachment (born at IIT Bombay's MEDIC conclave, 2015)The origin: two engineers and a doctor met at a device-innovation event hosted by IIT Bombay and identified a genuinely narrow, well-scoped problem: a standard stethoscope only works as well as the trained ear listening through it, and faint heart/lung sounds are easy to miss even for experienced clinicians — let alone the ASHA worker or nurse who's often the only person physically present in a village.The device: rather than inventing a new instrument, they built a small attachment that clips onto any existing stethoscope, amplifying heart and lung sounds and converting them into a shareable audio file — so a community health worker with no cardiology training can record a patient's chest sounds and send them to a doctor elsewhere for interpretation. It went through a fellowship at IIT Bombay's Biomedical Engineering and Technology Centre (BETiC), where the team ran clinical trials and refined it for market.

### `90:439` Sanket / SanketLife ECG

Sanket / SanketLife ECG — a handheld single lead ECG device roughly the size of a smartphone, deployed widely across Indian primary health centers and ambulances; same "compress the diagnostic step, keep the expert judgment remote" logic as the other two.

## Public Health Campaigns, Vaccination, And Medical Logistics

### `1:75` Vaccination drives & anti-smoking campaigns

Vaccination drives & anti-smoking campaigns mRNA platforms reused beyond COVID (RSV, malaria R21/Matrix-M scaling across Africa); WHO FCTC tobacco-tax pushes

### `7:225` Lenacapavir

Lenacapavir — twice-yearly HIV PrEP injection, global rollout 2025

### `7:229` Zipline

Zipline medical delivery drones (Rwanda, Ghana, US)

### `7:237` GAVI/CEPI

GAVI/CEPI 100 Days Mission for pandemic vaccines

## Mental Health Support

### `7:233` Wysa / Woebot

Wysa / Woebot — AI mental health chat support

## Health Data, Interoperability, And Digital Ecosystems

### `49:309` Interoperability Standards

Interoperability Standards: Initiatives like HL7 (Health Level Seven International) and FHIR (Fast Healthcare Interoperability Resources) provide global standards for exchanging healthcare information electronically between different EHR systems and applications.

### `49:319` National Digital Health Strategies

National Digital Health Strategies: Countries like the UK (NHS Digital), Canada, and Australia have implemented national strategies to create integrated digital health ecosystems, often including unique patient identifiers and centralized data platforms.

### `89:419` Khushi Baby

Khushi Baby (Rajasthan, India — NFC pendant, deployed with state government) Not a sensor in the biometric sense, but a genuinely feasible component: a low-cost NFC chip embedded in a necklace pendant, worn by mothers/children, storing immunization and health records that a community health worker can read and update just by tapping a phone against it

## Clinical Handover, Care Coordination, And Service Design

### `67:373` Connection Nodes

Connection Nodes Provider-to-provider (clinical handover) System-to-system Formal-to-informal Time-based connection

### `71:380` Kaiser Permanente + IDEO

Kaiser Permanente + IDEO — Nurse Knowledge Exchange (the canonical case study in this exact space)The gap: Nurses vanished into a station every shift change to hand off patient information verbally, unstructured, away from the patient. Patients described hospital wards as a "ghost town" during these windows, and nurses were pulled away from patient care to exchange updates about the various needs of each patient. Notes were also non-standardized — each nurse wrote handoff information in their own personal format, with no shared system.

### `89:392` Aravind Eye Care System

Aravind Eye Care System (India, process/service redesign no device at all) The problem was cataract blindness at scale with too few surgeons. Instead of inventing new surgical tech, Aravind redesigned the surgical workflow itself — modeled loosely on assembly-line thinking, with two operating tables running in parallel per surgeon, pre- and post-op tasks handled entirely by trained non-physician staff so surgeons only do the parts requiring their specific skill. No new instrument, no app — purely a reallocation of who does what, when. It became one of the most cited service-design case studies globally precisely because the "innovation" was entirely organizational.

### `89:399` IMCI

IMCI — Integrated Management of Childhood Illness (WHO/UNICEF, paper-based) Rather than build a diagnostic device, this is a structured decision flowchart on paper that lets a minimally trained health worker correctly triage a sick child (fever, cough, diarrhea) through a fixed sequence of yes/no observable signs — no lab test, no equipment — designed specifically so someone without a medical degree can reach a safe, correct decision.

## Low-Tech Signaling And Field Coordination

### `63:147` Vial of Life

Vial of Life (US) a door sticker tells EMTs/firefighters to check the fridge for a vial with the resident's full medical info; nationally recognized by responders, zero infrastructure

### `63:151` UK sheltered housing pull-cords

UK sheltered housing pull-cords post-WWII warden call systems: hardwired cords in bathroom/bedroom summon an on-site warden instantly; direct precedent for the pull-string alarm, still in use today

### `63:155` Hobo code

Hobo code (early 1900s US) — itinerant workers chalked/coaled symbols on gates and doors to silently pass safety and help info to the next traveler — the historic proof that a shared door-symbol language works at scale

### `63:159` IRS malaria house-marking

IRS malaria house-marking — vector-control teams mark/sticker houses after indoor spraying so any worker can instantly see coverage status without asking or checking a list
