import React, { useState } from 'react';
import { Tooltip } from 'antd';
import {
  SButton,
  SCheckbox,
  SIcon,
  SInput,
  SModal,
  SRadio,
  useOmadaNotification,
} from '@/omada';
import { SAMPLE_RESTORE_FILENAME } from './toolsMaintData';

type ImportMode = 'local' | 'server';
type ExportMode = 'local-file' | 'file-server' | 'local-disk';

/**
 * Omada Controller v6.3.0.34 Maintenance Workspace (`#/maintenance`).
 * Replicates the single-viewport Site Restore & Site Backup configuration screen
 * with local/server import radios, Retain Device Info toggle, sample config picker,
 * translucent disabled Restore state, stacked Backup Contents, and Export targets.
 */
export const MaintenancePage: React.FC = () => {
  const notification = useOmadaNotification();

  // Site Restore state
  const [importMode, setImportMode] = useState<ImportMode>('local');
  const [retainDeviceInfo, setRetainDeviceInfo] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [importServerUrl, setImportServerUrl] = useState<string>('');

  // Site Backup state
  const [backupSettings, setBackupSettings] = useState<boolean>(true);
  const [backupClients, setBackupClients] = useState<boolean>(true);
  const [backupFirmwareLogs, setBackupFirmwareLogs] = useState<boolean>(true);
  const [exportMode, setExportMode] = useState<ExportMode>('local-file');
  const [exportPath, setExportPath] = useState<string>(
    'sftp://192.168.0.50/omada-backups',
  );

  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const canRestore =
    importMode === 'local'
      ? selectedFile.trim().length > 0
      : importServerUrl.trim().length > 0;

  const hasAnyBackupContent =
    backupSettings || backupClients || backupFirmwareLogs;

  const handleBrowseSampleFile = () => {
    setSelectedFile(SAMPLE_RESTORE_FILENAME);
    notification.info({
      title: 'Backup File Selected',
      description: `Loaded ${SAMPLE_RESTORE_FILENAME} (Site: Main Office Floor, v6.3.0.34).`,
    });
  };

  const handleRestore = () => {
    if (!canRestore) return;
    const sourceLabel =
      importMode === 'local' ? selectedFile : importServerUrl.trim();
    notification.success({
      title: 'Site Restore Initiated',
      description: `Restoring site configuration from ${sourceLabel} (${
        retainDeviceInfo ? 'retaining device info' : 'clean device reset'
      }).`,
    });
  };

  const handleExport = () => {
    if (!hasAnyBackupContent) return;
    const parts: string[] = [];
    if (backupSettings) parts.push('Settings');
    if (backupClients) parts.push('Authenticated Clients');
    if (backupFirmwareLogs) parts.push('Firmware Update Logs');

    const targetLabel =
      exportMode === 'local-file'
        ? 'headquarters_main_office_backup_v6.3.cfg'
        : exportMode === 'file-server'
          ? exportPath || 'File Server'
          : '/var/omada/backups/headquarters_main_office_v6.3.cfg';

    if (
      exportMode === 'local-file' &&
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !/jsdom/i.test(navigator.userAgent) &&
      typeof Blob !== 'undefined' &&
      typeof URL.createObjectURL === 'function'
    ) {
      const payload = JSON.stringify(
        {
          controller: 'Omada Controller v6.3.0.34',
          site: 'Main Office Floor',
          exportedAt: '2026-11-21T11:45:00Z',
          contents: parts,
        },
        null,
        2,
      );
      const blob = new Blob([payload], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'headquarters_main_office_backup_v6.3.cfg';
      link.click();
      URL.revokeObjectURL(url);
    }

    notification.success({
      title: 'Site Backup Exported',
      description: `Exported [${parts.join(', ')}] to ${targetLabel}.`,
    });
  };

  return (
    <div
      className="omada-tools-maint-page px-6 pt-5 pb-6"
      data-testid="maintenance-page"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between pr-3">
        <h1 className="m-0 text-[20px] font-medium leading-[28px] text-[var(--omada-text-primary)]">
          Maintenance
        </h1>

        <Tooltip title="Maintenance Help">
          <button
            type="button"
            aria-label="Maintenance help"
            onClick={() => setHelpOpen(true)}
            className="omada-maint-help-btn"
          >
            <SIcon name="question" size={20} />
          </button>
        </Tooltip>
      </div>

      {/* Section 1: Site Restore */}
      <section className="mt-5" aria-labelledby="site-restore-heading">
        <h2
          id="site-restore-heading"
          className="m-0 mb-5 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]"
        >
          Site Restore
        </h2>

        <div className="space-y-4">
          {/* Import Source Radios */}
          <div className="flex flex-wrap items-center gap-y-2">
            <span className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]">
              Import
            </span>
            <SRadio.Group
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as ImportMode)}
              className="flex flex-wrap items-center gap-7"
            >
              <SRadio value="local">Import from Local File</SRadio>
              <SRadio value="server">Import from File Server</SRadio>
            </SRadio.Group>
          </div>

          {/* Retain Device Info */}
          <div className="flex flex-wrap items-center gap-y-2">
            <span className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]">
              Retain Device Info
            </span>
            <div className="inline-flex items-center gap-2">
              <SCheckbox
                checked={retainDeviceInfo}
                onChange={(e) => setRetainDeviceInfo(e.target.checked)}
              >
                Enable
              </SCheckbox>
              <Tooltip title="Keep adopted device configurations and management credentials when restoring site settings.">
                <span
                  role="img"
                  aria-label="Retain Device Info details"
                  className="inline-flex cursor-help items-center"
                >
                  <SIcon name="info" size={16} />
                </span>
              </Tooltip>
            </div>
          </div>

          {/* Restore File Picker or File Server Input */}
          {importMode === 'local' ? (
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="maint-restore-file"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Restore
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <SInput
                  id="maint-restore-file"
                  aria-label="Restore configuration file"
                  variant="filled"
                  readOnly
                  value={selectedFile}
                  placeholder="Please select a file."
                  className="w-[350px] shrink-0"
                />
                <SButton variant="outline" onClick={handleBrowseSampleFile}>
                  Browse
                </SButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="maint-restore-server"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                File Server URL
              </label>
              <SInput
                id="maint-restore-server"
                aria-label="File Server URL"
                variant="filled"
                value={importServerUrl}
                onChange={(e) => setImportServerUrl(e.target.value)}
                placeholder="sftp://192.168.0.50/backups/site.cfg"
                className="w-[350px]"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <SButton
            variant="primary"
            disabled={!canRestore}
            onClick={handleRestore}
            className="omada-maint-restore-btn"
          >
            Restore
          </SButton>
          <Tooltip title="Restoring a site backup overwrites the active site's configuration and applies changes to managed devices.">
            <span
              role="img"
              aria-label="Restore information"
              className="inline-flex cursor-help items-center"
            >
              <SIcon name="info" size={16} />
            </span>
          </Tooltip>
        </div>
      </section>

      <div className="my-7 border-t border-[var(--omada-border-divider)]" />

      {/* Section 2: Site Backup */}
      <section aria-labelledby="site-backup-heading">
        <h2
          id="site-backup-heading"
          className="m-0 mb-5 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]"
        >
          Site Backup
        </h2>

        <div className="space-y-5">
          {/* Backup Contents */}
          <div className="flex flex-wrap items-start gap-y-2">
            <span className="w-[210px] shrink-0 pt-0.5 text-[14px] text-[var(--omada-text-primary)]">
              Backup Contents
            </span>
            <div className="flex flex-col gap-3">
              <SCheckbox
                checked={backupSettings}
                onChange={(e) => setBackupSettings(e.target.checked)}
              >
                Settings
              </SCheckbox>

              <div className="inline-flex items-center gap-2">
                <SCheckbox
                  checked={backupClients}
                  onChange={(e) => setBackupClients(e.target.checked)}
                >
                  Authenticated Clients
                </SCheckbox>
                <Tooltip title="Include authorized hotspot portal and 802.1X client session records in the backup archive.">
                  <span
                    role="img"
                    aria-label="Authenticated Clients details"
                    className="inline-flex cursor-help items-center"
                  >
                    <SIcon name="info" size={16} />
                  </span>
                </Tooltip>
              </div>

              <SCheckbox
                checked={backupFirmwareLogs}
                onChange={(e) => setBackupFirmwareLogs(e.target.checked)}
              >
                Firmware Update Logs
              </SCheckbox>
            </div>
          </div>

          {/* Export Destination Radios */}
          <div className="flex flex-wrap items-center gap-y-2">
            <span className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]">
              Export
            </span>
            <SRadio.Group
              value={exportMode}
              onChange={(e) => setExportMode(e.target.value as ExportMode)}
              className="flex flex-wrap items-center gap-7"
            >
              <SRadio value="local-file">Export to Local File</SRadio>
              <SRadio value="file-server">Export to File Server</SRadio>
              <SRadio value="local-disk">Export to Local Disk</SRadio>
            </SRadio.Group>
          </div>

          {exportMode !== 'local-file' && (
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="maint-export-target"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                {exportMode === 'file-server' ? 'File Server Path' : 'Local Disk Path'}
              </label>
              <SInput
                id="maint-export-target"
                aria-label="Export target path"
                variant="filled"
                value={exportPath}
                onChange={(e) => setExportPath(e.target.value)}
                className="w-[350px]"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <SButton
            variant="primary"
            disabled={!hasAnyBackupContent}
            onClick={handleExport}
          >
            Export
          </SButton>
          <Tooltip title="Download or save a compressed .cfg backup archive for Main Office Floor.">
            <span
              role="img"
              aria-label="Export information"
              className="inline-flex cursor-help items-center"
            >
              <SIcon name="info" size={16} />
            </span>
          </Tooltip>
        </div>
      </section>

      <SModal
        size="sm"
        title="Site Maintenance Guide"
        open={helpOpen}
        onCancel={() => setHelpOpen(false)}
        onOk={() => setHelpOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Got It"
        destroyOnHidden
      >
        <div className="space-y-2.5 text-[13px] leading-5 text-[var(--omada-text-secondary)]">
          <div>
            <strong className="text-[var(--omada-text-primary)]">Site Restore:</strong>{' '}
            Select a local <code>.cfg</code> site archive (such as{' '}
            <code>{SAMPLE_RESTORE_FILENAME}</code>) or specify a remote File Server URL to
            restore site settings.
          </div>
          <div>
            <strong className="text-[var(--omada-text-primary)]">Site Backup:</strong>{' '}
            Choose which site datasets to include (Settings, Authenticated Clients, Firmware
            Update Logs) and export directly to your browser, a File Server, or Local Disk.
          </div>
        </div>
      </SModal>
    </div>
  );
};
