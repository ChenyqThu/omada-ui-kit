import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
  SCard,
  SForm,
  SFormItem,
  SIcon,
  SPageHeader,
  omadaChartPalette,
  omadaSemanticTokens,
  useOmadaFeedback,
} from '@/omada';
import {
  SCascader,
  SCheckbox,
  SCheckboxGroup,
  SColorPicker,
  SRadioGroup,
  SSelect,
  SSlider,
  SSwitch,
  STreeSelect,
  type SSelectOption,
} from '../../omada/modules/select-inputs';
import '../../styles/modules/select-inputs.css';

const SECURITY_OPTIONS: SSelectOption[] = [
  {
    label: 'Recommended',
    options: [
      {
        label: 'WPA3-Personal (SAE)',
        value: 'wpa3-personal',
        description: 'Protected Management Frames + 192-bit equivalent encryption',
        icon: <SIcon name="wireless-user" size={15} />,
      },
      {
        label: 'WPA2 / WPA3 Mixed',
        value: 'wpa2-wpa3',
        description: 'Backward compatible transition mode for legacy clients',
        icon: <SIcon name="wireless-user" size={15} />,
      },
    ],
  },
  {
    label: 'Enterprise & Legacy',
    options: [
      {
        label: 'WPA3-Enterprise',
        value: 'wpa3-enterprise',
        description: 'RADIUS 802.1X authentication with dynamic VLAN assignment',
        icon: <SIcon name="wired-user" size={15} />,
      },
      {
        label: 'Open (Captive Portal)',
        value: 'open',
        description: 'Unencrypted guest access gated by portal authentication',
      },
      {
        label: 'WEP (Deprecated)',
        value: 'wep',
        description: 'Legacy protocol disabled for Wi-Fi 6/7 SSIDs',
        disabled: true,
      },
    ],
  },
];

const VLAN_OPTIONS: SSelectOption[] = [
  { label: 'VLAN 1 — Management', value: 'vlan-1' },
  { label: 'VLAN 10 — Corporate LAN', value: 'vlan-10' },
  { label: 'VLAN 20 — Guest Portal', value: 'vlan-20' },
  { label: 'VLAN 30 — IoT & Sensors', value: 'vlan-30' },
  { label: 'VLAN 40 — VoIP Phones', value: 'vlan-40' },
  { label: 'VLAN 50 — Security Cameras', value: 'vlan-50' },
  { label: 'VLAN 60 — Lab Sandbox', value: 'vlan-60' },
  { label: 'VLAN 70 — Engineering', value: 'vlan-70' },
  { label: 'VLAN 80 — Staging Rack', value: 'vlan-80' },
  { label: 'VLAN 90 — DMZ Edge', value: 'vlan-90' },
];

const SITE_CASCADER_OPTIONS = [
  {
    value: 'hq',
    label: 'HQ Campus',
    children: [
      {
        value: 'bldg-a',
        label: 'Building A',
        children: [
          { value: 'fl-1', label: 'Floor 1 (Lobby)' },
          { value: 'fl-2', label: 'Floor 2 (R&D)' },
          { value: 'fl-3', label: 'Floor 3 (Core NOC)' },
        ],
      },
      {
        value: 'bldg-b',
        label: 'Building B',
        children: [
          { value: 'fl-b1', label: 'Warehouse North' },
          { value: 'fl-b2', label: 'Loading Dock' },
        ],
      },
    ],
  },
  {
    value: 'branch-west',
    label: 'West Branch',
    children: [
      {
        value: 'floor-main',
        label: 'Main Office',
        children: [
          { value: 'zone-1', label: 'Sales Pod' },
          { value: 'zone-2', label: 'Meeting Suites' },
        ],
      },
    ],
  },
];

const DEVICE_TREE_DATA = [
  {
    title: 'HQ Core Network',
    value: 'hq-core',
    children: [
      {
        title: 'Gateways & Routers',
        value: 'gateways',
        children: [
          { title: 'ER8411 — Core WAN Gateway', value: 'er8411-1' },
          { title: 'ER7206 — Standby VPN', value: 'er7206-1' },
        ],
      },
      {
        title: 'Aggregation Switches',
        value: 'switches',
        children: [
          { title: 'SG3428XMP — Floor 1 PoE++', value: 'sg3428-1' },
          { title: 'SG3210XHP — Floor 2 PoE+', value: 'sg3210-1' },
        ],
      },
    ],
  },
  {
    title: 'Wireless Access Points',
    value: 'aps',
    children: [
      { title: 'EAP783 — Lobby Ceiling', value: 'eap783-1' },
      { title: 'EAP670 — Conf-Room-North', value: 'eap670-1' },
      { title: 'EAP650-Outdoor — Courtyard', value: 'eap650-out' },
    ],
  },
];

export const SelectInputsSection: React.FC = () => {
  const { toast } = useOmadaFeedback();

  const [vlans, setVlans] = useState<SSelectOption[]>(VLAN_OPTIONS);
  const [selectedVlan, setSelectedVlan] = useState<string>('vlan-10');
  const [selectedBands, setSelectedBands] = useState<string[]>(['2.4g', '5g']);
  const [ssidTags, setSsidTags] = useState<string[]>(['HQ-Corp', 'Wi-Fi 7']);
  const [cascaderMulti, setCascaderMulti] = useState<string[][]>([
    ['hq', 'bldg-a', 'fl-1'],
    ['hq', 'bldg-a', 'fl-2'],
  ]);
  const [treeChecked, setTreeChecked] = useState<string[]>(['eap783-1', 'sg3428-1']);

  const [features, setFeatures] = useState<string[]>(['dhcp', 'mdns']);
  const [featureButtons, setFeatureButtons] = useState<string[]>(['band-steering', 'fast-roaming']);
  const [radioMode, setRadioMode] = useState<string>('auto');
  const [channelWidth, setChannelWidth] = useState<string>('80');
  const [bandCapsule, setBandCapsule] = useState<string>('5g');

  const [txPower, setTxPower] = useState<number>(22);
  const [rssiRange, setRssiRange] = useState<[number, number]>([-75, -45]);
  const [colorTemp, setColorTemp] = useState<number>(4600);
  const [volume, setVolume] = useState<number>(64);
  const [ledColor, setLedColor] = useState<string>(omadaSemanticTokens.light.brand);

  const handleAddVlan = () => {
    const nextNum = 100 + vlans.length * 10;
    const newItem: SSelectOption = {
      label: `VLAN ${nextNum} — Custom Segment`,
      value: `vlan-${nextNum}`,
    };
    setVlans((prev) => [...prev, newItem]);
    setSelectedVlan(String(newItem.value));
    toast.success(`Added ${String(newItem.label)}`);
  };

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Selection & Toggle Controls"
        description="Filled Select/Cascader/TreeSelect controls, Checkbox/Radio groups, 36×22 Switch, Slider presets, and Omada ColorPicker."
      />

      {/* Select, Cascader & TreeSelect */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Select (Filled · Grouped · Tags · Sticky Add Footer)">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Grouped Options with Icons & Descriptions (Searchable)
              </div>
              <SSelect
                showSearch
                allowClear
                placeholder="Select wireless security profile"
                defaultValue="wpa3-personal"
                options={SECURITY_OPTIONS}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                8-Item Scroll Height + Sticky Add New Footer
              </div>
              <SSelect
                showSearch
                value={selectedVlan}
                onChange={(val) => setSelectedVlan(String(val))}
                options={vlans}
                addNewLabel="Add New VLAN"
                onAddNew={handleAddVlan}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Multi-Select (Removable Pills)
                </div>
                <SSelect
                  mode="multiple"
                  value={selectedBands}
                  onChange={(vals) => setSelectedBands(vals as string[])}
                  placeholder="Choose radio bands"
                  options={[
                    { label: '2.4 GHz', value: '2.4g' },
                    { label: '5 GHz', value: '5g' },
                    { label: '6 GHz', value: '6g' },
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Tags Mode (Free Entry)
                </div>
                <SSelect
                  mode="tags"
                  value={ssidTags}
                  onChange={(vals) => setSsidTags(vals as string[])}
                  placeholder="Add SSID tags"
                  options={[
                    { label: 'HQ-Corp', value: 'HQ-Corp' },
                    { label: 'Wi-Fi 7', value: 'Wi-Fi 7' },
                    { label: 'Guest-Isolated', value: 'Guest-Isolated' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Error State
                </div>
                <SSelect
                  status="error"
                  placeholder="Required network profile"
                  options={VLAN_OPTIONS.slice(0, 4)}
                  className="w-full"
                />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Disabled State
                </div>
                <SSelect
                  disabled
                  defaultValue="vlan-1"
                  options={VLAN_OPTIONS.slice(0, 4)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </SCard>

        <SCard title="Cascader & TreeSelect (Hierarchical & Popup Search)">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Single Cascader (Custom Path Display)
              </div>
              <SCascader
                options={SITE_CASCADER_OPTIONS}
                defaultValue={['hq', 'bldg-a', 'fl-2']}
                showSearch
                placeholder="Select site / building / floor"
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Multi-Select Cascader
              </div>
              <SCascader
                multiple
                maxTagCount="responsive"
                options={SITE_CASCADER_OPTIONS}
                value={cascaderMulti}
                onChange={(vals) => setCascaderMulti(vals)}
                placeholder="Select deployment zones"
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                TreeSelect (Checkable Multi-Select + Built-in Popup Search)
              </div>
              <STreeSelect
                treeCheckable
                popupSearch
                searchPlaceholder="Filter devices or groups..."
                treeDefaultExpandAll
                showCheckedStrategy={STreeSelect.SHOW_CHILD}
                value={treeChecked}
                onChange={(vals) => setTreeChecked(vals as string[])}
                treeData={DEVICE_TREE_DATA}
                placeholder="Select target devices"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  TreeSelect Single (Error)
                </div>
                <STreeSelect
                  status="error"
                  showSearch
                  treeDefaultExpandAll
                  treeData={DEVICE_TREE_DATA}
                  placeholder="Select primary uplink"
                  className="w-full"
                />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Cascader Disabled
                </div>
                <SCascader
                  disabled
                  defaultValue={['branch-west', 'floor-main', 'zone-1']}
                  options={SITE_CASCADER_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </SCard>
      </div>

      {/* Checkbox & Radio */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Checkbox (Select All · Descriptions · 160px Grid · Button Variant)">
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Select All with Indeterminate State + 160px Aligned Grid
              </div>
              <SCheckboxGroup
                showSelectAll
                selectAllLabel="Enable All Gateway Guards"
                itemWidth={160}
                value={features}
                onChange={(vals) => setFeatures(vals)}
                options={[
                  { label: 'DHCP Guard', value: 'dhcp' },
                  { label: 'mDNS Reflector', value: 'mdns' },
                  { label: 'IGMP Snooping', value: 'igmp' },
                  { label: 'ARP Inspection', value: 'arp' },
                ]}
              />
            </div>

            <div className="border-t border-[var(--omada-border-divider)] pt-4">
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Option Descriptions (4px gap) & Indeterminate Standalone
              </div>
              <div className="space-y-2.5">
                <SCheckbox
                  defaultChecked
                  description="Broadcast SSID across both 5 GHz and 6 GHz radios with MLO enabled."
                >
                  Multi-Link Operation (Wi-Fi 7)
                </SCheckbox>
                <div>
                  <SCheckbox indeterminate>Partially Adopted Site Policy</SCheckbox>
                </div>
                <div>
                  <SCheckbox disabled defaultChecked>
                    Locked System Default
                  </SCheckbox>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--omada-border-divider)] pt-4">
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Linear Button Variant (<code>variant="button"</code>)
              </div>
              <SCheckboxGroup
                variant="button"
                value={featureButtons}
                onChange={(vals) => setFeatureButtons(vals)}
                options={[
                  { label: 'Band Steering', value: 'band-steering' },
                  { label: 'Fast Roaming (802.11r)', value: 'fast-roaming' },
                  { label: 'Airtime Fairness', value: 'airtime' },
                  { label: 'OFDMA', value: 'ofdma', disabled: true },
                ]}
              />
            </div>
          </div>
        </SCard>

        <SCard title="Radio (Default · Descriptions · Linear Button · Capsule)">
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Default Radio Group + Vertical Descriptions
              </div>
              <div className="space-y-3">
                <SRadioGroup
                  value={radioMode}
                  onChange={(e) => setRadioMode(String(e.target.value))}
                  options={[
                    { label: 'Auto Channel', value: 'auto' },
                    { label: 'Manual Channel', value: 'manual' },
                    { label: 'AI WLAN Opt', value: 'ai' },
                    { label: 'Locked', value: 'locked', disabled: true },
                  ]}
                />
                <SRadioGroup
                  direction="vertical"
                  defaultValue="balanced"
                  options={[
                    {
                      label: 'Balanced Roaming',
                      value: 'balanced',
                      description: 'Triggers client steering when RSSI drops below -72 dBm.',
                    },
                    {
                      label: 'Aggressive Coverage',
                      value: 'aggressive',
                      description: 'Prioritizes high-density roaming across adjacent APs.',
                    },
                  ]}
                />
              </div>
            </div>

            <div className="border-t border-[var(--omada-border-divider)] pt-4">
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Linear Button Group (<code>variant="button"</code>)
              </div>
              <SRadioGroup
                variant="button"
                value={channelWidth}
                onChange={(e) => setChannelWidth(String(e.target.value))}
                options={[
                  { label: '20 MHz', value: '20' },
                  { label: '40 MHz', value: '40' },
                  { label: '80 MHz', value: '80' },
                  { label: '160 MHz', value: '160' },
                  { label: '320 MHz', value: '320', disabled: true },
                ]}
              />
            </div>

            <div className="border-t border-[var(--omada-border-divider)] pt-4">
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Capsule Group (<code>variant="capsule"</code>) &amp; Pill Variant
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <SRadioGroup
                  variant="capsule"
                  value={bandCapsule}
                  onChange={(e) => setBandCapsule(String(e.target.value))}
                  options={[
                    { label: '2.4 GHz', value: '2.4g' },
                    { label: '5 GHz', value: '5g' },
                    { label: '6 GHz', value: '6g' },
                  ]}
                />
                <SRadioGroup
                  variant="capsule"
                  pill
                  defaultValue="24h"
                  options={[
                    { label: '24 Hours', value: '24h' },
                    { label: '7 Days', value: '7d' },
                    { label: '30 Days', value: '30d' },
                  ]}
                />
              </div>
            </div>
          </div>
        </SCard>
      </div>

      {/* Switch, Slider & ColorPicker */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Switch (36×22 Medium · 28×16 Small · Label & Description)">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-5">
              <SSwitch defaultChecked />
              <SSwitch />
              <SSwitch size="small" defaultChecked />
              <SSwitch size="small" />
              <SSwitch defaultChecked disabled />
              <SSwitch loading defaultChecked />
            </div>

            <div className="space-y-3 border-t border-[var(--omada-border-divider)] pt-4">
              <SSwitch
                defaultChecked
                label="Automatic Channel Optimization"
                description="Periodically scans neighboring APs and mitigates co-channel interference."
              />
              <SSwitch
                layout="horizontal"
                labelPlacement="start"
                gap="lg"
                defaultChecked
                label="PoE Priority Protection"
                description="Sheds low-priority ports first when total power budget approaches 90%."
              />
              <SSwitch
                layout="vertical"
                gap="sm"
                disabled
                label="Maintenance Lockout"
                description="Disabled while firmware upgrade schedule is active."
              />
            </div>
          </div>
        </SCard>

        <SCard title="ColorPicker (32px Filled Trigger · Curated Omada Swatches)">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Default with Omada Presets
                </div>
                <SColorPicker
                  value={ledColor}
                  onChange={(_color, hex) => setLedColor(hex)}
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Custom Swatches + Alpha
                </div>
                <SColorPicker
                  defaultValue={omadaChartPalette.light[3]}
                  presetColors={[...omadaChartPalette.light.slice(0, 6)]}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-[var(--omada-border-divider)] pt-4">
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Compact Swatch Only
                </div>
                <SColorPicker
                  showText={false}
                  defaultValue={omadaSemanticTokens.light.warning}
                />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Error State
                </div>
                <SColorPicker
                  status="error"
                  defaultValue={omadaSemanticTokens.light.error}
                />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Disabled State
                </div>
                <SColorPicker
                  disabled
                  defaultValue={omadaSemanticTokens.light.info}
                />
              </div>
            </div>
          </div>
        </SCard>
      </div>

      {/* Sliders */}
      <SCard title="Slider (Single + Input · Range · Stepped Presets · Color-Temp & Spectrum)">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Single Slider with Paired Numeric Input (Blur Clamping [4, 30 dBm])
              </div>
              <SSlider
                showInput
                min={4}
                max={30}
                unit="dBm"
                value={txPower}
                onChange={(v) => setTxPower(v)}
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Range Slider with Dual Inputs (RSSI Threshold)
              </div>
              <SSlider
                range
                showInput
                min={-95}
                max={-20}
                unit="dBm"
                value={rssiRange}
                onChange={(v) => setRssiRange([v[0], v[1]])}
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Icon Slider & Disabled Slider
              </div>
              <div className="space-y-3">
                <SSlider
                  startIcon={<VolumeX size={16} />}
                  endIcon={<Volume2 size={16} />}
                  unit="%"
                  value={volume}
                  onChange={(v) => setVolume(v)}
                />
                <SSlider disabled defaultValue={45} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Stepped Marks (<code>stepPreset="levels"</code> &amp; <code>stepPreset="1-5"</code> Segmented)
              </div>
              <div className="space-y-8 pb-4">
                <SSlider stepPreset="levels" defaultValue={50} />
                <SSlider stepPreset="1-5" segmented defaultValue={3} />
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Color Temperature Preset (<code>preset="color-temp"</code> · 2700K–6500K)
              </div>
              <SSlider
                preset="color-temp"
                showInput
                min={2700}
                max={6500}
                step={100}
                unit="K"
                value={colorTemp}
                onChange={(v) => setColorTemp(v)}
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Hue Spectrum Preset (<code>preset="hue"</code>)
              </div>
              <SSlider preset="hue" min={0} max={360} defaultValue={160} unit="°" />
            </div>
          </div>
        </div>
      </SCard>

      {/* Form Integration Preview */}
      <SCard title="Form Integration (SForm + Selection Controls)">
        <SForm
          initialValues={{
            profile: 'wpa3-personal',
            site: ['hq', 'bldg-a', 'fl-1'],
            band: '5g',
            enabled: true,
          }}
        >
          <SFormItem label="Security Profile" name="profile">
            <SSelect options={SECURITY_OPTIONS} />
          </SFormItem>
          <SFormItem label="Site Zone" name="site">
            <SCascader options={SITE_CASCADER_OPTIONS} />
          </SFormItem>
          <SFormItem label="Radio Band" name="band">
            <SRadioGroup
              variant="capsule"
              options={[
                { label: '2.4 GHz', value: '2.4g' },
                { label: '5 GHz', value: '5g' },
                { label: '6 GHz', value: '6g' },
              ]}
            />
          </SFormItem>
          <SFormItem label="Broadcast SSID" name="enabled" valuePropName="checked">
            <SSwitch label="Active on selected AP group" />
          </SFormItem>
        </SForm>
      </SCard>
    </div>
  );
};
