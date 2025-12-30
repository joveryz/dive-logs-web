import { memo } from 'react';
import { Dive } from '@/types';
import {
  Label,
  SelectField,
  InputField,
  TextAreaField,
  InfoRowWithUnit,
} from './FormComponents';
import { fieldLabels } from '@/constants';

interface EnvironmentTabProps {
  dive: Dive;
}

/**
 * Environment Tab - 显示环境信息
 */
export const EnvironmentTab = memo(function EnvironmentTab({
  dive,
}: EnvironmentTabProps) {
  const env = dive.environment;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Temperature Info */}
      <div className="space-y-4">
        <InfoRowWithUnit label={fieldLabels.minTemp} value={env?.minTemp} unit="°C" />
        <InfoRowWithUnit label={fieldLabels.maxTemp} value={env?.maxTemp} unit="°C" />
        <InfoRowWithUnit
          label={fieldLabels.avgTemp}
          value={env?.avgTemp}
          unit="°C"
        />
        <InfoRowWithUnit
          label={fieldLabels.surfacePressure}
          value={env?.surfacePressure}
          unit="mBar"
        />

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <Label>{fieldLabels.airTemp} ( C F):</Label>
            <InputField value={env?.airTemp?.toString() || ''} />
          </div>
          <div>
            <Label>{fieldLabels.visibility}</Label>
            <InputField value={env?.visibility?.toString() || ''} />
          </div>
        </div>
      </div>

      {/* Middle Column - Dropdowns */}
      <div className="space-y-4">
        <div>
          <Label>{fieldLabels.weather}</Label>
          <SelectField value={env?.weather || ''} />
        </div>

        <div>
          <Label>{fieldLabels.platform}</Label>
          <SelectField value={env?.platform || ''} />
        </div>

        <div>
          <Label>{fieldLabels.environment}</Label>
          <SelectField value={env?.environment || ''} />
        </div>

        <div>
          <Label>{fieldLabels.conditions}</Label>
          <SelectField value={env?.conditions || ''} />
        </div>
      </div>

      {/* Right Column - Notes */}
      <div>
        <Label>Environment Notes</Label>
        <TextAreaField
          value={env?.notes}
          placeholder="No environment notes..."
        />
      </div>
    </div>
  );
});
