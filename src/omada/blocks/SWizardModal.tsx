import React, { useState } from 'react';
import { SButton } from '../components/SButton';
import { SModal, type SModalSize } from '../components/SModal';
import { SSteps, type SStepItem } from '../components/SSteps';

export interface SWizardStepItem {
  key: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  content: React.ReactNode;
  /** Disables `Next` / `Finish` while false. */
  canProceed?: boolean;
}

export interface SWizardModalProps {
  open: boolean;
  title: React.ReactNode;
  steps: SWizardStepItem[];
  onCancel: () => void;
  onFinish: () => void;
  finishText?: string;
  /** Optional guard returning `false` to prevent advancing from `stepIndex`. */
  onBeforeNext?: (stepIndex: number) => boolean;
  size?: SModalSize;
  loading?: boolean;
}

/**
 * Multi-step Omada setup & adoption wizard modal combining `<SModal>`, `<SSteps>`,
 * and Back / Next / Finish progression.
 */
export const SWizardModal: React.FC<SWizardModalProps> = ({
  open,
  title,
  steps,
  onCancel,
  onFinish,
  finishText = 'Finish',
  onBeforeNext,
  size = 'default',
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const safeIndex = Math.min(currentStep, Math.max(steps.length - 1, 0));
  const activeStep = steps[safeIndex];
  const isLastStep = safeIndex >= steps.length - 1;
  const canProceed = activeStep?.canProceed ?? true;

  const stepItems: SStepItem[] = steps.map((s) => ({
    key: s.key,
    title: s.title,
    content: s.description,
  }));

  const handleClose = () => {
    setCurrentStep(0);
    onCancel();
  };

  const handleNext = () => {
    if (onBeforeNext && !onBeforeNext(safeIndex)) {
      return;
    }
    if (isLastStep) {
      setCurrentStep(0);
      onFinish();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <SModal
      open={open}
      size={size}
      title={title}
      onCancel={handleClose}
      destroyOnHidden
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--omada-text-tertiary)]">
            Step {steps.length === 0 ? 0 : safeIndex + 1} of {steps.length}
          </div>
          <div className="flex items-center gap-2">
            <SButton variant="secondary" onClick={handleClose}>
              Cancel
            </SButton>
            {safeIndex > 0 && (
              <SButton
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
              >
                Back
              </SButton>
            )}
            <SButton
              variant="primary"
              disabled={!canProceed}
              loading={loading}
              onClick={handleNext}
            >
              {isLastStep ? finishText : 'Next'}
            </SButton>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <SSteps current={safeIndex} items={stepItems} size="small" />
        <div className="omada-wizard-step-body">{activeStep?.content}</div>
      </div>
    </SModal>
  );
};
