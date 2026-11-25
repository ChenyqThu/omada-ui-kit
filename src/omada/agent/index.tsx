import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

export const OMADA_SECRET_MASK = '[REDACTED]';

export type OmadaAgentControlKind =
  | 'switch'
  | 'select'
  | 'input'
  | 'password'
  | 'tabs'
  | 'table'
  | 'settings'
  | 'button'
  | 'custom';

export interface OmadaAgentOptionMeta {
  value: string | number;
  label?: string;
  disabled?: boolean;
}

export interface OmadaAgentControlRegistration {
  /** Stable deterministic control identifier (e.g. `'dns.enabled'`, `'devices.table'`). */
  id?: string;
  /** Semantic widget category. */
  kind: OmadaAgentControlKind;
  /** Human-readable label or accessible name. */
  label?: string;
  /** Current control state value (automatically masked when `secret` is `true`). */
  value?: unknown;
  /** Masks `value` in `snapshot()`, `query()`, and `act()` results when `true`. */
  secret?: boolean;
  /** Marks control as non-interactive; `act()` rejects mutations when `true`. */
  disabled?: boolean;
  /** Enumerated choices for select / tabs / radio controls. */
  options?: OmadaAgentOptionMeta[];
  /** Additional non-sensitive metadata (e.g. row counts, dirty state). */
  meta?: Record<string, unknown>;
  /** Named imperative handlers exposed to `act(id, action, value)`. */
  actions?: Record<string, (...args: unknown[]) => unknown>;
}

export interface OmadaAgentActionRegistration {
  /** Stable deterministic action identifier (e.g. `'devices.batchUpgrade'`). */
  id?: string;
  /** Human-readable action title. */
  label?: string;
  /** Optional explanation of side effects. */
  description?: string;
  /** Prevents execution via `act()` when `true`. */
  disabled?: boolean;
  /** Additional metadata. */
  meta?: Record<string, unknown>;
  /** Action callback executed when `act(id)` or `act(id, 'trigger', payload)` is called. */
  handler: (payload?: unknown) => unknown;
}

export interface OmadaAgentPermissionPolicy {
  /** Permit reading state via `snapshot()` and `query()` (default `true`). */
  read?: boolean;
  /** Permit executing mutations/actions via `act()` (default `true`, or allowlist of IDs/globs). */
  act?: boolean | readonly string[];
  /** Optional allowlist of control/action IDs or `prefix*` wildcard patterns. */
  allowedIds?: readonly string[];
  /** Optional denylist of control/action IDs or `prefix*` wildcard patterns. */
  deniedIds?: readonly string[];
}

export type OmadaAgentAllow =
  | boolean
  | readonly string[]
  | OmadaAgentPermissionPolicy
  | ((request: { id: string; action: string }) => boolean);

export interface OmadaAgentControlSnapshot {
  id: string;
  kind: OmadaAgentControlKind;
  label?: string;
  value: unknown;
  secret: boolean;
  hasValue?: boolean;
  disabled: boolean;
  actions: string[];
  options?: OmadaAgentOptionMeta[];
  meta?: Record<string, unknown>;
}

export interface OmadaAgentActionSnapshot {
  id: string;
  label?: string;
  description?: string;
  disabled: boolean;
  meta?: Record<string, unknown>;
}

export interface OmadaAgentSnapshot {
  controls: OmadaAgentControlSnapshot[];
  actions: OmadaAgentActionSnapshot[];
}

export interface OmadaAgentQueryFilter {
  id?: string;
  kind?: OmadaAgentControlKind | string;
  text?: string;
  includeDisabled?: boolean;
}

export type OmadaAgentQuery = string | OmadaAgentQueryFilter;

export interface OmadaAgentActPayload {
  action?: string;
  value?: unknown;
  args?: unknown[];
}

export interface OmadaAgentActResult {
  ok: boolean;
  id: string;
  action: string;
  value?: unknown;
  result?: unknown;
  error?: string;
}

export interface OmadaAgentRuntime {
  /** Returns a deterministic, ID-sorted snapshot of all registered controls and actions. */
  snapshot: () => OmadaAgentSnapshot;
  /** Queries registered controls matching an ID/label substring or structured filter. */
  query: (filter?: OmadaAgentQuery) => OmadaAgentControlSnapshot[];
  /** Deterministically invokes an action on a registered control or standalone action. */
  act: (
    id: string,
    actionOrPayload?: string | OmadaAgentActPayload,
    value?: unknown,
  ) => OmadaAgentActResult;
  /** Active permission configuration passed to `<OmadaAgentProvider>`. */
  allow: OmadaAgentAllow;
  /** Evaluates whether `act(id, action)` is permitted under current `allow` policy. */
  canAct: (id: string, action?: string) => boolean;
}

interface InternalRegistryContextValue {
  registerControl: (
    id: string,
    getter: () => OmadaAgentControlRegistration,
  ) => () => void;
  registerAction: (
    id: string,
    getter: () => OmadaAgentActionRegistration,
  ) => () => void;
  runtime: OmadaAgentRuntime;
}

const OmadaAgentContext = createContext<InternalRegistryContextValue | null>(null);

function matchesPattern(candidate: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return candidate.startsWith(prefix);
  }
  return candidate === pattern;
}

function matchesAnyPattern(
  id: string,
  action: string,
  patterns: readonly string[],
): boolean {
  const qualified = `${id}:${action}`;
  const dotQualified = `${id}.${action}`;
  return patterns.some(
    (p) =>
      matchesPattern(id, p) ||
      matchesPattern(qualified, p) ||
      matchesPattern(dotQualified, p),
  );
}

function canReadWithAllow(allow: OmadaAgentAllow): boolean {
  if (typeof allow === 'object' && allow !== null && !Array.isArray(allow)) {
    return (allow as OmadaAgentPermissionPolicy).read !== false;
  }
  return true;
}

function canActWithAllow(
  allow: OmadaAgentAllow,
  id: string,
  action: string,
): boolean {
  if (typeof allow === 'boolean') {
    return allow;
  }
  if (typeof allow === 'function') {
    return Boolean(allow({ id, action }));
  }
  if (Array.isArray(allow)) {
    return matchesAnyPattern(id, action, allow);
  }
  const policy = allow as OmadaAgentPermissionPolicy;
  if (policy.deniedIds && matchesAnyPattern(id, action, policy.deniedIds)) {
    return false;
  }
  if (policy.act === false) {
    return false;
  }
  if (Array.isArray(policy.act) && !matchesAnyPattern(id, action, policy.act)) {
    return false;
  }
  if (policy.allowedIds && !matchesAnyPattern(id, action, policy.allowedIds)) {
    return false;
  }
  return true;
}

function maskControlSnapshot(
  id: string,
  reg: OmadaAgentControlRegistration,
): OmadaAgentControlSnapshot {
  const isSecret = Boolean(reg.secret || reg.kind === 'password');
  const rawVal = reg.value;
  const hasValue =
    rawVal !== undefined && rawVal !== null && String(rawVal).length > 0;

  return {
    id,
    kind: reg.kind,
    ...(reg.label !== undefined ? { label: reg.label } : {}),
    value: isSecret ? OMADA_SECRET_MASK : rawVal,
    secret: isSecret,
    ...(isSecret ? { hasValue } : {}),
    disabled: Boolean(reg.disabled),
    actions: Object.keys(reg.actions ?? {}).sort(),
    ...(reg.options ? { options: reg.options } : {}),
    ...(reg.meta ? { meta: reg.meta } : {}),
  };
}

export interface OmadaAgentProviderProps {
  children: React.ReactNode;
  /**
   * Permission policy controlling agent capabilities:
   * - `true` (default): allow `snapshot()`, `query()`, and `act()`
   * - `false`: read-only (`snapshot()` / `query()` allowed, `act()` blocked)
   * - `string[]`: allowlist of `agentId` or `prefix*` patterns permitted for `act()`
   * - `OmadaAgentPermissionPolicy`: granular `read`, `act`, `allowedIds`, `deniedIds`
   * - `(req) => boolean`: custom synchronous guard
   */
  allow?: OmadaAgentAllow;
  /**
   * Optional imperative callback invoked with the live `OmadaAgentRuntime` handle,
   * or `exposeWindowBridge` to attach `window.__OMADA_AGENT__` for browser automation.
   */
  exposeWindowBridge?: boolean;
}

/**
 * Deterministic Agent Bridge provider for Omada UI Kit.
 * Exposes structured `snapshot()`, `query()`, `act()`, and `allow` governance
 * with automatic `[REDACTED]` masking on `secret` / password controls.
 */
export const OmadaAgentProvider: React.FC<OmadaAgentProviderProps> = ({
  children,
  allow = true,
  exposeWindowBridge = false,
}) => {
  const controlsRef = useRef<Map<string, () => OmadaAgentControlRegistration>>(
    new Map(),
  );
  const actionsRef = useRef<Map<string, () => OmadaAgentActionRegistration>>(
    new Map(),
  );
  const allowRef = useRef<OmadaAgentAllow>(allow);
  allowRef.current = allow;

  const registerControl = useCallback(
    (id: string, getter: () => OmadaAgentControlRegistration) => {
      controlsRef.current.set(id, getter);
      return () => {
        if (controlsRef.current.get(id) === getter) {
          controlsRef.current.delete(id);
        }
      };
    },
    [],
  );

  const registerAction = useCallback(
    (id: string, getter: () => OmadaAgentActionRegistration) => {
      actionsRef.current.set(id, getter);
      return () => {
        if (actionsRef.current.get(id) === getter) {
          actionsRef.current.delete(id);
        }
      };
    },
    [],
  );

  const snapshot = useCallback((): OmadaAgentSnapshot => {
    if (!canReadWithAllow(allowRef.current)) {
      return { controls: [], actions: [] };
    }

    const controls = Array.from(controlsRef.current.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, getter]) => maskControlSnapshot(id, getter()));

    const actions = Array.from(actionsRef.current.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, getter]) => {
        const reg = getter();
        return {
          id,
          ...(reg.label !== undefined ? { label: reg.label } : {}),
          ...(reg.description !== undefined ? { description: reg.description } : {}),
          disabled: Boolean(reg.disabled),
          ...(reg.meta ? { meta: reg.meta } : {}),
        };
      });

    return { controls, actions };
  }, []);

  const query = useCallback(
    (filter?: OmadaAgentQuery): OmadaAgentControlSnapshot[] => {
      const snap = snapshot();
      if (!filter) {
        return snap.controls;
      }
      if (typeof filter === 'string') {
        const q = filter.trim().toLowerCase();
        if (!q) return snap.controls;
        return snap.controls.filter(
          (ctrl) =>
            ctrl.id.toLowerCase().includes(q) ||
            ctrl.kind.toLowerCase() === q ||
            (ctrl.label?.toLowerCase().includes(q) ?? false),
        );
      }

      const includeDisabled = filter.includeDisabled ?? true;
      return snap.controls.filter((ctrl) => {
        if (!includeDisabled && ctrl.disabled) return false;
        if (filter.id && !matchesPattern(ctrl.id, filter.id) && !ctrl.id.includes(filter.id)) {
          return false;
        }
        if (filter.kind && ctrl.kind !== filter.kind) {
          return false;
        }
        if (filter.text) {
          const t = filter.text.toLowerCase();
          const hit =
            ctrl.id.toLowerCase().includes(t) ||
            (ctrl.label?.toLowerCase().includes(t) ?? false);
          if (!hit) return false;
        }
        return true;
      });
    },
    [snapshot],
  );

  const canAct = useCallback((id: string, action = 'default'): boolean => {
    return canActWithAllow(allowRef.current, id, action);
  }, []);

  const act = useCallback(
    (
      id: string,
      actionOrPayload?: string | OmadaAgentActPayload,
      valueArg?: unknown,
    ): OmadaAgentActResult => {
      let actionName = 'setValue';
      let callArgs: unknown[] = [];

      if (typeof actionOrPayload === 'string') {
        actionName = actionOrPayload;
        callArgs = valueArg !== undefined ? [valueArg] : [];
      } else if (actionOrPayload && typeof actionOrPayload === 'object') {
        actionName = actionOrPayload.action ?? 'setValue';
        if (Array.isArray(actionOrPayload.args)) {
          callArgs = actionOrPayload.args;
        } else if (actionOrPayload.value !== undefined) {
          callArgs = [actionOrPayload.value];
        }
      } else if (valueArg !== undefined) {
        callArgs = [valueArg];
      }

      const controlGetter = controlsRef.current.get(id);
      const actionGetter = actionsRef.current.get(id);

      if (!controlGetter && actionGetter && actionOrPayload === undefined) {
        actionName = 'trigger';
      }

      if (!canActWithAllow(allowRef.current, id, actionName)) {
        return {
          ok: false,
          id,
          action: actionName,
          error: `Action "${actionName}" on "${id}" is not permitted by allow policy.`,
        };
      }

      if (controlGetter) {
        const reg = controlGetter();
        const isSecret = Boolean(reg.secret || reg.kind === 'password');
        if (reg.disabled) {
          return {
            ok: false,
            id,
            action: actionName,
            error: `Control "${id}" is disabled.`,
          };
        }
        const fn = reg.actions?.[actionName];
        if (typeof fn !== 'function') {
          const available = Object.keys(reg.actions ?? {}).join(', ') || 'none';
          return {
            ok: false,
            id,
            action: actionName,
            error: `Unknown action "${actionName}" on control "${id}". Available: ${available}.`,
          };
        }
        try {
          const result = fn(...callArgs);
          const nextSnap = maskControlSnapshot(id, controlGetter());
          const resolvedValue = isSecret
            ? OMADA_SECRET_MASK
            : callArgs.length > 0
              ? callArgs[0]
              : result !== undefined
                ? result
                : nextSnap.value;
          return {
            ok: true,
            id,
            action: actionName,
            value: resolvedValue,
            ...(result !== undefined && !isSecret ? { result } : {}),
          };
        } catch (err) {
          return {
            ok: false,
            id,
            action: actionName,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }

      if (actionGetter) {
        const reg = actionGetter();
        if (reg.disabled) {
          return {
            ok: false,
            id,
            action: actionName,
            error: `Action "${id}" is disabled.`,
          };
        }
        try {
          const result = reg.handler(callArgs[0]);
          return {
            ok: true,
            id,
            action: actionName,
            ...(result !== undefined ? { result } : {}),
          };
        } catch (err) {
          return {
            ok: false,
            id,
            action: actionName,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }

      return {
        ok: false,
        id,
        action: actionName,
        error: `No registered control or action found with agentId "${id}".`,
      };
    },
    [],
  );

  const runtime = useMemo<OmadaAgentRuntime>(
    () => ({
      snapshot,
      query,
      act,
      allow,
      canAct,
    }),
    [snapshot, query, act, allow, canAct],
  );

  useEffect(() => {
    if (!exposeWindowBridge || typeof window === 'undefined') {
      return;
    }
    const win = window as unknown as { __OMADA_AGENT__?: OmadaAgentRuntime };
    win.__OMADA_AGENT__ = runtime;
    return () => {
      if (win.__OMADA_AGENT__ === runtime) {
        delete win.__OMADA_AGENT__;
      }
    };
  }, [exposeWindowBridge, runtime]);

  const ctxValue = useMemo<InternalRegistryContextValue>(
    () => ({
      registerControl,
      registerAction,
      runtime,
    }),
    [registerControl, registerAction, runtime],
  );

  return (
    <OmadaAgentContext.Provider value={ctxValue}>
      {children}
    </OmadaAgentContext.Provider>
  );
};

/**
 * Accesses the deterministic `<OmadaAgentProvider>` runtime (`snapshot`, `query`, `act`, `allow`).
 */
export function useOmadaAgent(): OmadaAgentRuntime {
  const ctx = useContext(OmadaAgentContext);
  if (!ctx) {
    throw new Error('useOmadaAgent must be used inside <OmadaAgentProvider>.');
  }
  return ctx.runtime;
}

/**
 * Registers an interactive Omada UI control with the nearest `<OmadaAgentProvider>` when `config.id` is defined.
 * Safely no-ops when rendered outside `<OmadaAgentProvider>` or without an `id`.
 */
export function useOmadaAgentControl(
  config: OmadaAgentControlRegistration | null | undefined,
): void {
  const ctx = useContext(OmadaAgentContext);
  const latestRef = useRef<OmadaAgentControlRegistration | null | undefined>(config);
  latestRef.current = config;

  const id = config?.id;
  const registerControl = ctx?.registerControl;

  useEffect(() => {
    if (!registerControl || !id) {
      return;
    }
    return registerControl(id, () => latestRef.current!);
  }, [registerControl, id]);
}

/**
 * Registers a named standalone action with the nearest `<OmadaAgentProvider>` when `config.id` is defined.
 * Safely no-ops when rendered outside `<OmadaAgentProvider>` or without an `id`.
 */
export function useOmadaAgentAction(
  config: OmadaAgentActionRegistration | null | undefined,
): void {
  const ctx = useContext(OmadaAgentContext);
  const latestRef = useRef<OmadaAgentActionRegistration | null | undefined>(config);
  latestRef.current = config;

  const id = config?.id;
  const registerAction = ctx?.registerAction;

  useEffect(() => {
    if (!registerAction || !id) {
      return;
    }
    return registerAction(id, () => latestRef.current!);
  }, [registerAction, id]);
}
