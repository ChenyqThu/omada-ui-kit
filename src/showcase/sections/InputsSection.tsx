import React, { useState } from 'react';
import { Checkbox, DatePicker, Radio, Select, Slider, Switch } from 'antd';
import { Plus, RefreshCw } from 'lucide-react';
import {
  SButton,
  SCard,
  SForm,
  SFormFooter,
  SFormItem,
  SFormSection,
  SInput,
  SIpInput,
  SMacInput,
  SNumberInput,
  SPageHeader,
  SPasswordInput,
  SSearchInput,
  STextArea,
  useOmadaFeedback,
  validateCidr,
  validateIpv4,
  validateMac,
} from '@/omada';

export const InputsSection: React.FC = () => {
  const { toast } = useOmadaFeedback();
  const [form] = SForm.useForm();

  const [ipVal, setIpVal] = useState('192.168.10.25');
  const [cidrVal, setCidrVal] = useState('10.10.0.0/16');
  const [portIpVal, setPortIpVal] = useState('192.168.0.10:8080');
  const [macVal, setMacVal] = useState('00-FF-00-05-3E-FC');
  const [passwordVal, setPasswordVal] = useState('Omada@2026!');

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Inputs & Forms"
        description="Omada buttons, filled controls (#F4F4F4 / #272727), IPv4/CIDR/MAC inputs, and horizontal configuration forms."
      />

      {/* Buttons */}
      <SCard title="Buttons (8 Variants · 32px Default / 40px Large)">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <SButton variant="primary" icon={<Plus size={15} />}>
              Primary
            </SButton>
            <SButton variant="secondary" icon={<RefreshCw size={15} />}>
              Secondary
            </SButton>
            <SButton variant="outline">Outline</SButton>
            <SButton variant="dashed">Dashed</SButton>
            <SButton variant="text">Text</SButton>
            <SButton variant="link">Link</SButton>
            <SButton variant="danger">Danger</SButton>
            <SButton variant="danger-outline">Danger Outline</SButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SButton variant="primary" size="large">
              Large 40px
            </SButton>
            <SButton variant="secondary" size="large">
              Secondary Large
            </SButton>
            <SButton variant="primary" loading>
              Loading
            </SButton>
            <SButton variant="primary" disabled>
              Disabled
            </SButton>
            <SButton variant="secondary" disabled>
              Secondary Disabled
            </SButton>
          </div>
        </div>
      </SCard>

      {/* Text & Network Specialized Inputs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Text, Search & Password Inputs">
          <div className="space-y-3.5">
            <div>
              <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">
                Standard Filled Input (32px)
              </div>
              <SInput placeholder="Enter SSID or VLAN name" style={{ maxWidth: 350 }} />
            </div>
            <div>
              <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">
                Search Input (260px default)
              </div>
              <SSearchInput placeholder="Search rules or MAC..." />
            </div>
            <div>
              <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">
                Password with Live Strength Meter
              </div>
              <div style={{ maxWidth: 350 }}>
                <SPasswordInput
                  showStrength
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">
                  Number Input
                </div>
                <SNumberInput min={1} max={4094} defaultValue={100} />
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">
                  Date Picker
                </div>
                <DatePicker variant="filled" placeholder="Select date" style={{ width: 176 }} />
              </div>
            </div>
          </div>
        </SCard>

        <SCard title="Omada Network Inputs (IP / CIDR / Port / MAC)">
          <div className="space-y-3.5">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[var(--omada-text-secondary)]">IPv4 Address</span>
                <span
                  className="font-mono"
                  style={{
                    color: validateIpv4(ipVal)
                      ? 'var(--omada-color-success)'
                      : 'var(--omada-color-error)',
                  }}
                >
                  {ipVal || '—'} ({validateIpv4(ipVal) ? 'valid' : 'invalid'})
                </span>
              </div>
              <SIpInput
                mode="ip"
                value={ipVal}
                onChange={setIpVal}
                status={ipVal && !validateIpv4(ipVal) ? 'error' : undefined}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[var(--omada-text-secondary)]">Subnet CIDR</span>
                <span
                  className="font-mono"
                  style={{
                    color: validateCidr(cidrVal)
                      ? 'var(--omada-color-success)'
                      : 'var(--omada-color-error)',
                  }}
                >
                  {cidrVal || '—'}
                </span>
              </div>
              <SIpInput
                mode="cidr"
                value={cidrVal}
                onChange={setCidrVal}
                status={cidrVal && !validateCidr(cidrVal) ? 'error' : undefined}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[var(--omada-text-secondary)]">IP + Port (40px Large)</span>
                <span className="font-mono text-[var(--omada-text-tertiary)]">
                  {portIpVal}
                </span>
              </div>
              <SIpInput mode="port" size="large" value={portIpVal} onChange={setPortIpVal} />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[var(--omada-text-secondary)]">MAC Address (Auto-uppercase & paste)</span>
                <span
                  className="font-mono"
                  style={{
                    color: validateMac(macVal)
                      ? 'var(--omada-color-success)'
                      : 'var(--omada-color-error)',
                  }}
                >
                  {macVal || '—'}
                </span>
              </div>
              <SMacInput
                value={macVal}
                onChange={setMacVal}
                status={macVal && !validateMac(macVal) ? 'error' : undefined}
              />
            </div>
          </div>
        </SCard>
      </div>

      {/* AntD Selection & Toggle Controls */}
      <SCard title="Selectors, Switches, Radios, Checkboxes & Sliders">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                variant="filled"
                defaultValue="wpa3"
                style={{ width: 220 }}
                options={[
                  { label: 'WPA3-Personal', value: 'wpa3' },
                  { label: 'WPA2/WPA3 Mixed', value: 'mixed' },
                  { label: 'WPA2-Enterprise', value: 'ent' },
                ]}
              />
              <Select
                mode="multiple"
                variant="filled"
                defaultValue={['2.4g', '5g']}
                style={{ minWidth: 220 }}
                options={[
                  { label: '2.4 GHz', value: '2.4g' },
                  { label: '5 GHz', value: '5g' },
                  { label: '6 GHz', value: '6g' },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Switch defaultChecked />
              <Switch />
              <Switch defaultChecked disabled />
              <Switch loading defaultChecked />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Checkbox.Group
                defaultValue={['dhcp', 'mdns']}
                options={[
                  { label: 'DHCP Guard', value: 'dhcp' },
                  { label: 'mDNS', value: 'mdns' },
                  { label: 'IGMP Snooping', value: 'igmp' },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Radio.Group defaultValue="auto">
                <Radio value="auto">Auto</Radio>
                <Radio value="manual">Manual</Radio>
              </Radio.Group>
              <Radio.Group defaultValue="5g" optionType="button">
                <Radio.Button value="2.4g">2.4G</Radio.Button>
                <Radio.Button value="5g">5G</Radio.Button>
                <Radio.Button value="6g">6G</Radio.Button>
              </Radio.Group>
            </div>
            <div style={{ maxWidth: 320 }}>
              <Slider defaultValue={65} />
            </div>
          </div>
        </div>
      </SCard>

      {/* Complete Horizontal Omada Form */}
      <SCard title="Omada Horizontal Settings Form (200px Label · 350px Field · Sticky Footer)" padding="none">
        <SForm
          form={form}
          initialValues={{
            networkName: 'Corp-LAN',
            gatewayIp: '192.168.10.1/24',
            dhcpEnabled: true,
            leaseTime: 1440,
            vlanId: 10,
          }}
          onFinish={(values) => {
            toast.success(`Applied settings for ${String(values.networkName)}`);
          }}
        >
          <div className="p-6">
            <SFormSection
              title="Basic Network Settings"
              description="Configure gateway subnet and DHCP allocation range."
            >
              <SFormItem
                label="Network Name"
                name="networkName"
                rules={[{ required: true, message: 'Please enter a network name' }]}
              >
                <SInput placeholder="e.g. Corp-LAN" />
              </SFormItem>
              <SFormItem
                label="Gateway / Subnet"
                name="gatewayIp"
                tooltip="Gateway IPv4 and CIDR prefix length."
                hint="Example: 192.168.10.1/24 provides 254 usable host addresses."
              >
                <SIpInput mode="cidr" />
              </SFormItem>
              <SFormItem label="VLAN ID" name="vlanId" optional>
                <SNumberInput min={1} max={4094} className="w-full" />
              </SFormItem>
              <SFormItem label="DHCP Server" name="dhcpEnabled" valuePropName="checked">
                <Switch />
              </SFormItem>
              <SFormItem label="Description" name="desc" optional>
                <STextArea rows={2} placeholder="Optional subnet note..." />
              </SFormItem>
            </SFormSection>
          </div>
          <SFormFooter
            sticky={false}
            onCancel={() => {
              form.resetFields();
              toast.info('Form reset to initial values');
            }}
          />
        </SForm>
      </SCard>
    </div>
  );
};
