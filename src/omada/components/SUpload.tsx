import React, { useMemo, useState } from 'react';
import { Upload, type UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { Download } from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import { SBuiltinIllustration } from '../assets/builtinIllustrations';
import { SButton, type SButtonVariant } from './SButton';

export type SUploadPreset = 'firmware' | 'config' | 'image';
export type SUploadVariant = 'button' | 'dragger';

export interface SUploadPresetConfig {
  accept: string;
  maxSizeMB: number;
  buttonText: string;
  draggerTitle: string;
  draggerDescription: string;
}

export const OMADA_UPLOAD_PRESETS: Record<SUploadPreset, SUploadPresetConfig> = {
  firmware: {
    accept: '.bin,.img',
    maxSizeMB: 50,
    buttonText: 'Upload Firmware',
    draggerTitle: 'Click or drag firmware file to this area to upload',
    draggerDescription: 'Supported: .bin, .img (max 50 MB)',
  },
  config: {
    accept: '.cfg,.json,.xml',
    maxSizeMB: 10,
    buttonText: 'Upload Config',
    draggerTitle: 'Click or drag configuration file to this area to upload',
    draggerDescription: 'Supported: .cfg, .json, .xml (max 10 MB)',
  },
  image: {
    accept: '.png,.jpg,.jpeg,.svg,.webp',
    maxSizeMB: 5,
    buttonText: 'Upload Image',
    draggerTitle: 'Click or drag image file to this area to upload',
    draggerDescription: 'Supported: .png, .jpg, .jpeg, .svg, .webp (max 5 MB)',
  },
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeAcceptString(accept?: UploadProps['accept']): string | undefined {
  if (!accept) return undefined;
  if (typeof accept === 'string') return accept;
  return accept.format;
}

export interface UploadValidationResult {
  valid: boolean;
  reason?: 'accept' | 'size';
  message?: string;
}

/**
 * Validates a candidate file against `accept` extensions/MIME patterns and `maxSizeBytes`.
 */
export function validateUploadFile(
  file: Pick<File, 'name' | 'size' | 'type'>,
  options: { accept?: string; maxSizeBytes?: number },
): UploadValidationResult {
  const { accept, maxSizeBytes } = options;

  if (accept && accept.trim()) {
    const tokens = accept
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const fileName = file.name.toLowerCase();
    const mime = (file.type || '').toLowerCase();

    const matched = tokens.some((token) => {
      if (token.startsWith('.')) {
        return fileName.endsWith(token);
      }
      if (token.endsWith('/*')) {
        const prefix = token.slice(0, -1);
        return mime.startsWith(prefix);
      }
      return mime === token;
    });

    if (!matched) {
      return {
        valid: false,
        reason: 'accept',
        message: `Unsupported file type for "${file.name}". Allowed: ${tokens.join(', ')}.`,
      };
    }
  }

  if (maxSizeBytes !== undefined && maxSizeBytes > 0 && file.size > maxSizeBytes) {
    return {
      valid: false,
      reason: 'size',
      message: `File "${file.name}" (${formatFileSize(file.size)}) exceeds the ${formatFileSize(maxSizeBytes)} size limit.`,
    };
  }

  return { valid: true };
}

export interface SUploadProps extends Omit<UploadProps, 'type'> {
  /** Render as inline trigger button (`button`) or dashed dropzone (`dragger`). */
  variant?: SUploadVariant;
  /** Preconfigured Omada validation & copy preset (`firmware` | `config` | `image`). */
  preset?: SUploadPreset;
  /** Maximum file size in bytes (overrides `maxSizeMB` and preset default). */
  maxSize?: number;
  /** Maximum file size in megabytes (overrides preset default). */
  maxSizeMB?: number;
  /** Button label when `variant="button"`. */
  buttonText?: React.ReactNode;
  /** Omada button variant when `variant="button"`. */
  buttonVariant?: SButtonVariant;
  /** Primary dropzone heading when `variant="dragger"`. */
  title?: React.ReactNode;
  /** Secondary dropzone hint when `variant="dragger"`. */
  description?: React.ReactNode;
  /** Show Omada theme-aware upgrade illustration inside the dragger dropzone instead of icon badge. */
  showIllustration?: boolean;
  /** Optional helper link text next to button upload (e.g. `"Download Template"`). */
  templateText?: React.ReactNode;
  /** Click callback for `"Download Template"` helper link. */
  onDownloadTemplate?: () => void;
  /** Display inline error alert when a file fails accept/size validation (default `true`). */
  showValidationAlert?: boolean;
  /** Callback fired when accept or max size validation blocks a file. */
  onValidationError?: (message: string, file: File) => void;
}

/**
 * Omada File Upload supporting Button + Template link mode and Drag & Drop Dropzone,
 * Omada Figma icons/illustrations, `firmware` / `config` / `image` presets, and client-side
 * extension & max-size validation feedback.
 */
const SUploadBase: React.FC<SUploadProps> = ({
  variant = 'button',
  preset,
  accept,
  maxSize,
  maxSizeMB,
  buttonText,
  buttonVariant = 'secondary',
  title,
  description,
  showIllustration = false,
  templateText,
  onDownloadTemplate,
  showValidationAlert = true,
  onValidationError,
  beforeUpload,
  customRequest,
  action,
  disabled = false,
  className = '',
  classNames,
  children,
  ...rest
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const presetCfg = preset ? OMADA_UPLOAD_PRESETS[preset] : undefined;

  const resolvedAccept = accept ?? presetCfg?.accept;
  const acceptStr = normalizeAcceptString(resolvedAccept);

  const resolvedMaxBytes = useMemo(() => {
    if (maxSize !== undefined) return maxSize;
    if (maxSizeMB !== undefined) return maxSizeMB * 1024 * 1024;
    if (presetCfg) return presetCfg.maxSizeMB * 1024 * 1024;
    return undefined;
  }, [maxSize, maxSizeMB, presetCfg]);

  const resolvedButtonText = buttonText ?? presetCfg?.buttonText ?? 'Upload File';
  const resolvedDraggerTitle =
    title ?? presetCfg?.draggerTitle ?? 'Click or drag file to this area to upload';
  const resolvedDraggerDesc = useMemo(() => {
    if (description !== undefined) return description;
    if (presetCfg && maxSize === undefined && maxSizeMB === undefined && accept === undefined) {
      return presetCfg.draggerDescription;
    }
    const parts: string[] = [];
    if (acceptStr) parts.push(`Supported: ${acceptStr}`);
    if (resolvedMaxBytes !== undefined) parts.push(`max ${formatFileSize(resolvedMaxBytes)}`);
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [description, presetCfg, maxSize, maxSizeMB, accept, acceptStr, resolvedMaxBytes]);

  const handleBeforeUpload: NonNullable<UploadProps['beforeUpload']> = (
    file: RcFile,
    fileList: RcFile[],
  ) => {
    const result = validateUploadFile(file, {
      accept: acceptStr,
      maxSizeBytes: resolvedMaxBytes,
    });

    if (!result.valid && result.message) {
      setValidationError(result.message);
      onValidationError?.(result.message, file);
      return Upload.LIST_IGNORE;
    }

    setValidationError(null);
    if (beforeUpload) {
      return beforeUpload(file, fileList);
    }
    return true;
  };

  const defaultCustomRequest: NonNullable<UploadProps['customRequest']> = (options) => {
    options.onProgress?.({ percent: 100 });
    options.onSuccess?.({ status: 'ok' });
  };

  const resolvedCustomRequest =
    customRequest ?? (action === undefined ? defaultCustomRequest : undefined);

  const mergedClassNames: UploadProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const resolved = classNames(info);
          return {
            ...resolved,
            root: `omada-upload ${resolved?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-upload ${classNames?.root ?? ''}`.trim(),
        };

  const errorBanner = showValidationAlert && validationError && (
    <div
      role="alert"
      className="mt-2 flex items-start gap-2 rounded-[6px] bg-[var(--omada-color-error-bg)] px-3 py-2 text-xs text-[var(--omada-color-error)]"
    >
      <SIcon name="failed-16" size={14} className="mt-0.5 shrink-0" />
      <span className="leading-4">{validationError}</span>
    </div>
  );

  if (variant === 'dragger') {
    return (
      <div className={`w-full ${className}`.trim()}>
        <Upload.Dragger
          accept={resolvedAccept}
          action={action}
          customRequest={resolvedCustomRequest}
          beforeUpload={handleBeforeUpload}
          disabled={disabled}
          classNames={mergedClassNames}
          {...rest}
        >
          {children ?? (
            <div className="flex flex-col items-center justify-center px-4 py-4 text-center">
              {showIllustration ? (
                <SBuiltinIllustration
                  name="upgrade"
                  width={84}
                  className="mb-2 object-contain"
                />
              ) : (
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--omada-brand-bg-subtlest)] text-[var(--omada-brand-text)]">
                  <SIcon name="import" size={22} />
                </div>
              )}
              <div className="text-sm font-medium text-[var(--omada-text-primary)]">
                {resolvedDraggerTitle}
              </div>
              {resolvedDraggerDesc && (
                <div className="mt-1 text-xs text-[var(--omada-text-secondary)]">
                  {resolvedDraggerDesc}
                </div>
              )}
            </div>
          )}
        </Upload.Dragger>
        {errorBanner}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="flex flex-wrap items-center gap-3">
        <Upload
          accept={resolvedAccept}
          action={action}
          customRequest={resolvedCustomRequest}
          beforeUpload={handleBeforeUpload}
          disabled={disabled}
          classNames={mergedClassNames}
          {...rest}
        >
          {children ?? (
            <SButton
              variant={buttonVariant}
              disabled={disabled}
              icon={<SIcon name="import" size={15} />}
            >
              {resolvedButtonText}
            </SButton>
          )}
        </Upload>

        {templateText && (
          <button
            type="button"
            disabled={disabled}
            onClick={onDownloadTemplate}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[var(--omada-link)] transition-colors hover:text-[var(--omada-link-hover)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={14} />
            <span>{templateText}</span>
          </button>
        )}
      </div>
      {errorBanner}
    </div>
  );
};

const SUploadDragger: React.FC<Omit<SUploadProps, 'variant'>> = (props) => (
  <SUploadBase variant="dragger" {...props} />
);

export const SUpload = Object.assign(SUploadBase, {
  Dragger: SUploadDragger,
  LIST_IGNORE: Upload.LIST_IGNORE,
});
