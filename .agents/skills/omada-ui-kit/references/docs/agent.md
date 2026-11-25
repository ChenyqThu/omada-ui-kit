# Agent Bridge Runtime (`@chenyqthu/omada-ui-kit/agent`)

Deterministic in-page UI state inspection and action execution (`snapshot()`, `query()`, `act()`, `allow`) inspired by UI-SDK, with automatic `[REDACTED]` secret masking.

### `OmadaAgentProvider` (`component` · `@chenyqthu/omada-ui-kit/agent`)
Deterministic Agent Bridge provider for Omada UI Kit. Exposes structured `snapshot()`, `query()`, `act()`, and `allow` governance with automatic `[REDACTED]` masking on `secret` / password controls.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `allow` | `OmadaAgentAllow` | No | Permission policy controlling agent capabilities: - `true` (default): allow `snapshot()`, `query()`, and `act()` - `false`: read-only (`snapshot()` / `query()` allowed, `act()` blocked) - `string[]`: allowlist of `agentId` or `prefix*` patterns permitted for `act()` - `OmadaAgentPermissionPolicy`: granular `read`, `act`, `allowedIds`, `deniedIds` - `(req) => boolean`: custom synchronous guard |
| `children` | `React.ReactNode` | Yes |  |
| `exposeWindowBridge` | `boolean` | No | Optional imperative callback invoked with the live `OmadaAgentRuntime` handle, or `exposeWindowBridge` to attach `window.__OMADA_AGENT__` for browser automation. |

### `useOmadaAgent` (`hook` · `@chenyqthu/omada-ui-kit/agent`)
Accesses the deterministic `<OmadaAgentProvider>` runtime (`snapshot`, `query`, `act`, `allow`).

### `useOmadaAgentAction` (`hook` · `@chenyqthu/omada-ui-kit/agent`)
Registers a named standalone action with the nearest `<OmadaAgentProvider>` when `config.id` is defined. Safely no-ops when rendered outside `<OmadaAgentProvider>` or without an `id`.

### `useOmadaAgentControl` (`hook` · `@chenyqthu/omada-ui-kit/agent`)
Registers an interactive Omada UI control with the nearest `<OmadaAgentProvider>` when `config.id` is defined. Safely no-ops when rendered outside `<OmadaAgentProvider>` or without an `id`.

## Built-in `agentId` Support
Pass `agentId="domain.control"` to `SSwitch`, `SSelect`, `SInput` (optional `secret`), `SPasswordInput` (`secret: true` by default), `STabs`, `SFilterTableBlock`, or `SSettingsPageShell` inside `<OmadaAgentProvider>`:

```tsx
import { OmadaAgentProvider, useOmadaAgent } from '@chenyqthu/omada-ui-kit/agent';

// Inside a child component:
const agent = useOmadaAgent();
const snap = agent.snapshot(); // Deterministic ID-sorted { controls, actions }
const res = agent.act('dns.enabled', 'toggle'); // Imperative mutation subject to allow policy
```
