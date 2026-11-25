import React, { useMemo, useState } from 'react';
import { Info, Minus, Plus } from 'lucide-react';
import {
  SButton,
  SCheckbox,
  SIcon,
  SInput,
  SPasswordInput,
  SSelect,
  STooltip,
  useOmadaNotification,
} from '@/omada';
import {
  SSettingsPageShell,
  SSettingsRow,
  SSettingsSection,
} from '../../../omada/components/SSettingsPageShell';
import {
  APPLICATION_SCENARIO_OPTIONS,
  AUTO_CHANNEL_OPTIONS,
  COUNTRY_REGION_OPTIONS,
  DATA_RETENTION_OPTIONS,
  DEFAULT_SITE_SETTINGS,
  EMAIL_DATA_OPTIONS,
  EMAIL_DAY_OPTIONS,
  EMAIL_FREQUENCY_OPTIONS,
  EMAIL_TIME_OPTIONS,
  SWITCH_LAG_HASH_OPTIONS,
  TIMEZONE_OPTIONS,
  type SiteSettingsState,
} from './networkCoreData';

export interface SiteSettingsPageProps {
  /** Optional initial state override for isolated tests or demos. */
  initialSettings?: Partial<SiteSettingsState>;
  className?: string;
}

const InlineInfoBadge: React.FC<{ title: string; label?: string }> = ({ title, label }) => (
  <STooltip title={title}>
    <span
      tabIndex={0}
      aria-label={label ?? 'Info'}
      className="inline-flex cursor-help items-center text-[var(--omada-brand-text)] transition-opacity hover:opacity-80"
    >
      <Info size={15} />
    </span>
  </STooltip>
);

/**
 * Omada Controller v6.3 `Network Config -> General Settings -> Site Settings` (`#/site-settings`).
 * Replicates all 5 horizontal configuration sections (`Site Configuration`, `General Config`,
 * `Wireless Features`, `Device Account`, `Auto Send Data to Email`) with `210px` labels,
 * `350px` filled controls, collapsible Time/Location blocks, Inform URL copy, and dirty-state Apply/Cancel.
 */
export const SiteSettingsPage: React.FC<SiteSettingsPageProps> = ({
  initialSettings,
  className = '',
}) => {
  const notification = useOmadaNotification();

  const initialMerged = useMemo<SiteSettingsState>(
    () => ({ ...DEFAULT_SITE_SETTINGS, ...initialSettings }),
    [initialSettings],
  );

  const [saved, setSaved] = useState<SiteSettingsState>(initialMerged);
  const [draft, setDraft] = useState<SiteSettingsState>(initialMerged);
  const [timeOpen, setTimeOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const updateField = <K extends keyof SiteSettingsState>(
    key: K,
    value: SiteSettingsState[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyInformUrl = async () => {
    try {
      await navigator.clipboard?.writeText(draft.informUrl);
    } catch {
      // Clipboard API may be unavailable in headless/test environments
    }
    notification.success({
      title: 'Inform URL Copied',
      description: 'Device inform URL copied to clipboard.',
    });
  };

  const handleApply = () => {
    setSaved(draft);
    notification.success({
      title: 'Site Settings Saved',
      description: `Configuration updated for "${draft.siteName}".`,
    });
  };

  const handleCancel = () => {
    setDraft(saved);
    setAddingEmail(false);
    setNewEmailInput('');
  };

  const handleCommitEmail = () => {
    const trimmed = newEmailInput.trim();
    if (!trimmed) {
      setAddingEmail(false);
      return;
    }
    if (!draft.autoSendEmails.includes(trimmed)) {
      updateField('autoSendEmails', [...draft.autoSendEmails, trimmed]);
    }
    setNewEmailInput('');
    setAddingEmail(false);
  };

  const wirelessCheckItems: Array<{
    key: keyof SiteSettingsState;
    label: string;
    tooltip?: string;
  }> = [
    {
      key: 'mesh',
      label: 'Mesh',
      tooltip: 'Allow Omada EAPs to establish wireless mesh uplinks automatically.',
    },
    {
      key: 'autoFailover',
      label: 'Auto Failover',
      tooltip: 'Automatically select an alternative mesh parent AP if the current uplink drops.',
    },
    {
      key: 'fullSectorDfs',
      label: 'Full-Sector DFS',
    },
  ];

  const wirelessTrailingCheckItems: Array<{
    key: keyof SiteSettingsState;
    label: string;
    tooltip?: string;
  }> = [
    {
      key: 'fastRoaming',
      label: 'Fast Roaming',
      tooltip: 'Enable IEEE 802.11r fast BSS transition for seamless client roaming.',
    },
    { key: 'nonStickRoaming', label: 'Non-Stick Roaming' },
    {
      key: 'aiRoaming',
      label: 'AI Roaming',
      tooltip: 'Use AI-assisted RSSI thresholds and steering to optimize roaming decisions.',
    },
    { key: 'dualBand11kReport', label: 'Dual Band 11k Report' },
    { key: 'forceDisassociation', label: 'Force-Disassociation' },
    { key: 'bandSteering', label: 'Band Steering' },
    { key: 'airtimeFairness', label: 'Airtime Fairness' },
    { key: 'beaconControl', label: 'Beacon Control' },
    { key: 'ofdma', label: 'OFDMA' },
    {
      key: 'mlo',
      label: 'Wireless Multi-Link Operation (MLO)',
      tooltip: 'Allow Wi-Fi 7 clients to transmit concurrently across multiple bands.',
    },
    { key: 'optimization24Ghz', label: '2.4 GHz Connection Optimization' },
  ];

  return (
    <SSettingsPageShell
      agentId="siteSettings.shell"
      title="Site Settings"
      helpTitle="Site Settings"
      helpDescription="Configure site identity, regional compliance, switch/AP global behaviors, device SSH/management credentials, and scheduled email exports."
      dirty={isDirty}
      onApply={handleApply}
      onCancel={handleCancel}
      data-testid="site-settings-page"
      className={className}
    >
      {/* Section 1: Site Configuration */}
      <SSettingsSection title="Site Configuration">
        <SSettingsRow label="Site Name">
          <SInput
            agentId="siteSettings.siteName"
            aria-label="Site Name"
            value={draft.siteName}
            onChange={(e) => updateField('siteName', e.target.value)}
          />
        </SSettingsRow>

        <SSettingsRow label="Application Scenario">
          <SSelect
            aria-label="Application Scenario"
            className="w-full"
            value={draft.applicationScenario}
            onChange={(val) => updateField('applicationScenario', String(val))}
            options={APPLICATION_SCENARIO_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow label="Country/Region">
          <SSelect
            agentId="siteSettings.country"
            aria-label="Country/Region"
            className="w-full"
            value={draft.countryRegion}
            onChange={(val) => updateField('countryRegion', String(val))}
            options={COUNTRY_REGION_OPTIONS}
          />
        </SSettingsRow>

        {/* Collapsible + Time Settings */}
        <div>
          <button
            type="button"
            aria-expanded={timeOpen}
            onClick={() => setTimeOpen((prev) => !prev)}
            className="omada-cfg-collapse-trigger inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[14px] text-[var(--omada-text-primary)]"
          >
            <span className="omada-cfg-plus-box" aria-hidden="true">
              {timeOpen ? <Minus size={10} /> : <Plus size={10} />}
            </span>
            <span>Time Settings</span>
          </button>

          {timeOpen && (
            <div className="mt-4 flex flex-col gap-4">
              <SSettingsRow label="Time Zone">
                <SSelect
                  aria-label="Time Zone"
                  className="w-full"
                  value={draft.timezone}
                  onChange={(val) => updateField('timezone', String(val))}
                  options={TIMEZONE_OPTIONS}
                />
              </SSettingsRow>
              <SSettingsRow label="NTP Server">
                <SInput
                  aria-label="NTP Server"
                  value={draft.ntpServer}
                  onChange={(e) => updateField('ntpServer', e.target.value)}
                />
              </SSettingsRow>
              <SSettingsRow label="Daylight Saving Time">
                <SCheckbox
                  checked={draft.dstEnabled}
                  onChange={(e) => updateField('dstEnabled', e.target.checked)}
                >
                  Enable
                </SCheckbox>
              </SSettingsRow>
            </div>
          )}
        </div>

        {/* Collapsible + Location (Optional) */}
        <div>
          <button
            type="button"
            aria-expanded={locationOpen}
            onClick={() => setLocationOpen((prev) => !prev)}
            className="omada-cfg-collapse-trigger inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[14px] text-[var(--omada-text-primary)]"
          >
            <span className="omada-cfg-plus-box" aria-hidden="true">
              {locationOpen ? <Minus size={10} /> : <Plus size={10} />}
            </span>
            <span>Location (Optional)</span>
          </button>

          {locationOpen && (
            <div className="mt-4 flex flex-col gap-4">
              <SSettingsRow label="Site Address">
                <SInput
                  aria-label="Site Address"
                  value={draft.locationAddress}
                  onChange={(e) => updateField('locationAddress', e.target.value)}
                />
              </SSettingsRow>
              <SSettingsRow label="Coordinates">
                <div className="grid grid-cols-2 gap-2.5">
                  <SInput
                    aria-label="Latitude"
                    placeholder="Latitude"
                    value={draft.latitude}
                    onChange={(e) => updateField('latitude', e.target.value)}
                  />
                  <SInput
                    aria-label="Longitude"
                    placeholder="Longitude"
                    value={draft.longitude}
                    onChange={(e) => updateField('longitude', e.target.value)}
                  />
                </div>
              </SSettingsRow>
            </div>
          )}
        </div>

        <SSettingsRow label="Inform URL" controlWidth="auto">
          <div className="flex flex-wrap items-center gap-5">
            <span
              data-testid="site-inform-url"
              className="break-all text-[14px] text-[var(--omada-text-primary)]"
            >
              {draft.informUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyInformUrl}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[14px] text-[var(--omada-brand-text)] transition-opacity hover:opacity-80"
            >
              <SIcon name="copy-url" size={16} />
              <span>Copy URL</span>
            </button>
          </div>
        </SSettingsRow>
      </SSettingsSection>

      {/* Section 2: General Config */}
      <SSettingsSection title="General Config" dividerTop>
        <SSettingsRow label="LED">
          <SCheckbox
            agentId="siteSettings.ledEnabled"
            checked={draft.ledEnabled}
            onChange={(e) => updateField('ledEnabled', e.target.checked)}
          >
            Enable
          </SCheckbox>
        </SSettingsRow>

        <SSettingsRow label="Switch Jumbo" after="(1518-9216)">
          <SInput
            aria-label="Switch Jumbo"
            inputMode="numeric"
            value={String(draft.switchJumbo)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              updateField('switchJumbo', digits ? Number(digits) : 0);
            }}
            suffix={
              <span className="text-[13px] text-[var(--omada-text-primary)]">Bytes</span>
            }
          />
        </SSettingsRow>

        <SSettingsRow label="Switch LAG Hash Algorithm">
          <SSelect
            aria-label="Switch LAG Hash Algorithm"
            className="w-full"
            value={draft.switchLagHash}
            onChange={(val) => updateField('switchLagHash', String(val))}
            options={SWITCH_LAG_HASH_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow label="Remember Device">
          <div className="inline-flex items-center gap-2">
            <SCheckbox
              checked={draft.rememberDevice}
              onChange={(e) => updateField('rememberDevice', e.target.checked)}
            >
              Enable
            </SCheckbox>
            <InlineInfoBadge
              label="Remember Device info"
              title="Retain site configuration when a managed device is forgotten and re-adopted."
            />
          </div>
        </SSettingsRow>

        <SSettingsRow label="LLDP" controlWidth="auto">
          <div className="flex flex-wrap items-center gap-6">
            <SCheckbox
              checked={draft.lldpGateway}
              onChange={(e) => updateField('lldpGateway', e.target.checked)}
            >
              Gateway
            </SCheckbox>
            <SCheckbox
              checked={draft.lldpSwitch}
              onChange={(e) => updateField('lldpSwitch', e.target.checked)}
            >
              Switch
            </SCheckbox>
            <span className="inline-flex items-center gap-1.5">
              <SCheckbox
                checked={draft.lldpAp}
                onChange={(e) => updateField('lldpAp', e.target.checked)}
              >
                AP
              </SCheckbox>
              <InlineInfoBadge
                label="LLDP info"
                title="Enable Link Layer Discovery Protocol neighbor advertisements per device tier."
              />
            </span>
          </div>
        </SSettingsRow>

        <SSettingsRow label="Portal Logout Domain">
          <SInput
            aria-label="Portal Logout Domain"
            value={draft.portalLogoutDomain}
            onChange={(e) => updateField('portalLogoutDomain', e.target.value)}
          />
        </SSettingsRow>

        <SSettingsRow label="Remote Logging">
          <SCheckbox
            checked={draft.remoteLogging}
            onChange={(e) => updateField('remoteLogging', e.target.checked)}
          >
            Enable
          </SCheckbox>
        </SSettingsRow>

        {draft.remoteLogging && (
          <SSettingsRow label="Syslog Server">
            <div className="grid grid-cols-3 gap-2">
              <SInput
                aria-label="Syslog Server IP"
                className="col-span-2"
                value={draft.syslogServer}
                onChange={(e) => updateField('syslogServer', e.target.value)}
              />
              <SInput
                aria-label="Syslog Port"
                inputMode="numeric"
                value={String(draft.syslogPort)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  updateField('syslogPort', digits ? Number(digits) : 514);
                }}
              />
            </div>
          </SSettingsRow>
        )}

        <SSettingsRow label="Automatic Upgrade">
          <SCheckbox
            checked={draft.automaticUpgrade}
            onChange={(e) => updateField('automaticUpgrade', e.target.checked)}
          >
            Enable
          </SCheckbox>
        </SSettingsRow>

        {draft.automaticUpgrade && (
          <SSettingsRow label="Upgrade Schedule">
            <SSelect
              aria-label="Upgrade Schedule"
              className="w-full"
              value={draft.upgradeSchedule}
              onChange={(val) => updateField('upgradeSchedule', String(val))}
              options={[
                { label: 'Sunday 02:00', value: 'Sunday 02:00' },
                { label: 'Wednesday 03:00', value: 'Wednesday 03:00' },
                { label: 'Daily 04:00', value: 'Daily 04:00' },
              ]}
            />
          </SSettingsRow>
        )}

        <SSettingsRow label="Controller Failover">
          <div className="inline-flex items-center gap-2">
            <SCheckbox
              checked={draft.controllerFailover}
              onChange={(e) => updateField('controllerFailover', e.target.checked)}
            >
              Enable
            </SCheckbox>
            <InlineInfoBadge
              label="Controller Failover info"
              title="Automatically switch managed devices to the backup controller URL when the primary controller is unreachable."
            />
          </div>
        </SSettingsRow>

        <SSettingsRow label="Data Retention">
          <SSelect
            aria-label="Data Retention"
            className="w-full"
            value={draft.dataRetention}
            onChange={(val) => updateField('dataRetention', String(val))}
            options={DATA_RETENTION_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow label="Alert Emails">
          <SCheckbox
            checked={draft.alertEmails}
            onChange={(e) => updateField('alertEmails', e.target.checked)}
          >
            Enable
          </SCheckbox>
        </SSettingsRow>

        {draft.alertEmails && (
          <SSettingsRow label="Alert Recipient">
            <SInput
              aria-label="Alert Recipient"
              value={draft.alertRecipient}
              onChange={(e) => updateField('alertRecipient', e.target.value)}
            />
          </SSettingsRow>
        )}
      </SSettingsSection>

      {/* Section 3: Wireless Features */}
      <SSettingsSection title="Wireless Features" dividerTop>
        {wirelessCheckItems.map((item) => (
          <SSettingsRow key={String(item.key)} label={item.label}>
            <div className="inline-flex items-center gap-2">
              <SCheckbox
                checked={Boolean(draft[item.key])}
                onChange={(e) =>
                  updateField(item.key, e.target.checked as SiteSettingsState[typeof item.key])
                }
              >
                Enable
              </SCheckbox>
              {item.tooltip && <InlineInfoBadge title={item.tooltip} />}
            </div>
          </SSettingsRow>
        ))}

        <SSettingsRow label="Auto Channel Selection">
          <SSelect
            aria-label="Auto Channel Selection"
            className="w-full"
            value={draft.autoChannelSelection}
            onChange={(val) => updateField('autoChannelSelection', String(val))}
            options={AUTO_CHANNEL_OPTIONS}
          />
        </SSettingsRow>

        {wirelessTrailingCheckItems.map((item) => (
          <SSettingsRow key={String(item.key)} label={item.label}>
            <div className="inline-flex items-center gap-2">
              <SCheckbox
                checked={Boolean(draft[item.key])}
                onChange={(e) =>
                  updateField(item.key, e.target.checked as SiteSettingsState[typeof item.key])
                }
              >
                Enable
              </SCheckbox>
              {item.tooltip && <InlineInfoBadge title={item.tooltip} />}
            </div>
          </SSettingsRow>
        ))}
      </SSettingsSection>

      {/* Section 4: Device Account */}
      <SSettingsSection title="Device Account" dividerTop>
        <SSettingsRow label="Username">
          <SInput
            agentId="siteSettings.deviceUsername"
            aria-label="Device Username"
            value={draft.deviceUsername}
            onChange={(e) => updateField('deviceUsername', e.target.value)}
          />
        </SSettingsRow>

        <SSettingsRow label="Password">
          <SPasswordInput
            agentId="siteSettings.devicePassword"
            aria-label="Device Password"
            value={draft.devicePassword}
            onChange={(e) => updateField('devicePassword', e.target.value)}
          />
        </SSettingsRow>
      </SSettingsSection>

      {/* Section 5: Auto Send Data to Email */}
      <SSettingsSection title="Auto Send Data to Email" dividerTop>
        <SSettingsRow label="Auto Send Data to Email">
          <SCheckbox
            checked={draft.autoSendEnabled}
            onChange={(e) => updateField('autoSendEnabled', e.target.checked)}
          >
            Enable
          </SCheckbox>
        </SSettingsRow>

        <SSettingsRow label="Data">
          <SSelect
            aria-label="Email Data Type"
            className="w-full"
            value={draft.autoSendData}
            onChange={(val) => updateField('autoSendData', String(val))}
            options={EMAIL_DATA_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow label="Frequency">
          <SSelect
            aria-label="Email Frequency"
            className="w-full"
            value={draft.autoSendFrequency}
            onChange={(val) => updateField('autoSendFrequency', String(val))}
            options={EMAIL_FREQUENCY_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow label="Day">
          <SSelect
            aria-label="Email Day"
            className="w-full"
            value={draft.autoSendDay}
            onChange={(val) => updateField('autoSendDay', String(val))}
            options={EMAIL_DAY_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow label="Time">
          <SSelect
            aria-label="Email Time"
            className="w-full"
            value={draft.autoSendTime}
            onChange={(val) => updateField('autoSendTime', String(val))}
            options={EMAIL_TIME_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow label="Email Address" align="start" controlWidth={420}>
          <div className="space-y-2">
            {draft.autoSendEmails.map((email) => (
              <div
                key={email}
                className="flex max-w-[350px] items-center justify-between rounded-[4px] bg-[var(--omada-bg-field)] px-3 py-1.5 text-[13px]"
              >
                <span className="truncate text-[var(--omada-text-primary)]">{email}</span>
                <button
                  type="button"
                  aria-label={`Remove ${email}`}
                  onClick={() =>
                    updateField(
                      'autoSendEmails',
                      draft.autoSendEmails.filter((item) => item !== email),
                    )
                  }
                  className="omada-cfg-icon-btn h-5 w-5"
                >
                  <SIcon name="delete" size={14} />
                </button>
              </div>
            ))}

            {addingEmail ? (
              <div className="flex max-w-[350px] items-center gap-2">
                <SInput
                  aria-label="New recipient email"
                  placeholder="ops@company.com"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitEmail();
                    if (e.key === 'Escape') {
                      setAddingEmail(false);
                      setNewEmailInput('');
                    }
                  }}
                />
                <SButton variant="primary" size="small" onClick={handleCommitEmail}>
                  Add
                </SButton>
                <SButton
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setAddingEmail(false);
                    setNewEmailInput('');
                  }}
                >
                  Cancel
                </SButton>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingEmail(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[14px] text-[var(--omada-brand-text)] transition-opacity hover:opacity-80"
              >
                <SIcon name="add-2" size={14} />
                <span>Add Email Address</span>
              </button>
            )}
          </div>
        </SSettingsRow>
      </SSettingsSection>
    </SSettingsPageShell>
  );
};
