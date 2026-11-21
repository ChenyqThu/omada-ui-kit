import React, { useState } from 'react';
import type { UploadFile } from 'antd/es/upload';
import {
  Router,
  Shield,
  SlidersHorizontal,
  Wifi,
} from 'lucide-react';
import {
  SButton,
  SCard,
  SForm,
  SFormItem,
  SPageHeader,
  SPasswordInput,
  useOmadaFeedback,
} from '@/omada';
import type { PasswordRuleConfig } from '../../omada/components/SInput';
import {
  SDatePicker,
  SRangePicker,
  SSchedule,
  STimePicker,
  STimeRangePicker,
  STransfer,
  SUpload,
  createPickerDate,
  createSchedulePreset,
  formatOmadaDateRange,
  type SScheduleMatrix,
  type STransferItem,
} from '../../omada/modules/time-schedule';
import '../../styles/modules/time-schedule.css';

const TRANSFER_ACL_ITEMS: STransferItem[] = [
  { key: '1', title: 'EAP783-Lobby-AP', icon: <Wifi size={14} /> },
  { key: '2', title: 'EAP670-Floor2-East', icon: <Wifi size={14} /> },
  { key: '3', title: 'EAP650-Outdoor-Patio', icon: <Wifi size={14} /> },
  { key: '4', title: 'SG3428X-Core-Switch', icon: <Router size={14} /> },
  { key: '5', title: 'SG2210MP-Rack-A', icon: <Router size={14} /> },
  { key: '6', title: 'ER8411-Primary-GW', icon: <Shield size={14} /> },
  { key: '7', title: 'ER707-M2-Branch-GW', icon: <Shield size={14} /> },
  { key: '8', title: 'OC300-Hardware-Ctrl', icon: <SlidersHorizontal size={14} /> },
  { key: '9', title: 'EAP615-Wall-Suite101', icon: <Wifi size={14} /> },
  { key: '10', title: 'EAP655-Wall-Suite102', icon: <Wifi size={14} /> },
];

const GROUPED_POLICY_ITEMS: STransferItem[] = [
  {
    key: 'grp-ssid',
    title: 'Wireless SSIDs',
    children: [
      { key: 'ssid-corp', title: 'Corp-WiFi-6E', icon: <Wifi size={14} /> },
      { key: 'ssid-guest', title: 'Guest-Portal', icon: <Wifi size={14} /> },
      { key: 'ssid-iot', title: 'IoT-Sensors', icon: <Wifi size={14} /> },
    ],
  },
  {
    key: 'grp-vlan',
    title: 'VLAN Subnets',
    children: [
      { key: 'vlan-10', title: 'VLAN 10 · Corporate', icon: <Router size={14} /> },
      { key: 'vlan-20', title: 'VLAN 20 · Guest', icon: <Router size={14} /> },
      { key: 'vlan-30', title: 'VLAN 30 · Surveillance', icon: <Shield size={14} /> },
    ],
  },
];

const CUSTOM_WIFI_RULES: PasswordRuleConfig[] = [
  {
    key: 'len8',
    label: '8–63 WPA2/WPA3 passphrase characters',
    validate: (val) => val.length >= 8 && val.length <= 63,
  },
  {
    key: 'mixed',
    label: 'Upper & lowercase letters',
    validate: (val) => /[A-Z]/.test(val) && /[a-z]/.test(val),
  },
  {
    key: 'num',
    label: 'At least 1 numeric digit',
    validate: (val) => /\d/.test(val),
  },
];

const INITIAL_FIRMWARE_LIST: UploadFile[] = [
  {
    uid: '-1',
    name: 'ER8411_v1.2.3_Build20260401.bin',
    status: 'done',
    percent: 100,
    size: 18_420_000,
  },
];

export const TimeScheduleSection: React.FC = () => {
  const { toast } = useOmadaFeedback();

  const [passwordVal, setPasswordVal] = useState('Omada@2026');
  const [capsulePreset, setCapsulePreset] = useState('1w');
  const [capsuleLabel, setCapsuleLabel] = useState(
    formatOmadaDateRange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(),
    ),
  );
  const [transferTargets, setTransferTargets] = useState<string[]>(['1', '4', '6']);
  const [groupedTargets, setGroupedTargets] = useState<string[]>(['ssid-corp']);
  const [scheduleMatrix, setScheduleMatrix] = useState<SScheduleMatrix>(() =>
    createSchedulePreset('workdays'),
  );
  const [scheduleReadOnly, setScheduleReadOnly] = useState(false);

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Time, Schedule, Transfer & Upload"
        description="Omada DatePicker (capsule & range presets), TimePicker (24h/12h), searchable/grouped Transfer, validated Upload dropzones, 7×24 Schedule matrix, and live Password rules."
      />

      {/* Password Validation Checklist */}
      <SCard title="Password Input with Strength Meter & Live Rules (43:34723)">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
              Account / Admin Password (`showStrength` + `showRules`)
            </div>
            <div style={{ maxWidth: 350 }}>
              <SPasswordInput
                showStrength
                showRules
                value={passwordVal}
                onChange={(e) => setPasswordVal(e.target.value)}
                placeholder="Enter administrator password"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
              WPA3 Passphrase with Custom `PasswordRuleConfig[]`
            </div>
            <div style={{ maxWidth: 350 }}>
              <SPasswordInput
                showRules
                rules={CUSTOM_WIFI_RULES}
                defaultValue="OmadaWiFi7"
                placeholder="Enter SSID passphrase"
              />
            </div>
          </div>
        </div>
      </SCard>

      {/* DatePicker & TimePicker */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="DatePicker & Capsule Range Filter (43:34733)">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--omada-text-secondary)]">
                  Dashboard Capsule Filter (`1D · 1W · 1M` + Custom Range)
                </span>
                <span className="tabular-nums text-[var(--omada-text-tertiary)]">
                  {capsulePreset.toUpperCase()} · {capsuleLabel}
                </span>
              </div>
              <SRangePicker
                capsule
                activePreset={capsulePreset}
                onPresetChange={(key, [start, end]) => {
                  setCapsulePreset(key);
                  setCapsuleLabel(formatOmadaDateRange(start, end));
                }}
              />
            </div>

            <SForm layout="vertical">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SFormItem label="Single Date (Filled)" fieldWidth="full">
                  <SDatePicker
                    className="w-full"
                    defaultValue={createPickerDate(new Date(2024, 4, 5))}
                  />
                </SFormItem>
                <SFormItem label="Capsule Date Input" fieldWidth="full">
                  <SDatePicker capsule className="w-full" placeholder="Pick date" />
                </SFormItem>
              </div>
              <SFormItem label="Date Range with Quick Presets" fieldWidth="full">
                <SRangePicker className="w-full" />
              </SFormItem>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SFormItem label="Disabled State" fieldWidth="full">
                  <SDatePicker disabled className="w-full" placeholder="Disabled date" />
                </SFormItem>
                <SFormItem label="Error State" fieldWidth="full">
                  <SDatePicker status="error" className="w-full" placeholder="Required date" />
                </SFormItem>
              </div>
            </SForm>
          </div>
        </SCard>

        <SCard title="TimePicker & TimeRangePicker (43:34734)">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                24-Hour (`HH:mm:ss`) & 12-Hour (`hh:mm A`)
              </div>
              <div className="flex flex-wrap gap-3">
                <STimePicker
                  style={{ width: 170 }}
                  defaultValue={createPickerDate(new Date(2024, 4, 5, 23, 59, 59))}
                />
                <STimePicker
                  use12Hours
                  style={{ width: 170 }}
                  defaultValue={createPickerDate(new Date(2024, 4, 5, 9, 30, 0))}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Time Range (`Start Time` — `End Time`)
              </div>
              <STimeRangePicker style={{ width: 350, maxWidth: '100%' }} />
            </div>

            <div className="flex flex-wrap gap-3">
              <STimePicker disabled style={{ width: 170 }} placeholder="Disabled" />
              <STimePicker status="error" style={{ width: 170 }} placeholder="Invalid time" />
            </div>
          </div>
        </SCard>
      </div>

      {/* Custom 7x24 Weekly Schedule Matrix */}
      <SCard
        title="Weekly Schedule Matrix (7×24 Click & Drag Paint/Erase)"
        subtitle="Drag across cells to paint or erase rectangular blocks, or use quick presets and keyboard navigation."
        extra={
          <SButton
            size="small"
            variant={scheduleReadOnly ? 'primary' : 'secondary'}
            onClick={() => setScheduleReadOnly((v) => !v)}
          >
            {scheduleReadOnly ? 'Read-Only: ON' : 'Read-Only: OFF'}
          </SButton>
        }
      >
        <SSchedule
          value={scheduleMatrix}
          onChange={setScheduleMatrix}
          readOnly={scheduleReadOnly}
        />
      </SCard>

      {/* Dual-List Transfer */}
      <SCard title="Transfer (Searchable, Paginated & 2-Level Grouped Tree · 43:34736)">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              Searchable + Paginated Device List (`240×368px` columns)
            </div>
            <div className="overflow-x-auto pb-1">
              <STransfer
                dataSource={TRANSFER_ACL_ITEMS}
                targetKeys={transferTargets}
                onChange={(keys) => setTransferTargets(keys.map(String))}
                pagination={{ pageSize: 6 }}
                titles={['Available Devices', 'Assigned Devices']}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              2-Level Grouped Category Tree Mode (`grouped`)
            </div>
            <div className="overflow-x-auto pb-1">
              <STransfer
                grouped
                dataSource={GROUPED_POLICY_ITEMS}
                targetKeys={groupedTargets}
                onChange={(keys) => setGroupedTargets(keys.map(String))}
                titles={['Unassigned Policies', 'Active Policies']}
              />
            </div>
          </div>
        </div>
      </SCard>

      {/* Upload Modes */}
      <SCard title="File Upload & Dropzone Presets (43:34738)">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Config Import Button + Template Link (`preset="config"`)
              </div>
              <SUpload
                preset="config"
                templateText="Download Template"
                onDownloadTemplate={() => toast.info('Downloading configuration template (.cfg)...')}
                onValidationError={(msg) => toast.error(msg)}
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Image Upload (`preset="image"`, max 5 MB)
              </div>
              <SUpload
                preset="image"
                buttonVariant="outline"
                onValidationError={(msg) => toast.error(msg)}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
              Firmware Dropzone (`variant="dragger"`, `preset="firmware"`, `.bin/.img` max 50 MB)
            </div>
            <SUpload
              variant="dragger"
              preset="firmware"
              defaultFileList={INITIAL_FIRMWARE_LIST}
              onValidationError={(msg) => toast.error(msg)}
            />
          </div>
        </div>
      </SCard>
    </div>
  );
};
