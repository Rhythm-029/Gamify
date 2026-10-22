# Chapter 3 Dossier: The Data Integrity Crisis (Project Amigo)

## 📌 Executive Summary
Development is progressing following the Sprint 1 greenlight. During early validation of the Project Amigo prototype, Daniel discovers inconsistencies in employee appraisal records and leave balances. A working interface does not guarantee reliable data. The player must make a disciplined delivery decision: isolate and contain the defect, establish an authoritative validation plan, and keep unaffected engineering moving safely.

## 🎯 Key Discoveries
- Appraisal review mappings in prototype test data link to incorrect employee IDs (EMP-84021 mapped to EMP-84099).
- Leave balances in prototype display values inconsistent with ICICI authoritative databases (Casual Leave shows 24 vs 12; Privilege Leave calculation underflow).
- Contained strictly within prototype test data; no production incident.
- Core lesson: Contain the defect, establish what is wrong, assign ownership, and let unaffected work continue safely.
