---
name: chrome-devtools-debugging
description: Procedures and techniques for diagnosing front-end rendering issues, console errors, network requests, DOM layout glitches, and performance profiles using Chrome DevTools or DevTools MCP protocol. Use this skill when inspecting live browser state or debugging UI runtime errors.
---

# Chrome DevTools Debugging Skill

This skill outlines guidelines for inspecting web applications, capturing console output, monitoring network traffic, and debugging styling issues using Chrome DevTools.

## Key Inspection Areas

### 1. Console & Runtime Errors
- Look for uncaught React exceptions, hydration mismatches, and promise rejections.
- Verify warning logs for missing props or deprecated API calls.

### 2. Network Activity
- Check API / fetch calls (status codes 4xx / 5xx).
- Inspect payload headers, query parameters, and response structures.
- In this demo project, verify IndexedDB and fake Firestore request cycles.

### 3. DOM & CSS Layout
- Inspect element bounding boxes, padding/margin collisions, and flex/grid alignment.
- Verify responsive breakpoints at desktop, tablet, and mobile viewport widths.
