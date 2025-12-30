import { memo } from 'react';
import { Dive } from '@/types';
import { Label, SelectField, TextAreaField } from './FormComponents';

interface ProblemsTabProps {
  dive: Dive;
}

/**
 * Problems Tab - 显示问题和事件记录
 */
export const ProblemsTab = memo(function ProblemsTab({
  dive,
}: ProblemsTabProps) {
  const problemsInfo = dive.problemsInfo;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        <div>
          <Label>Thermal Comfort</Label>
          <SelectField value={problemsInfo?.thermalComfort || ''} />
        </div>

        <div>
          <Label>Workload</Label>
          <SelectField value={problemsInfo?.workload || ''} />
        </div>

        <div>
          <Label>Problems</Label>
          <SelectField value={problemsInfo?.problems || ''} />
        </div>
      </div>

      {/* Middle Column */}
      <div className="space-y-6">
        <div>
          <Label>Equipment Malfunction</Label>
          <SelectField value={problemsInfo?.equipmentMalfunction || ''} />
        </div>

        <div>
          <Label>Any Symptoms</Label>
          <SelectField value={problemsInfo?.anySymptoms || ''} />
        </div>

        <div>
          <Label>Exposure to Altitude</Label>
          <SelectField value={problemsInfo?.exposureToAltitude || ''} />
        </div>
      </div>

      {/* Right Column - Notes */}
      <div>
        <Label>Problems Notes</Label>
        <TextAreaField
          value={problemsInfo?.notes}
          placeholder="No problems notes..."
        />
      </div>
    </div>
  );
});
