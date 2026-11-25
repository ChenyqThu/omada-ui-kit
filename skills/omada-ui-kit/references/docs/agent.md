# Agent Bridge & WebMCP Runtime (`@chenyqthu/omada-ui-kit/agent`)

Deterministic in-page UI state inspection, multi-step batch action execution (`snapshot()`, `query()`, `act()`, `actAsync()`, `allow`), `window.__OMADA_AGENT__` exposure, and WebMCP (`document.modelContext`) tool registration with automatic `[REDACTED]` secret masking.

### `OmadaAgentProvider` (`component` · `@chenyqthu/omada-ui-kit/agent`)
Deterministic Agent Bridge provider for Omada UI Kit. Exposes structured `snapshot()`, `query()`, `act()`, `actAsync()`, `allow` governance, optional `window.__OMADA_AGENT__` exposure, and WebMCP browser tool registration with automatic `[REDACTED]` masking on `secret` / password controls.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `allow` | `OmadaAgentAllow` | No | Permission policy controlling agent capabilities: - `true` (default): allow `snapshot()`, `query()`, and `act()` - `false`: read-only (`snapshot()` / `query()` allowed, `act()` blocked) - `string[]`: allowlist of `agentId` or `prefix*` patterns permitted for `act()` - `OmadaAgentPermissionPolicy`: granular `read`, `act`, `allowedIds`, `deniedIds` - `(req) => boolean`: custom synchronous guard |
| `children` | `React.ReactNode` | Yes |  |
| `exposeWindowBridge` | `boolean` | No | Exposes `window.__OMADA_AGENT__` for external browser automation / Playwright / DevTools agents (and automatically registers WebMCP tools unless `registerWebMcp={false}`). |
| `registerWebMcp` | `boolean \| OmadaWebMcpOptions` | No | Registers `snapshot`, `query`, and `act` with the browser's WebMCP API (`document.modelContext` / `navigator.modelContext`). Defaults to `exposeWindowBridge`. |

### `registerWebMcpTools` (`helper` · `@chenyqthu/omada-ui-kit/agent`)
Registers `snapshot`, `query`, and `act` with the browser's WebMCP API (`document.modelContext` or `navigator.modelContext`) when supported. Safely returns a no-op cleanup function in browsers without WebMCP support.

### `useOmadaAgent` (`hook` · `@chenyqthu/omada-ui-kit/agent`)
Accesses the deterministic `<OmadaAgentProvider>` runtime (`snapshot`, `query`, `act`, `actAsync`, `allow`).

### `useOmadaAgentAction` (`hook` · `@chenyqthu/omada-ui-kit/agent`)
Registers a named standalone action with the nearest `<OmadaAgentProvider>` when `config.id` is defined. Safely no-ops when rendered outside `<OmadaAgentProvider>` or without an `id`.

### `useOmadaAgentControl` (`hook` · `@chenyqthu/omada-ui-kit/agent`)
Registers an interactive Omada UI control with the nearest `<OmadaAgentProvider>` when `config.id` is defined. Safely no-ops when rendered outside `<OmadaAgentProvider>` or without an `id`.

## Built-in `agentId` Component Coverage
Pass `agentId="domain.control"` inside `<OmadaAgentProvider>` to register deterministic controls automatically:
- **Inputs & Selections**: `SSwitch`, `SSelect`, `SInput` (optional `secret`), `SPasswordInput` (`secret: true` default), `SNumberInput`, `SCheckbox`, `SCheckboxGroup` (`SCheckbox.Group`), `SRadio`, `SRadioGroup` (`SRadio.Group`), `SDatePicker`, `SRangePicker`
- **Navigation, Tables & Shells**: `STabs`, `STable`, `SFilterTableBlock`, `SExpandableSection`, `SSettingsPageShell`
- **Overlays & Wizards**: `SDrawer`, `SDetailInspectorDrawer`, `SModal`, `SInfoDialog`, `SStepModal`

## External Browser Agent & WebMCP Protocol
Mounting `<OmadaAgentProvider exposeWindowBridge>` enables both `window.__OMADA_AGENT__` and WebMCP tool registration (`OMADA_AGENT_TOOLS`: `snapshot`, `query`, `act` with `readOnlyHint` / `consequentialHint` / `untrustedContentHint`) on `document.modelContext` / `navigator.modelContext`:

```tsx
import {
  OmadaAgentProvider,
  useOmadaAgent,
  useOmadaAgentAction,
} from '@chenyqthu/omada-ui-kit/agent';

// 1. Register page-level domain actions alongside agentId controls:
useOmadaAgentAction({
  id: 'dns.applySecurityPreset',
  label: 'Apply Quad9 DoT Security Preset',
  handler: () => ({ mode: 'dot', primaryDns: '9.9.9.9' }),
});

// 2. External browser agent / WebMCP execution in 1 batch call:
if (window.__OMADA_AGENT__) {
  const snap = window.__OMADA_AGENT__.snapshot(); // { controls, actions } ([REDACTED] secrets)
  await window.__OMADA_AGENT__.actAsync({
    steps: [
      { id: 'dns.mode', action: 'setValue', value: 'dot' },
      { id: 'dns.primaryServer', action: 'setValue', value: '9.9.9.9' },
      { id: 'dns.shell', action: 'apply' },
    ],
  });
}
```
