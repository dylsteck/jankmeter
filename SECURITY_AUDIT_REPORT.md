# Security Audit Report: Merged PRs

**Audit Date:** March 17, 2026  
**Scope:** All merged PRs (1 total)  
**Methodology:** Checked out codebase at each PR merge point and performed manual security review

---

## Summary

| PR | Branch | Merge Commit | Findings |
|----|--------|--------------|----------|
| #1 | feat/v1.0 | d25056e | 1 medium, 1 low |

---

## PR #1: feat/v1.0 (d25056e)

**Merged:** March 15, 2026  
**Scope:** Initial jankmeter v0.1.0 implementation — core collectors, toolbar, plugins, docs, examples

### Files Reviewed

- `src/core/network-collector.ts` — fetch/XHR patching, PerformanceObserver
- `src/core/memory-collector.ts` — performance.memory polling
- `src/core/react-collector.ts` — bippy/DevTools hook, fiber traversal
- `src/core/delay-collector.ts` — Event Timing API
- `src/core/fps-collector.ts` — rAF, LAF/LongTask observer
- `src/core/toolbar.ts` — DOM rendering, download, localStorage
- `src/core/sparkline.ts` — SVG generation
- `src/core/event-bus.ts`, `shadow-dom.ts`, `styles.ts`, `types.ts`
- `src/core/index.ts` — init, production/SSR guards
- `src/vite/index.ts`, `src/webpack/index.ts` — plugin config injection
- `src/next/index.tsx`, `src/react/index.tsx` — component wrappers
- `src/noop.ts` — production stub

---

## Findings

### 1. [MEDIUM] Network URL Data Leak

**Location:** `src/core/network-collector.ts`, `src/core/toolbar.ts`, `src/core/types.ts`

**Description:** The network collector captures and stores full request URLs from:

- Patched `fetch` (line 62)
- Patched `XMLHttpRequest` (lines 112–114)
- `PerformanceObserver` resource entries (line 165)

URLs are stored in `NetworkRequest` objects and flow through:

- Event bus → toolbar `latestMetrics`
- `onMetrics` callback (full `AllMetrics` including `recentRequests`)
- Downloaded JSON when the user clicks "Download metrics"

**Risk:** URLs often contain sensitive data:

- API keys in query parameters (`?api_key=...`)
- Session/OAuth tokens (`?token=...`, `?access_token=...`)
- Internal service endpoints
- PII in paths

If an app uses `onMetrics` to send metrics to analytics or logging, full URLs would be transmitted. The download feature explicitly exports all metrics, including URLs.

**Recommendation:** Add URL redaction/sanitization:

- Strip or redact query parameters by default
- Option to disable URL capture entirely
- Option to provide a custom URL sanitizer

**Status:** ✅ Fixed — `sanitizeUrl()` strips query strings and fragments before storing URLs. See `SECURITY_AUDIT_DEEP_DIVE.md` for details.

---

### 2. [LOW] React Component Display Names in Metrics

**Location:** `src/core/react-collector.ts`, `src/core/types.ts`

**Description:** `recentRenders` stores `{ name: string; duration: number }`. The `name` comes from `bippy.getDisplayName(fiber)` or `fiber?.type?.displayName || fiber?.type?.name || 'Unknown'`.

**Risk:** Component names are usually safe (e.g. `"App"`, `"Button"`), but could be user-controlled in edge cases (e.g. dynamic component names). They are not rendered in the toolbar DOM, only in the download JSON and `onMetrics` payload.

**Recommendation:** Treat as low risk; document that component names are developer-controlled. Consider truncating or sanitizing if future use renders them in the UI.

---

## Items Verified as Safe

| Area | Verification |
|------|--------------|
| **Vite/Webpack plugin config injection** | Config is passed through `JSON.stringify(serializableConfig)`. Functions are filtered out. No script injection via config. |
| **Sparkline/toolbar innerHTML** | `renderSparkline` and `renderBarChart` receive only numeric arrays and fixed hex colors from `severityColor()`. No user-controlled strings. |
| **Production safety** | Conditional exports (noop in production), `NODE_ENV` guard in `init()`, `sideEffects: false`. |
| **SSR safety** | Guards for `window`/`document` before running collectors. |
| **Event bus** | Internal pub/sub; no external exposure beyond `onMetrics` and `getMetrics()`. |
| **Shadow DOM** | Toolbar isolated; styles use `textContent`, not `innerHTML`. |
| **Memory collector** | Only heap size numbers; no memory contents. |
| **Delay/FPS collectors** | Only numeric timing data. |
| **localStorage** | Only `{ visible, minimized }`; no sensitive data. |
| **Download blob** | `URL.createObjectURL` used and revoked; no leak. |

---

## Notes

- Only one merged PR exists in the repository.
- Codebase was reviewed at merge commit `d25056e`.
- Subsequent commits (e.g. stack overflow guard for `traverseRenderedFibers`) may have addressed other issues; this report covers the merged PR state only.
