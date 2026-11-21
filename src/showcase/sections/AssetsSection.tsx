import React, { useMemo, useState } from 'react';
import {
  OMADA_BRAND_ASSETS,
  OMADA_CLIENTS,
  OMADA_ICONS,
  OMADA_ICON_CATEGORIES,
  OMADA_ILLUSTRATIONS,
  OMADA_PRODUCTS,
  SBrandAsset,
  SCard,
  SClientIcon,
  SEmpty,
  SIcon,
  SIllustration,
  SPageHeader,
  SProductImage,
  SSearchInput,
  STabs,
  STag,
  useOmadaFeedback,
  type OmadaAssetMeta,
  type OmadaBrandAssetName,
  type OmadaClientIconName,
  type OmadaIllustrationName,
  type OmadaProductName,
} from '@/omada';

type AssetTabKey = 'icons' | 'illustrations' | 'clients' | 'products' | 'brand';

interface GroupedAssetEntry {
  name: string;
  figmaName: string;
  category: string;
  hasLight: boolean;
  hasDark: boolean;
  width: number;
  height: number;
}

const WHITE_SWATCH_ICONS = new Set([
  'add-add',
  'back-back',
  'disconnect',
  'import-import',
  'loading-loading',
  'loading-icon-loading-white',
  'shop-shop',
]);

const LIGHT_SWATCH_BRAND_ASSETS = new Set([
  'omada-pro',
  'login-card-sidebar-about',
  'left-aligned-en-mode-light',
]);

function groupThemedAssets(entries: readonly OmadaAssetMeta[]): GroupedAssetEntry[] {
  const map = new Map<string, GroupedAssetEntry>();
  for (const item of entries) {
    const existing = map.get(item.name);
    if (existing) {
      if (item.theme === 'light') existing.hasLight = true;
      if (item.theme === 'dark') existing.hasDark = true;
    } else {
      map.set(item.name, {
        name: item.name,
        figmaName: item.figmaName,
        category: item.category,
        hasLight: item.theme === 'light',
        hasDark: item.theme === 'dark',
        width: item.width,
        height: item.height,
      });
    }
  }
  return Array.from(map.values());
}

const GROUPED_ILLUSTRATIONS = groupThemedAssets(OMADA_ILLUSTRATIONS);
const GROUPED_CLIENTS = groupThemedAssets(OMADA_CLIENTS);
const GROUPED_PRODUCTS = groupThemedAssets(OMADA_PRODUCTS);

function getVariantBadge(item: GroupedAssetEntry): { label: string; color: 'green' | 'blue' | 'purple' } {
  if (item.hasLight && item.hasDark) return { label: 'L+D', color: 'green' };
  if (item.hasDark) return { label: 'Dark', color: 'purple' };
  return { label: 'Light', color: 'blue' };
}

export const AssetsSection: React.FC = () => {
  const { toast } = useOmadaFeedback();
  const [activeTab, setActiveTab] = useState<AssetTabKey>('icons');
  const [search, setSearch] = useState('');
  const [iconCategory, setIconCategory] = useState<string>('all');

  const query = search.trim().toLowerCase();

  const filteredIcons = useMemo(() => {
    return OMADA_ICONS.filter((icon) => {
      if (iconCategory !== 'all' && icon.category !== iconCategory) return false;
      if (!query) return true;
      return (
        icon.name.toLowerCase().includes(query) ||
        icon.figmaName.toLowerCase().includes(query) ||
        icon.category.toLowerCase().includes(query)
      );
    });
  }, [iconCategory, query]);

  const filteredIllustrations = useMemo(() => {
    if (!query) return GROUPED_ILLUSTRATIONS;
    return GROUPED_ILLUSTRATIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.figmaName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [query]);

  const filteredClients = useMemo(() => {
    if (!query) return GROUPED_CLIENTS;
    return GROUPED_CLIENTS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.figmaName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [query]);

  const filteredProducts = useMemo(() => {
    if (!query) return GROUPED_PRODUCTS;
    return GROUPED_PRODUCTS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.figmaName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [query]);

  const filteredBrand = useMemo(() => {
    if (!query) return OMADA_BRAND_ASSETS;
    return OMADA_BRAND_ASSETS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.figmaName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [query]);

  const copySnippet = async (jsxSnippet: string) => {
    try {
      await navigator.clipboard?.writeText(jsxSnippet);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
    toast.success(`Copied ${jsxSnippet}`);
  };

  return (
    <div className="space-y-4">
      <SPageHeader
        title="Icons & Assets"
        description="Complete Figma asset library (998 SVG/PNG files): click any card to copy its typed JSX snippet, or toggle Dark Mode in the Top Bar to preview live Light/Dark asset switching."
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <STag color="green" variant="subtle">
              586 Icons
            </STag>
            <STag color="blue" variant="subtle">
              199 Illustrations
            </STag>
            <STag color="purple" variant="subtle">
              99 Clients · 105 Products · 9 Brand
            </STag>
          </div>
        }
      />

      <SCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <STabs
            variant="capsule"
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as AssetTabKey)}
            items={[
              { key: 'icons', label: `Icons (${OMADA_ICONS.length})` },
              { key: 'illustrations', label: `Illustrations (${GROUPED_ILLUSTRATIONS.length})` },
              { key: 'clients', label: `Clients (${GROUPED_CLIENTS.length})` },
              { key: 'products', label: `Products (${GROUPED_PRODUCTS.length})` },
              { key: 'brand', label: `Brand (${OMADA_BRAND_ASSETS.length})` },
            ]}
          />
          <SSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search slug or Figma name..."
          />
        </div>

        {/* Icons Category Filter Strip */}
        {activeTab === 'icons' && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-[var(--omada-border-divider)] pb-3">
            <button
              type="button"
              onClick={() => setIconCategory('all')}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                iconCategory === 'all'
                  ? 'bg-[var(--omada-brand)] text-white'
                  : 'bg-[var(--omada-bg-field)] text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
              }`}
            >
              All ({OMADA_ICONS.length})
            </button>
            {OMADA_ICON_CATEGORIES.map((category) => {
              const isSelected = iconCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setIconCategory(category)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[var(--omada-brand)] text-white'
                      : 'bg-[var(--omada-bg-field)] text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {/* Icons Grid */}
        {activeTab === 'icons' &&
          (filteredIcons.length === 0 ? (
            <SEmpty
              illustration="no-search"
              title="No matching icons"
              description={`No icons matched "${search}". Try clearing the search filter or choosing All categories.`}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {filteredIcons.map((icon) => {
                const useDarkTealSwatch =
                  icon.category === 'topbar' || WHITE_SWATCH_ICONS.has(icon.name);
                return (
                  <button
                    key={icon.name}
                    type="button"
                    title={`${icon.figmaName} (${icon.category}) — click to copy`}
                    onClick={() => void copySnippet(`<SIcon name="${icon.name}" size={20} />`)}
                    className="group flex cursor-pointer flex-col items-center gap-2 rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-2.5 text-center transition-colors hover:border-[var(--omada-brand)]"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded ${
                        useDarkTealSwatch
                          ? 'bg-[#037D68] text-white'
                          : 'bg-[var(--omada-bg-field)] text-[var(--omada-text-primary)] group-hover:text-[var(--omada-brand-text)]'
                      }`}
                    >
                      <SIcon name={icon.name} size={22} />
                    </span>
                    <span className="w-full truncate font-mono text-[11px] text-[var(--omada-text-primary)]">
                      {icon.name}
                    </span>
                    <span className="text-[10px] text-[var(--omada-text-tertiary)]">
                      {icon.category} · {icon.monochrome ? 'mono' : 'color'}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

        {/* Illustrations Grid */}
        {activeTab === 'illustrations' &&
          (filteredIllustrations.length === 0 ? (
            <SEmpty
              illustration="no-search"
              title="No matching illustrations"
              description={`No illustrations matched "${search}".`}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredIllustrations.map((item) => {
                const badge = getVariantBadge(item);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() =>
                      void copySnippet(`<SIllustration name="${item.name}" width={180} />`)
                    }
                    className="flex cursor-pointer flex-col justify-between rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-3 text-left transition-colors hover:border-[var(--omada-brand)]"
                  >
                    <div className="mb-2 flex h-32 w-full items-center justify-center rounded bg-[var(--omada-bg-field)] p-2">
                      <SIllustration
                        name={item.name as OmadaIllustrationName}
                        width={160}
                        className="max-h-28 w-auto object-contain"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-mono text-xs font-medium text-[var(--omada-text-primary)]">
                          {item.name}
                        </div>
                        <div className="truncate text-[11px] text-[var(--omada-text-tertiary)]">
                          {item.figmaName}
                        </div>
                      </div>
                      <STag color={badge.color} variant="subtle">
                        {badge.label}
                      </STag>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

        {/* Clients Grid */}
        {activeTab === 'clients' &&
          (filteredClients.length === 0 ? (
            <SEmpty
              illustration="no-clients"
              title="No matching client icons"
              description={`No client icons matched "${search}".`}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {filteredClients.map((item) => {
                const badge = getVariantBadge(item);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() =>
                      void copySnippet(`<SClientIcon name="${item.name}" size={28} />`)
                    }
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-2.5 text-center transition-colors hover:border-[var(--omada-brand)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-[var(--omada-bg-field)]">
                      <SClientIcon name={item.name as OmadaClientIconName} size={32} />
                    </div>
                    <div className="w-full truncate font-mono text-[11px] text-[var(--omada-text-primary)]">
                      {item.name}
                    </div>
                    <STag color={badge.color} variant="subtle">
                      {badge.label}
                    </STag>
                  </button>
                );
              })}
            </div>
          ))}

        {/* Products Grid */}
        {activeTab === 'products' &&
          (filteredProducts.length === 0 ? (
            <SEmpty
              illustration="no-devices"
              title="No matching products"
              description={`No product images matched "${search}".`}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
              {filteredProducts.map((item) => {
                const badge = getVariantBadge(item);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() =>
                      void copySnippet(`<SProductImage name="${item.name}" size={40} />`)
                    }
                    className="flex cursor-pointer flex-col justify-between rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-3 text-left transition-colors hover:border-[var(--omada-brand)]"
                  >
                    <div className="mb-2 flex h-20 w-full items-center justify-center rounded bg-[var(--omada-bg-field)] p-2">
                      <SProductImage name={item.name as OmadaProductName} size={56} />
                    </div>
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="truncate font-mono text-[11px] font-medium text-[var(--omada-text-primary)]">
                          {item.name}
                        </div>
                        <div className="truncate text-[10px] text-[var(--omada-text-tertiary)]">
                          {item.category}
                        </div>
                      </div>
                      <STag color={badge.color} variant="subtle">
                        {badge.label}
                      </STag>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

        {/* Brand Grid */}
        {activeTab === 'brand' &&
          (filteredBrand.length === 0 ? (
            <SEmpty
              illustration="no-search"
              title="No matching brand assets"
              description={`No brand assets matched "${search}".`}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {filteredBrand.map((item) => {
                const swatchBg =
                  item.theme === 'dark'
                    ? 'bg-[#1F1F1F]'
                    : LIGHT_SWATCH_BRAND_ASSETS.has(item.name)
                      ? 'bg-[#F7F7F7]'
                      : 'bg-[#037D68]';
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => void copySnippet(`<SBrandAsset name="${item.name}" />`)}
                    className="flex cursor-pointer flex-col justify-between rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-3 text-left transition-colors hover:border-[var(--omada-brand)]"
                  >
                    <div
                      className={`mb-2.5 flex h-28 w-full items-center justify-center rounded p-3 ${swatchBg}`}
                    >
                      <SBrandAsset
                        name={item.name as OmadaBrandAssetName}
                        height={80}
                        className="max-h-20 w-auto max-w-full"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-mono text-xs font-medium text-[var(--omada-text-primary)]">
                          {item.name}
                        </div>
                        <div className="truncate text-[11px] text-[var(--omada-text-tertiary)]">
                          {item.figmaName} ({item.width}×{item.height})
                        </div>
                      </div>
                      <STag
                        color={item.theme === 'dark' ? 'purple' : 'blue'}
                        variant="subtle"
                      >
                        {item.category}
                      </STag>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
      </SCard>
    </div>
  );
};
