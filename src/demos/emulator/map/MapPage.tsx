import React, { useMemo, useRef, useState } from 'react';
import { Form, Popover } from 'antd';
import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Info,
  Maximize2,
  Minus,
  MousePointer,
  Plus,
  Ruler,
  X,
} from 'lucide-react';
import {
  SButton,
  SIcon,
  SInput,
  SModal,
  SProductImage,
  SSelect,
  SSlider,
  STabs,
  STooltip,
  useOmadaNotification,
} from '@/omada';
import {
  DEVICE_MAP_CLUSTER,
  DEVICE_MAP_PINS,
  HEAT_MAP_FLOORS,
  NIGER_RIVER_PATH,
  WEST_AFRICA_COUNTRY_BORDERS,
  WEST_AFRICA_LABELS,
  WEST_AFRICA_REGION_BORDERS,
  type DeviceMapPin,
  type HeatMapBand,
  type HeatMapFloorPlan,
  type HeatMapIconSize,
} from './mapData';

export type MapPageTabKey = 'heat-map' | 'device-map';

export interface MapPageProps {
  /** Initial active tab (`'heat-map'` default or `'device-map'`). */
  initialTab?: MapPageTabKey;
  /** Invoked when clicking a device pin on Device Map to open DevicePropertiesDrawer. */
  onOpenDeviceByName?: (deviceName: string) => void;
  className?: string;
}

const BAND_OPTIONS: HeatMapBand[] = ['2.4 GHz', '5 GHz', '6 GHz'];
const ICON_SIZE_SCALE: Record<HeatMapIconSize, number> = {
  Small: 1,
  Medium: 1.18,
  Large: 1.36,
};

/**
 * Omada Controller v6.3.0.34 Map Workspace (`#/map`).
 * Includes:
 * - Tab 1 (`Heat Map`): 2-row CAD toolbar, opacity slider, pointer/ruler/edit/simulate tools,
 *   interactive multi-room architectural office floorplan SVG, `2.4 GHz | 5 GHz | 6 GHz` band toggle,
 *   `Virtual Device` AP badge, wall-attenuation lines, and radial Wi-Fi coverage heatmap overlay.
 * - Tab 2 (`Device Map`): monochrome West Africa vector map, search pill & list drawer,
 *   zoom/recenter stack, green-halo `SProductImage` pins + cluster badge `2`, right-click menu,
 *   and dismissible tip card.
 */
export const MapPage: React.FC<MapPageProps> = ({
  initialTab = 'heat-map',
  onOpenDeviceByName,
  className = '',
}) => {
  const notification = useOmadaNotification();

  const [activeTab, setActiveTab] = useState<MapPageTabKey>(initialTab);

  // ============================================================================
  // Heat Map State
  // ============================================================================
  const [floors, setFloors] = useState<HeatMapFloorPlan[]>(HEAT_MAP_FLOORS);
  const [activeFloorId, setActiveFloorId] = useState<string>(HEAT_MAP_FLOORS[0].id);
  const [opacity, setOpacity] = useState<number>(100);
  const [iconSize, setIconSize] = useState<HeatMapIconSize>('Small');
  const [activeTool, setActiveTool] = useState<'pointer' | 'ruler'>('pointer');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [simulateActive, setSimulateActive] = useState<boolean>(false);
  const [activeBand, setActiveBand] = useState<HeatMapBand>('2.4 GHz');
  const [heatZoom, setHeatZoom] = useState<number>(1);
  const [heatListOpen, setHeatListOpen] = useState<boolean>(false);
  const [addFloorOpen, setAddFloorOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [newFloorName, setNewFloorName] = useState<string>('');
  const [wallAttenuationDb, setWallAttenuationDb] = useState<number>(6);

  const activeFloorIndex = Math.max(
    0,
    floors.findIndex((f) => f.id === activeFloorId),
  );
  const activeFloor = floors[activeFloorIndex] ?? floors[0];

  const handleCycleFloor = (delta: -1 | 1) => {
    const nextIdx = (activeFloorIndex + delta + floors.length) % floors.length;
    setActiveFloorId(floors[nextIdx].id);
  };

  const handleAddFloor = () => {
    const trimmed = newFloorName.trim() || `Map_${floors.length + 1}`;
    const created: HeatMapFloorPlan = {
      id: `map-custom-${Date.now()}`,
      name: trimmed,
      scaleMeters: 36.4,
      dimensionsLabel: '44.0m × 22.0m',
      virtualDevice: {
        id: `virtual-ap-${floors.length + 1}`,
        label: 'Virtual Device',
        x: 340,
        y: 230,
      },
      description: `Custom Floorplan · ${trimmed}`,
    };
    setFloors((prev) => [...prev, created]);
    setActiveFloorId(created.id);
    setNewFloorName('');
    setAddFloorOpen(false);
    notification.success({
      title: 'Floorplan Added',
      description: `Created "${trimmed}" in Heat Map.`,
    });
  };

  // ============================================================================
  // Device Map State
  // ============================================================================
  const [pins, setPins] = useState<DeviceMapPin[]>(DEVICE_MAP_PINS);
  const [searchScope, setSearchScope] = useState<'device' | 'site' | 'location'>('device');
  const [deviceSearch, setDeviceSearch] = useState<string>('');
  const [deviceZoom, setDeviceZoom] = useState<number>(1);
  const [devicePan, setDevicePan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [deviceListOpen, setDeviceListOpen] = useState<boolean>(false);
  const [clusterOpen, setClusterOpen] = useState<boolean>(false);
  const [tipDismissed, setTipDismissed] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    pin: DeviceMapPin;
    x: number;
    y: number;
  } | null>(null);

  const mapDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const normalizedSearch = deviceSearch.trim().toLowerCase();

  const matchingPinKeys = useMemo(() => {
    if (!normalizedSearch) return null;
    return new Set(
      pins
        .filter((pin) => {
          if (searchScope === 'location') {
            return pin.locationLabel.toLowerCase().includes(normalizedSearch);
          }
          if (searchScope === 'site') {
            return 'main office floor'.includes(normalizedSearch) || pin.name.toLowerCase().includes(normalizedSearch);
          }
          return (
            pin.name.toLowerCase().includes(normalizedSearch) ||
            pin.model.toLowerCase().includes(normalizedSearch)
          );
        })
        .map((p) => p.key),
    );
  }, [pins, normalizedSearch, searchScope]);

  const handleMapPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, .ant-select, .omada-map-floating-card')) return;
    setContextMenu(null);
    setClusterOpen(false);
    mapDragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: devicePan.x,
      originY: devicePan.y,
    };
  };

  const handleMapPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mapDragRef.current.active) return;
    setDevicePan({
      x: mapDragRef.current.originX + (e.clientX - mapDragRef.current.startX),
      y: mapDragRef.current.originY + (e.clientY - mapDragRef.current.startY),
    });
  };

  const handleMapPointerUp = () => {
    mapDragRef.current.active = false;
  };

  const bandRadiusScale =
    activeBand === '2.4 GHz' ? 1.15 : activeBand === '5 GHz' ? 0.92 : 0.74;
  const apBadgeScale = ICON_SIZE_SCALE[iconSize];

  return (
    <div
      className={`omada-map-page flex h-full min-h-[680px] flex-col ${className}`.trim()}
      data-testid="map-page"
    >
      {/* Top Underline Tabs + Heat Map Right Controls */}
      <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-[var(--omada-border-divider)] bg-[var(--omada-map-canvas-bg)] px-6">
        <div className="flex h-full items-end">
          <STabs
            variant="page"
            size="md"
            bordered={false}
            aria-label="Map views"
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as typeof activeTab)}
            items={[
              { key: 'heat-map', label: 'Heat Map' },
              { key: 'device-map', label: 'Device Map' },
            ]}
          />
        </div>

        {activeTab === 'heat-map' && (
          <div className="flex items-center gap-3.5 pr-4">
            <STooltip title="Fit Floorplan">
              <button
                type="button"
                aria-label="Fit floorplan"
                data-testid="heatmap-fit-btn"
                onClick={() => setHeatZoom(1)}
                className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
              >
                <Maximize2 size={14} strokeWidth={1.75} />
              </button>
            </STooltip>

            <STooltip title="Zoom In">
              <button
                type="button"
                aria-label="Zoom in floorplan"
                data-testid="heatmap-zoom-in-btn"
                onClick={() => setHeatZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
                className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
              >
                <Plus size={16} strokeWidth={1.75} />
              </button>
            </STooltip>

            <STooltip title="Zoom Out">
              <button
                type="button"
                aria-label="Zoom out floorplan"
                data-testid="heatmap-zoom-out-btn"
                onClick={() => setHeatZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
              >
                <Minus size={16} strokeWidth={1.75} />
              </button>
            </STooltip>

            <div className="omada-map-scale-bar" data-testid="heatmap-scale-ruler">
              <span className="tabular-nums text-[12px] leading-[14px] text-[var(--omada-text-primary)]">
                {(activeFloor.scaleMeters / heatZoom).toFixed(2)}m
              </span>
              <span className="omada-map-scale-line mt-0.5" aria-hidden="true" />
            </div>

            <STooltip title="Heat Map Settings">
              <button
                type="button"
                aria-label="Heat map settings"
                data-testid="heatmap-settings-btn"
                onClick={() => setSettingsModalOpen(true)}
                className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent hover:bg-[var(--omada-brand-bg-subtlest)]"
              >
                <SIcon name="settings" size={18} />
              </button>
            </STooltip>

            <STooltip title="Export Heat Map">
              <button
                type="button"
                aria-label="Export heat map"
                data-testid="heatmap-export-btn"
                onClick={() =>
                  notification.success({
                    title: 'Heat Map Exported',
                    description: `Exported ${activeFloor.name} (${activeBand}) report to ${activeFloor.name.toLowerCase()}-heatmap.png.`,
                  })
                }
                className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent hover:bg-[var(--omada-brand-bg-subtlest)]"
              >
                <SIcon name="export-2" size={18} />
              </button>
            </STooltip>
          </div>
        )}
      </header>

      {/* ====================================================================
       * TAB 1: HEAT MAP
       * ==================================================================== */}
      {activeTab === 'heat-map' ? (
        <div className="flex flex-1 flex-col" data-testid="heat-map-panel">
          {/* 2-Row Toolbar */}
          <div className="border-b border-[var(--omada-border-divider)] bg-[var(--omada-map-canvas-bg)] px-6 pt-3.5 pb-3">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-[var(--omada-text-secondary)]">Heat Map</span>

              <SSelect
                aria-label="Select Heat Map floorplan"
                className="omada-map-filled-select w-[264px]"
                value={activeFloor.id}
                onChange={(val) => setActiveFloorId(String(val))}
                options={floors.map((f) => ({ value: f.id, label: f.name }))}
              />

              <Popover
                open={heatListOpen}
                onOpenChange={setHeatListOpen}
                trigger="click"
                placement="bottomLeft"
                content={
                  <div className="w-[240px] space-y-1.5">
                    <div className="text-[12px] font-semibold text-[var(--omada-text-primary)]">
                      Floorplans ({floors.length})
                    </div>
                    {floors.map((floor) => (
                      <button
                        key={floor.id}
                        type="button"
                        onClick={() => {
                          setActiveFloorId(floor.id);
                          setHeatListOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-[4px] border-0 px-2.5 py-1.5 text-left text-[12px] ${
                          floor.id === activeFloor.id
                            ? 'bg-[var(--omada-brand-bg-subtle)] font-medium text-[var(--omada-brand-text)]'
                            : 'bg-transparent text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
                        }`}
                      >
                        <span>{floor.name}</span>
                        <span className="text-[11px] text-[var(--omada-text-tertiary)]">
                          {floor.dimensionsLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="Floorplan list"
                  className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent text-[var(--omada-brand-text)] hover:bg-[var(--omada-brand-bg-subtlest)]"
                >
                  <SIcon name="list" size={17} />
                </button>
              </Popover>

              <STooltip title="Add Floorplan">
                <button
                  type="button"
                  aria-label="Add floorplan"
                  onClick={() => setAddFloorOpen(true)}
                  className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent hover:bg-[var(--omada-brand-bg-subtlest)]"
                >
                  <SIcon name="add-add-2" size={18} />
                </button>
              </STooltip>

              <STooltip title="Floorplan Template">
                <button
                  type="button"
                  aria-label="Floorplan template"
                  onClick={() =>
                    notification.info({
                      title: 'Floorplan Preset',
                      description: activeFloor.description,
                    })
                  }
                  className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent text-[var(--omada-brand-text)] hover:bg-[var(--omada-brand-bg-subtlest)]"
                >
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <rect
                      x="3"
                      y="2.5"
                      width="14"
                      height="15"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path d="M6.5 7H13.5M6.5 10.5H13.5M6.5 14H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </STooltip>

              <span className="ml-2 text-[13px] text-[var(--omada-text-secondary)]">Opacity</span>

              <div className="flex items-center gap-2.5">
                <div className="w-[118px]">
                  <SSlider
                    aria-label="Floorplan opacity"
                    min={10}
                    max={100}
                    step={1}
                    value={opacity}
                    onChange={(val) => setOpacity(typeof val === 'number' ? val : 100)}
                  />
                </div>
                <span
                  data-testid="heatmap-opacity-value"
                  className="tabular-nums w-[38px] text-[13px] text-[var(--omada-text-secondary)]"
                >
                  {opacity}%
                </span>
              </div>

              <span className="ml-2 text-[13px] text-[var(--omada-text-secondary)]">Icon</span>

              <SSelect
                aria-label="Icon size"
                className="omada-map-filled-select w-[112px]"
                value={iconSize}
                onChange={(val) => setIconSize(val as HeatMapIconSize)}
                options={[
                  { value: 'Small', label: 'Small' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Large', label: 'Large' },
                ]}
              />
            </div>

            {/* Row 2 */}
            <div className="mt-2.5 flex items-center gap-3 pl-2">
              <STooltip title="Select Tool">
                <button
                  type="button"
                  aria-label="Select tool"
                  aria-pressed={activeTool === 'pointer'}
                  onClick={() => setActiveTool('pointer')}
                  className={`flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent transition-colors ${
                    activeTool === 'pointer'
                      ? 'text-[var(--omada-brand-text)]'
                      : 'text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field)]'
                  }`}
                >
                  <MousePointer size={15} strokeWidth={2} />
                </button>
              </STooltip>

              <STooltip title="Measure Distance">
                <button
                  type="button"
                  aria-label="Measure distance"
                  aria-pressed={activeTool === 'ruler'}
                  onClick={() => setActiveTool((t) => (t === 'ruler' ? 'pointer' : 'ruler'))}
                  className={`flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] border-0 transition-colors ${
                    activeTool === 'ruler'
                      ? 'bg-[var(--omada-brand-bg-subtle)] text-[var(--omada-brand-text)]'
                      : 'bg-transparent text-[var(--omada-brand-text)] hover:bg-[var(--omada-brand-bg-subtlest)]'
                  }`}
                >
                  <Ruler size={16} strokeWidth={1.8} />
                </button>
              </STooltip>

              <SButton
                variant="primary"
                data-testid="heatmap-edit-btn"
                onClick={() => {
                  setEditMode((v) => !v);
                  notification.info({
                    title: !editMode ? 'Edit Mode Enabled' : 'Edit Mode Exited',
                    description: !editMode
                      ? `Editing walls & AP placement on ${activeFloor.name}.`
                      : `Saved layout changes on ${activeFloor.name}.`,
                  });
                }}
                icon={
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8.5 2.7H3.3C2.75 2.7 2.3 3.15 2.3 3.7V12.7C2.3 13.25 2.75 13.7 3.3 13.7H12.3C12.85 13.7 13.3 13.25 13.3 12.7V7.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13.3 2.7L7.5 8.5L6.7 10.1L8.3 9.3L14.1 3.5L13.3 2.7Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                className="omada-map-primary-btn"
              >
                Edit
              </SButton>

              <SButton
                variant="primary"
                data-testid="heatmap-simulate-btn"
                aria-pressed={simulateActive}
                onClick={() => setSimulateActive((s) => !s)}
                className={`omada-map-primary-btn ${
                  simulateActive ? 'is-active-simulate' : ''
                }`.trim()}
              >
                Simulate
              </SButton>

              {activeTool === 'ruler' && (
                <span className="rounded-[4px] bg-[var(--omada-brand-bg-subtlest)] px-2.5 py-1 text-[12px] text-[var(--omada-brand-text)]">
                  Span: {activeFloor.dimensionsLabel}
                </span>
              )}
              {editMode && (
                <span className="rounded-[4px] bg-[var(--omada-color-warning-bg)] px-2.5 py-1 text-[12px] text-[var(--omada-color-warning)]">
                  Editing walls ({wallAttenuationDb} dB loss)
                </span>
              )}
            </div>
          </div>

          {/* Floorplan Canvas */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[var(--omada-map-canvas-bg)] px-10 py-6">
            {/* Top-Right Floating Band Switcher */}
            <div className="omada-map-floating-card absolute top-4 right-7 z-20 inline-flex items-center rounded-[4px] p-[2px]">
              <STabs
                variant="filter"
                aria-label="Wi-Fi frequency band"
                activeKey={activeBand}
                onChange={(k) => setActiveBand(k as typeof activeBand)}
                items={BAND_OPTIONS.map((band) => ({ key: band, label: band }))}
              />
            </div>

            {/* Left / Right Floorplan Carousel Arrows */}
            <button
              type="button"
              aria-label="Previous floorplan"
              onClick={() => handleCycleFloor(-1)}
              className="absolute left-4 top-1/2 z-10 flex h-[32px] w-[32px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[var(--omada-text-tertiary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              aria-label="Next floorplan"
              onClick={() => handleCycleFloor(1)}
              className="absolute right-4 top-1/2 z-10 flex h-[32px] w-[32px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[var(--omada-text-tertiary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <ChevronRight size={18} />
            </button>

            {/* Architectural CAD Floorplan + Wall Attenuation + Virtual Device + Heatmap Overlay */}
            <div
              data-testid="heatmap-floorplan-stage"
              data-simulated={String(simulateActive)}
              data-opacity={String(opacity)}
              className="relative flex w-full max-w-[920px] items-center justify-center transition-transform duration-150"
              style={{ transform: `scale(${heatZoom})` }}
            >
              <svg
                viewBox="0 0 880 460"
                className="h-auto w-full max-h-[500px] select-none"
                role="img"
                aria-label={`${activeFloor.name} architectural floorplan`}
              >
                <defs>
                  <radialGradient id="omada-wifi-heatmap-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--omada-color-error)" stopOpacity="0.62" />
                    <stop offset="28%" stopColor="var(--omada-color-warning)" stopOpacity="0.52" />
                    <stop offset="56%" stopColor="var(--omada-color-warning-minor)" stopOpacity="0.42" />
                    <stop offset="82%" stopColor="var(--omada-brand)" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="var(--omada-brand)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Floorplan & Simulation Layer controlled by Opacity slider */}
                <g style={{ opacity: opacity / 100 }}>
                  {/* Simulated Radial Wi-Fi Coverage Heatmap Overlay */}
                  {simulateActive && (
                    <g data-testid="heatmap-coverage-overlay">
                      <ellipse
                        cx={activeFloor.virtualDevice.x + 150}
                        cy={activeFloor.virtualDevice.y + 62}
                        rx={260 * bandRadiusScale}
                        ry={170 * bandRadiusScale}
                        fill="url(#omada-wifi-heatmap-grad)"
                      />
                      <circle
                        cx={activeFloor.virtualDevice.x}
                        cy={activeFloor.virtualDevice.y}
                        r={190 * bandRadiusScale}
                        fill="url(#omada-wifi-heatmap-grad)"
                      />
                      {activeFloor.extraAps?.map((ap) => (
                        <circle
                          key={ap.id}
                          cx={ap.x}
                          cy={ap.y}
                          r={160 * bandRadiusScale}
                          fill="url(#omada-wifi-heatmap-grad)"
                        />
                      ))}
                    </g>
                  )}

                  {/* Wall-Attenuation Red & Black Sample Lines (Top-Left above floorplan) */}
                  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <polyline
                      points="226,158 244,142 290,164 290,180"
                      stroke="var(--omada-map-cad-atten)"
                      strokeWidth="1.35"
                    />
                    <polyline
                      points="218,162 236,149 282,171 282,184"
                      stroke="var(--omada-map-cad-atten)"
                      strokeWidth="0.95"
                      opacity="0.7"
                    />
                    <polyline
                      points="300,174 312,158 322,163 340,147 345,162"
                      stroke="var(--omada-map-cad-wall)"
                      strokeWidth="1.3"
                    />
                  </g>

                  {/* CAD Architectural Office Floorplan */}
                  <g transform={activeFloor.id === 'floor-2' ? 'translate(16, 8) scale(0.96)' : undefined}>
                    {/* Exterior Perimeter Walls */}
                    <path
                      d="M 272 200 L 796 200 L 796 426 L 696 426 L 696 376 L 328 376 L 328 334 L 272 334 Z"
                      fill="none"
                      stroke="var(--omada-map-cad-wall)"
                      strokeWidth="2.4"
                      strokeLinejoin="miter"
                    />

                    {/* Left Pod Interior Wall & Desks */}
                    <line
                      x1="328"
                      y1="200"
                      x2="328"
                      y2="334"
                      stroke="var(--omada-map-cad-wall)"
                      strokeWidth="1.6"
                    />
                    {/* Left Pod Desks (3 pairs) */}
                    <g fill="none" stroke="var(--omada-map-cad-furniture)" strokeWidth="0.9">
                      {[214, 248, 282].map((y) => (
                        <g key={y}>
                          <rect x="282" y={y} width="16" height="20" />
                          <rect x="304" y={y} width="16" height="20" />
                          <circle cx="286" cy={y + 10} r="2.2" />
                          <circle cx="316" cy={y + 10} r="2.2" />
                        </g>
                      ))}
                    </g>

                    {/* Top Row Room Partitions (y=200..250) */}
                    <line x1="328" y1="250" x2="660" y2="250" stroke="var(--omada-map-cad-wall)" strokeWidth="1.8" />
                    <line x1="392" y1="200" x2="392" y2="250" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="454" y1="200" x2="454" y2="250" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="494" y1="200" x2="494" y2="250" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="548" y1="200" x2="548" y2="250" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="582" y1="200" x2="582" y2="250" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="654" y1="200" x2="654" y2="250" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="696" y1="200" x2="696" y2="376" stroke="var(--omada-map-cad-wall)" strokeWidth="2.0" />

                    {/* Top Row CAD Furniture (Reception, Conference, Foyer, Oval Boardroom, Stairs, Lounge, Office) */}
                    <g fill="none" stroke="var(--omada-map-cad-furniture)" strokeWidth="0.9">
                      {/* Room 1: Vertical desk */}
                      <rect x="336" y="210" width="12" height="28" />
                      <rect x="366" y="210" width="16" height="28" />
                      {/* Room 2: Conference table + 6 chairs */}
                      <rect x="414" y="208" width="20" height="34" rx="2" />
                      {[214, 224, 234].map((cy) => (
                        <g key={cy}>
                          <circle cx="409" cy={cy} r="2.2" />
                          <circle cx="439" cy={cy} r="2.2" />
                        </g>
                      ))}
                      {/* Room 3: Lobby shaft */}
                      <rect x="466" y="208" width="16" height="20" />
                      {/* Room 4: Oval boardroom */}
                      <ellipse cx="521" cy="224" rx="12" ry="16" />
                      {[212, 220, 228, 236].map((cy) => (
                        <g key={cy}>
                          <circle cx="505" cy={cy} r="2" />
                          <circle cx="537" cy={cy} r="2" />
                        </g>
                      ))}
                      {/* Room 5: Staircase treads */}
                      {[206, 211, 216, 221, 226, 231, 236, 241, 246].map((sy) => (
                        <line key={sy} x1="552" y1={sy} x2="578" y2={sy} stroke="var(--omada-map-cad-door)" strokeWidth="0.8" />
                      ))}
                      {/* Room 6: Executive Lounge */}
                      <rect x="606" y="212" width="38" height="26" />
                      <rect x="612" y="217" width="26" height="16" />
                      {/* Room 7: Private Office */}
                      <rect x="664" y="208" width="22" height="14" />
                      <rect x="668" y="226" width="14" height="16" />
                    </g>

                    {/* Door Swing Arcs */}
                    <g fill="none" stroke="var(--omada-map-cad-door)" strokeWidth="0.8">
                      <path d="M 454 250 A 14 14 0 0 1 468 236" />
                      <path d="M 494 250 A 14 14 0 0 0 480 236" />
                      <path d="M 654 268 A 14 14 0 0 1 640 282" />
                      <path d="M 526 334 A 14 14 0 0 1 540 320" />
                      <path d="M 632 334 A 14 14 0 0 1 646 320" />
                    </g>

                    {/* Open Bullpen Desks & Collab Tables (Middle Zone) */}
                    <g fill="none" stroke="var(--omada-map-cad-furniture)" strokeWidth="0.9">
                      {/* 2 Collab clusters on left */}
                      {[274, 304].map((cy) => (
                        <g key={cy}>
                          <rect x="348" y={cy - 7} width="14" height="14" rx="2" />
                          <circle cx="343" cy={cy} r="2.2" />
                          <circle cx="367" cy={cy} r="2.2" />
                          <rect x="378" y={cy - 7} width="14" height="14" rx="2" />
                          <circle cx="373" cy={cy} r="2.2" />
                          <circle cx="397" cy={cy} r="2.2" />
                        </g>
                      ))}

                      {/* 4 Banks of Back-to-Back Desks */}
                      {[416, 464, 512, 560].map((bx) => (
                        <g key={bx}>
                          <rect x={bx} y="266" width="22" height="48" />
                          <line x1={bx + 11} y1="266" x2={bx + 11} y2="314" />
                          {[274, 290, 306].map((cy) => (
                            <g key={cy}>
                              <line x1={bx} y1={cy + 8} x2={bx + 22} y2={cy + 8} />
                              <circle cx={bx - 5} cy={cy} r="2.2" />
                              <circle cx={bx + 27} cy={cy} r="2.2" />
                            </g>
                          ))}
                        </g>
                      ))}

                      {/* Reception / Print Station near right corridor */}
                      <rect x="668" y="280" width="12" height="36" />
                    </g>

                    {/* Bottom Row Rooms (y=334..376) */}
                    <line x1="328" y1="334" x2="696" y2="334" stroke="var(--omada-map-cad-wall)" strokeWidth="1.8" />
                    <line x1="392" y1="334" x2="392" y2="376" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="454" y1="334" x2="454" y2="376" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="590" y1="334" x2="590" y2="376" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="636" y1="334" x2="636" y2="376" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />

                    {/* Bottom Row Furniture */}
                    <g fill="none" stroke="var(--omada-map-cad-furniture)" strokeWidth="0.9">
                      {/* Bottom-left corner room */}
                      <rect x="342" y="346" width="34" height="18" />
                      {/* Conference room */}
                      <rect x="408" y="344" width="30" height="22" />
                      {/* Kitchenette / Breakroom */}
                      <rect x="478" y="344" width="22" height="16" />
                      <rect x="546" y="344" width="22" height="16" />
                      <rect x="524" y="366" width="38" height="8" />
                      {/* Restrooms */}
                      {[600, 616, 646, 662, 678].map((sx) => (
                        <g key={sx}>
                          <line x1={sx} y1="358" x2={sx} y2="376" />
                          <circle cx={sx + 7} cy="368" r="2.5" />
                        </g>
                      ))}
                    </g>

                    {/* Right Executive Wing & Twin Elevators (x=696..796, y=200..426) */}
                    <g fill="none" stroke="var(--omada-map-cad-furniture)" strokeWidth="0.9">
                      {/* Top executive workstations */}
                      {[712, 738, 764].map((wx) => (
                        <rect key={wx} x={wx} y="208" width="18" height="12" />
                      ))}
                      {/* Executive Suite Lounge Rug & Seating */}
                      <rect x="708" y="238" width="44" height="44" />
                      <rect x="716" y="246" width="28" height="28" />
                      {/* Side Workstation Pods */}
                      {[238, 256, 274, 292].map((wy) => (
                        <rect key={wy} x="768" y={wy} width="18" height="12" />
                      ))}
                    </g>

                    {/* Twin Elevator Core at Bottom-Right */}
                    <line x1="744" y1="340" x2="796" y2="340" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="744" y1="340" x2="744" y2="426" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <line x1="744" y1="383" x2="796" y2="383" stroke="var(--omada-map-cad-wall)" strokeWidth="1.6" />
                    <g fill="none" stroke="var(--omada-map-cad-door)" strokeWidth="1">
                      <rect x="760" y="352" width="20" height="20" rx="1" />
                      <path d="M 767 366 V 358 M 767 358 L 764 361 M 767 358 L 770 361 M 773 358 V 366 M 773 366 L 770 363 M 773 366 L 776 363" />
                      <rect x="760" y="395" width="20" height="20" rx="1" />
                      <path d="M 767 409 V 401 M 767 401 L 764 404 M 767 401 L 770 404 M 773 401 V 409 M 773 409 L 770 406 M 773 409 L 776 406" />
                    </g>

                    {/* Warehouse / Floor_2 Variant Visual Overlay */}
                    {activeFloor.id === 'warehouse' && (
                      <g fill="none" stroke="var(--omada-map-cad-atten)" strokeWidth="1" strokeDasharray="4 4">
                        <rect x="344" y="256" width="290" height="72" />
                      </g>
                    )}
                  </g>
                </g>

                {/* Virtual Device Marker & Pill (scaled cleanly by Icon Size Select) */}
                <g
                  transform={`translate(${activeFloor.virtualDevice.x}, ${activeFloor.virtualDevice.y}) scale(${apBadgeScale})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    notification.info({
                      title: activeFloor.virtualDevice.label,
                      description: `Simulated AP (${activeBand}) · Click Simulate to toggle RF heatmap.`,
                    })
                  }
                >
                  <circle cx="0" cy="-14" r="22" fill="var(--omada-map-virtual-halo)" />
                  <circle cx="0" cy="-14" r="15" fill="var(--omada-map-virtual-badge)" />
                  {/* AP Device Square Glyph inside circle */}
                  <rect
                    x="-7"
                    y="-21"
                    width="14"
                    height="14"
                    rx="3"
                    fill="var(--omada-bg-surface)"
                    opacity="0.95"
                  />
                  <circle cx="0" cy="-14" r="2.2" fill="var(--omada-map-virtual-badge)" />
                  {/* Dark Navy Pill */}
                  <rect
                    x="-76"
                    y="12"
                    width="152"
                    height="32"
                    rx="5"
                    fill="var(--omada-map-virtual-pill)"
                  />
                  <text
                    x="0"
                    y="33"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="500"
                    fill="var(--omada-text-inverse)"
                    style={{ fontFamily: 'var(--omada-font-sans)' }}
                  >
                    {activeFloor.virtualDevice.label}
                  </text>
                </g>

                {/* Extra AP Markers for Floor_2 */}
                {activeFloor.extraAps?.map((ap) => (
                  <g
                    key={ap.id}
                    transform={`translate(${ap.x}, ${ap.y}) scale(${apBadgeScale})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenDeviceByName?.(ap.label)}
                  >
                    <circle cx="0" cy="-10" r="18" fill="var(--omada-map-pin-halo)" />
                    <circle cx="0" cy="-10" r="11" fill="var(--omada-brand)" />
                    <rect
                      x="-58"
                      y="12"
                      width="116"
                      height="24"
                      rx="4"
                      fill="var(--omada-map-virtual-pill)"
                    />
                    <text
                      x="0"
                      y="28"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="500"
                      fill="var(--omada-text-inverse)"
                    >
                      {ap.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Signal Strength Legend when Simulate is ON */}
            {simulateActive && (
              <div
                data-testid="heatmap-signal-legend"
                className="omada-map-floating-card absolute bottom-4 left-6 z-20 flex items-center gap-3 rounded-[6px] px-3 py-2 text-[12px]"
              >
                <span className="font-medium text-[var(--omada-text-primary)]">
                  {activeBand} Signal:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="tabular-nums text-[var(--omada-text-secondary)]">-30 dBm</span>
                  <span
                    className="h-2 w-28 rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, var(--omada-color-error), var(--omada-color-warning), var(--omada-color-warning-minor), var(--omada-brand))',
                    }}
                  />
                  <span className="tabular-nums text-[var(--omada-text-secondary)]">-85 dBm</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ====================================================================
         * TAB 2: DEVICE MAP
         * ==================================================================== */
        <div
          data-testid="device-map-panel"
          onPointerDown={handleMapPointerDown}
          onPointerMove={handleMapPointerMove}
          onPointerUp={handleMapPointerUp}
          onPointerLeave={handleMapPointerUp}
          className="relative flex-1 select-none overflow-hidden"
          style={{
            backgroundColor: 'var(--omada-map-land-bg)',
            cursor: mapDragRef.current.active ? 'grabbing' : 'grab',
          }}
        >
          {/* Zoomable & Pannable Regional Vector Map + Coordinates-Locked Pins */}
          <div
            className="relative h-full w-full min-h-[620px] transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${devicePan.x}px, ${devicePan.y}px) scale(${deviceZoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Monochrome West Africa Vector Map SVG */}
            <svg
              viewBox="0 0 1000 720"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              role="img"
              aria-label="Regional Device Map"
            >
              <rect x="0" y="0" width="1000" height="720" fill="var(--omada-map-land-bg)" />

              {/* Subtle Niger River Stroke */}
              <path
                d={NIGER_RIVER_PATH}
                fill="none"
                stroke="var(--omada-map-water-stroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Subtle Regional/Province Boundaries */}
              <g fill="none" stroke="var(--omada-map-border-region)" strokeWidth="1.1">
                {WEST_AFRICA_REGION_BORDERS.map((d, idx) => (
                  <path key={idx} d={d} />
                ))}
              </g>

              {/* Country Boundaries */}
              <g fill="none" stroke="var(--omada-map-border-country)" strokeWidth="2.4">
                {WEST_AFRICA_COUNTRY_BORDERS.map((d, idx) => (
                  <path key={idx} d={d} strokeLinejoin="round" />
                ))}
              </g>

              {/* Subtle Geographic Country & City Labels */}
              {WEST_AFRICA_LABELS.map((lbl) => {
                const lines = lbl.text.split('\n');
                return (
                  <text
                    key={`${lbl.text}-${lbl.x}`}
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor="middle"
                    fontSize={lbl.kind === 'country' ? 18 : 10.5}
                    fontWeight={lbl.kind === 'country' ? 500 : 400}
                    fill={
                      lbl.kind === 'country'
                        ? 'var(--omada-map-label-country)'
                        : 'var(--omada-map-label-city)'
                    }
                    style={{ fontFamily: 'var(--omada-font-sans)' }}
                  >
                    {lines.map((line, i) => (
                      <tspan key={i} x={lbl.x} dy={i === 0 ? 0 : 11}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                );
              })}
            </svg>

            {/* Green-Halo Device Pins */}
            {pins.map((pin) => {
              const isDimmed = matchingPinKeys !== null && !matchingPinKeys.has(pin.key);
              const isHighlighted = matchingPinKeys !== null && matchingPinKeys.has(pin.key);

              return (
                <button
                  key={pin.key}
                  type="button"
                  data-testid={`device-map-pin-${pin.key}`}
                  data-highlighted={String(isHighlighted)}
                  onClick={() => onOpenDeviceByName?.(pin.name)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = e.currentTarget.offsetParent?.getBoundingClientRect();
                    const relX = rect ? e.clientX - rect.left : pin.x;
                    const relY = rect ? e.clientY - rect.top : pin.y;
                    setContextMenu({ pin, x: relX, y: relY });
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-center transition-opacity ${
                    isDimmed ? 'opacity-25' : 'opacity-100'
                  }`}
                  style={{
                    left: `${(pin.x / 1000) * 100}%`,
                    top: `${(pin.y / 720) * 100}%`,
                  }}
                >
                  <div className="relative mx-auto flex h-[48px] w-[48px] items-center justify-center">
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: 'var(--omada-map-pin-halo)',
                        boxShadow: isHighlighted
                          ? '0 0 0 3px var(--omada-brand)'
                          : undefined,
                      }}
                    />
                    <span
                      className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 bg-[var(--omada-bg-surface)] shadow-xs"
                      style={{ borderColor: 'var(--omada-map-pin-ring)' }}
                    >
                      <SProductImage name={pin.productSlug} size={24} alt={pin.name} />
                    </span>
                  </div>
                  <div className="omada-device-map-pin-label mt-0.5 whitespace-nowrap text-[12px] font-medium leading-[16px] text-[var(--omada-text-primary)]">
                    {pin.name}
                  </div>
                </button>
              );
            })}

            {/* Green Cluster Circle (2) */}
            <Popover
              open={clusterOpen}
              onOpenChange={setClusterOpen}
              trigger="click"
              placement="right"
              content={
                <div className="w-[220px] space-y-1.5" data-testid="device-map-cluster-popover">
                  <div className="text-[12px] font-semibold text-[var(--omada-text-primary)]">
                    Clustered Devices ({DEVICE_MAP_CLUSTER.count})
                  </div>
                  {DEVICE_MAP_CLUSTER.devices.map((dev) => (
                    <button
                      key={dev.key}
                      type="button"
                      onClick={() => {
                        setClusterOpen(false);
                        onOpenDeviceByName?.(dev.name);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-[4px] border-0 bg-transparent px-2 py-1.5 text-left hover:bg-[var(--omada-bg-field)]"
                    >
                      <SProductImage name={dev.productSlug} size={22} alt={dev.name} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-medium text-[var(--omada-text-primary)]">
                          {dev.name}
                        </div>
                        <div className="truncate text-[11px] text-[var(--omada-text-tertiary)]">
                          {dev.model}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              }
            >
              <button
                type="button"
                aria-label={`Cluster of ${DEVICE_MAP_CLUSTER.count} devices`}
                data-testid="device-map-cluster-badge"
                className="absolute flex h-[40px] w-[40px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 p-0"
                style={{
                  left: `${(DEVICE_MAP_CLUSTER.x / 1000) * 100}%`,
                  top: `${(DEVICE_MAP_CLUSTER.y / 720) * 100}%`,
                  backgroundColor: 'var(--omada-map-pin-halo)',
                }}
              >
                <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--omada-brand-active)] text-[13px] font-semibold text-white shadow-xs">
                  {DEVICE_MAP_CLUSTER.count}
                </span>
              </button>
            </Popover>
          </div>

          {/* Floating Top-Left Search Bar + List Button */}
          <div className="absolute top-4 left-5 z-20 flex flex-col items-start gap-2.5">
            <div className="omada-map-floating-card flex h-[38px] items-center rounded-[4px] px-1">
              <SSelect
                aria-label="Map search scope"
                variant="borderless"
                value={searchScope}
                onChange={(v) => setSearchScope(v as 'device' | 'site' | 'location')}
                className="omada-device-map-search-select w-[108px]"
                options={[
                  { value: 'device', label: 'Device' },
                  { value: 'site', label: 'Site' },
                  { value: 'location', label: 'Location' },
                ]}
              />
              <span className="mx-1 h-4 w-px bg-[var(--omada-border-divider)]" aria-hidden="true" />
              <SInput
                variant="borderless"
                allowClear
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                placeholder="Search Device Name"
                aria-label="Search Device Name"
                className="!w-[235px] !bg-transparent"
                suffix={
                  <SIcon name="input-search" size={14} className="text-[var(--omada-text-tertiary)]" />
                }
              />
            </div>

            <Popover
              open={deviceListOpen}
              onOpenChange={setDeviceListOpen}
              trigger="click"
              placement="bottomLeft"
              content={
                <div className="w-[260px] space-y-1.5" data-testid="device-map-list-popover">
                  <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--omada-text-primary)]">
                    <span>Mapped Devices ({pins.length + DEVICE_MAP_CLUSTER.count})</span>
                  </div>
                  <div className="max-h-[260px] space-y-1 overflow-y-auto">
                    {pins.map((pin) => (
                      <button
                        key={pin.key}
                        type="button"
                        onClick={() => {
                          setDeviceListOpen(false);
                          onOpenDeviceByName?.(pin.name);
                        }}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-[4px] border-0 bg-transparent px-2 py-1.5 text-left hover:bg-[var(--omada-bg-field)]"
                      >
                        <SProductImage name={pin.productSlug} size={22} alt={pin.name} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-medium text-[var(--omada-text-primary)]">
                            {pin.name}
                          </div>
                          <div className="truncate text-[11px] text-[var(--omada-text-tertiary)]">
                            {pin.locationLabel}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              }
            >
              <button
                type="button"
                aria-label="Device map list"
                data-testid="device-map-list-btn"
                className="omada-map-floating-card flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-primary)] hover:text-[var(--omada-brand-text)]"
              >
                <SIcon name="list" size={16} />
              </button>
            </Popover>
          </div>

          {/* Floating Top-Right Zoom & Recenter Stack (positioned left of <|| quick-drawer handle) */}
          <div className="absolute top-4 right-12 z-20 flex flex-col gap-2.5">
            <div className="omada-map-floating-card flex w-[32px] flex-col overflow-hidden rounded-[4px]">
              <button
                type="button"
                aria-label="Zoom in device map"
                data-testid="device-map-zoom-in-btn"
                onClick={() => setDeviceZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
                className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center border-0 border-b border-[var(--omada-border-divider)] bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-brand-text)]"
              >
                <Plus size={15} />
              </button>
              <button
                type="button"
                aria-label="Zoom out device map"
                data-testid="device-map-zoom-out-btn"
                onClick={() => setDeviceZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
                className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center border-0 bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-brand-text)]"
              >
                <Minus size={15} />
              </button>
            </div>

            <button
              type="button"
              aria-label="Recenter device map"
              data-testid="device-map-recenter-btn"
              onClick={() => {
                setDeviceZoom(1);
                setDevicePan({ x: 0, y: 0 });
              }}
              className="omada-map-floating-card flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-secondary)] hover:text-[var(--omada-brand-text)]"
            >
              <Crosshair size={15} />
            </button>
          </div>

          {/* Right-Click Context Menu for Pins */}
          {contextMenu && (
            <div
              data-testid="device-map-context-menu"
              className="omada-map-floating-card absolute z-30 w-[184px] rounded-[6px] py-1"
              style={{ left: Math.min(contextMenu.x, 760), top: Math.min(contextMenu.y, 460) }}
            >
              <button
                type="button"
                onClick={() => {
                  onOpenDeviceByName?.(contextMenu.pin.name);
                  setContextMenu(null);
                }}
                className="flex w-full cursor-pointer items-center border-0 bg-transparent px-3 py-1.5 text-left text-[12px] text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]"
              >
                View Device Details
              </button>
              <button
                type="button"
                onClick={() => {
                  notification.info({
                    title: 'Edit Device Location',
                    description: `Drag ${contextMenu.pin.name} or enter GPS coordinates.`,
                  });
                  setContextMenu(null);
                }}
                className="flex w-full cursor-pointer items-center border-0 bg-transparent px-3 py-1.5 text-left text-[12px] text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]"
              >
                Edit Location
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = contextMenu.pin;
                  setPins((prev) => prev.filter((p) => p.key !== target.key));
                  setContextMenu(null);
                  notification.warning({
                    title: 'Removed from Map',
                    description: `${target.name} was unplaced from Device Map.`,
                  });
                }}
                className="flex w-full cursor-pointer items-center border-0 bg-transparent px-3 py-1.5 text-left text-[12px] text-[var(--omada-color-error)] hover:bg-[var(--omada-bg-field)]"
              >
                Remove from Map
              </button>
            </div>
          )}

          {/* Bottom-Right Dismissible Tip Card */}
          {!tipDismissed && (
            <div
              data-testid="device-map-tip-card"
              className="omada-map-floating-card absolute right-5 bottom-8 z-20 flex max-w-[388px] items-start gap-3 rounded-[6px] px-4 py-3.5"
            >
              <Info
                size={18}
                className="mt-0.5 shrink-0 text-[var(--omada-link)]"
                aria-hidden="true"
              />
              <span className="text-[13px] leading-[19px] text-[var(--omada-text-primary)]">
                Right-click a device icon to edit location or remove it from the map.
              </span>
              <button
                type="button"
                aria-label="Dismiss tip"
                data-testid="device-map-tip-close"
                onClick={() => setTipDismissed(true)}
                className="ml-1 flex h-[20px] w-[20px] shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--omada-text-tertiary)] hover:text-[var(--omada-text-primary)]"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Bottom-Right Attribution */}
          <div className="pointer-events-none absolute right-4 bottom-1.5 z-10 text-[11px] text-[var(--omada-text-secondary)]">
            © Mapbox © OpenStreetMap <span className="font-medium">Improve this map</span>
          </div>
        </div>
      )}

      {/* Add Floorplan Modal */}
      <SModal
        size="sm"
        title="Add Floorplan"
        open={addFloorOpen}
        onCancel={() => setAddFloorOpen(false)}
        onOk={handleAddFloor}
        okText="Add"
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="Map Name">
            <SInput
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              placeholder="e.g. Map_2"
            />
          </Form.Item>
        </Form>
      </SModal>

      {/* Heat Map Settings Modal */}
      <SModal
        size="sm"
        title="Heat Map Simulation Settings"
        open={settingsModalOpen}
        onCancel={() => setSettingsModalOpen(false)}
        onOk={() => setSettingsModalOpen(false)}
        okText="Apply"
        destroyOnHidden
      >
        <div className="space-y-3 text-[13px] text-[var(--omada-text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Wall Attenuation (Drywall)</span>
            <span className="tabular-nums font-medium text-[var(--omada-text-primary)]">
              {wallAttenuationDb} dB
            </span>
          </div>
          <SSlider
            min={2}
            max={16}
            step={1}
            value={wallAttenuationDb}
            onChange={(v) => setWallAttenuationDb(typeof v === 'number' ? v : 6)}
          />
          <div className="text-[12px] text-[var(--omada-text-tertiary)]">
            Active floorplan: {activeFloor.name} ({activeFloor.dimensionsLabel})
          </div>
        </div>
      </SModal>
    </div>
  );
};
