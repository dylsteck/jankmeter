# Security Audit Deep Dive: Should You Act?

This document goes deeper on each finding: **real-world risk**, **whether to change**, and **exact implementation** if you do.

---

## Finding 1: Network URL Data Leak

### Where URLs Flow

| Location | Uses URL? | Risk |
|---------|-----------|------|
| Toolbar UI | **No** — only shows `inFlight` count | None |
| Download JSON | **Yes** — full `recentRequests` with URLs | High (file can be shared) |
| `onMetrics` callback | **Yes** — full `AllMetrics` | Medium (app may forward elsewhere) |
| `getMetrics()` | **Yes** — same payload | Medium |

The toolbar never renders URLs in the DOM. They only appear in exported data and callbacks.

### Real-World Risk Assessment

**Low-risk scenarios:**
- Dev uses toolbar locally, never downloads, never passes `onMetrics`
- Dev downloads metrics for personal debugging and doesn’t share the file

**Higher-risk scenarios:**
- Dev downloads metrics and shares the JSON (Slack, email, bug reports) — URLs with tokens go with it
- App uses `onMetrics` to send metrics to analytics/logging — full URLs are transmitted
- Dev tests auth flows — URLs like `?access_token=...` or `?api_key=...` are captured

**Verdict:** The package is dev-only, but dev environments often use real tokens and real URLs. A single shared metrics file or misconfigured `onMetrics` can leak credentials. **Worth fixing.**

---

### Recommended Change: URL Sanitization

**Approach:** Strip query strings and fragments before storing URLs. Keep origin + path for debugging (e.g. `/api/users`, `https://api.example.com/v1/orders`).

**Why this works:**
- Sensitive data is almost always in query params (`?token=`, `?api_key=`, etc.)
- Paths are usually safe and still useful for debugging
- No config needed — safe by default

**What you keep:**
- `https://api.example.com/users` ✓
- `https://api.example.com/orders/123` ✓

**What you remove:**
- `?access_token=eyJ...` ✗
- `?api_key=sk-xxx` ✗
- `?session=abc123` ✗

---

### Implementation

**1. Add a sanitizer in `src/core/network-collector.ts`:**

```typescript
/** Strip query string and fragment to avoid leaking tokens/keys in URLs */
function sanitizeUrl(url: string): string {
  try {
    const u = new URL(url, 'https://_');
    return u.origin + u.pathname;
  } catch {
    return '[invalid-url]';
  }
}
```

**2. Use it when creating `NetworkRequest` objects:**

In `patchFetch` (around line 69):
```typescript
const req: NetworkRequest = { url: sanitizeUrl(url), method, startTime };
```

In `patchXHR` (around line 125):
```typescript
const req: NetworkRequest = {
  url: sanitizeUrl((this as any).__jmUrl ?? ''),
  method: (this as any).__jmMethod ?? 'GET',
  startTime,
};
```

In `observeResources` (around line 164):
```typescript
this.addRequest({
  url: sanitizeUrl(res.name),
  method: 'GET',
  // ...
});
```

**3. Handle relative URLs:** `new URL('/api/users', 'https://_')` gives `https://_/api/users`. The origin is wrong but the path is correct. For relative URLs like `/api/users`, you could do:

```typescript
function sanitizeUrl(url: string): string {
  try {
    // Use location.origin for relative URLs
    const base = typeof location !== 'undefined' ? location.origin : 'https://_';
    const u = new URL(url, base);
    return u.origin + u.pathname;
  } catch {
    return '[invalid-url]';
  }
}
```

**4. Optional: configurable behavior**

If you want to support “full URLs for trusted devs”:

```typescript
// In JankMeterConfig
network?: {
  redactUrls?: boolean;  // default true
};

// In NetworkCollector constructor
constructor(bus: EventBus, maxHistory = 60, redactUrls = true) {
  this.redactUrls = redactUrls;
  // ...
}

// When creating req
url: this.redactUrls ? sanitizeUrl(rawUrl) : rawUrl,
```

Recommendation: start with **always sanitize**, no config. Add an opt-out only if users ask.

---

### What Not To Do

- **Don’t** remove URLs entirely — paths are useful for debugging.
- **Don’t** try to redact specific param names — easy to miss variants (`api_key`, `apikey`, `API_KEY`).
- **Don’t** add a regex-based sanitizer — `URL` is simpler and more reliable.

---

## Finding 2: React Component Display Names

### Where Names Flow

- `recentRenders` in metrics
- Download JSON
- `onMetrics` callback
- **Not** rendered in the toolbar DOM

### Real-World Risk

- Names come from `displayName`, `name`, or `fiber.type` — developer-controlled.
- Malicious names require control over the app’s components; at that point the attacker already has full control.
- Typical names: `"App"`, `"Button"`, `"UserCard"` — not sensitive.

**Verdict:** Risk is negligible. **No change recommended.**

### If You Want To Harden Anyway

You could sanitize to alphanumeric + underscore:

```typescript
function sanitizeComponentName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 64) || 'Unknown';
}
```

But this can break valid names (e.g. `"UserProfile-Header"` → `"UserProfile_Header"`). Not worth it unless you have a specific threat model.

---

## Summary: Action Items

| Finding | Act? | Effort | Change |
|---------|------|--------|--------|
| Network URL leak | **Yes** | ~15 min | Add `sanitizeUrl()`, use it in all 3 places that create `NetworkRequest` |
| React component names | **No** | — | Document only, or skip |

---

## Testing the URL Sanitization

Add a test in `tests/network-collector.test.ts`:

```typescript
// Add to existing test file or create a describe block
describe('URL sanitization', () => {
  it('strips query params from URLs', () => {
    // Mock fetch to capture what gets stored
    const requests: NetworkRequest[] = [];
    const bus = new EventBus();
    bus.on('network', (m: NetworkMetrics) => {
      requests.push(...m.recentRequests);
    });
    const collector = new NetworkCollector(bus);
    collector.start();

    fetch('https://api.example.com/users?token=secret123&api_key=sk-xxx');

    // After request completes, check stored URL
    // Should be https://api.example.com/users
    expect(requests.some(r => r.url.includes('token') || r.url.includes('api_key'))).toBe(false);
    expect(requests.some(r => r.url === 'https://api.example.com/users')).toBe(true);

    collector.stop();
  });
});
```

---

## Checklist

- [ ] Add `sanitizeUrl()` to `network-collector.ts`
- [ ] Use it in `patchFetch`, `patchXHR`, `observeResources`
- [ ] Add unit test for URL sanitization
- [ ] Update `SECURITY_AUDIT_REPORT.md` to note the fix
- [ ] (Optional) Add a short note in README about URL redaction
