import { memo } from 'react';
import { Dive } from '@/types';
import {
  Label,
  SelectField,
  InputField,
  TextAreaField,
} from './FormComponents';

interface GearTabProps {
  dive: Dive;
}

/**
 * Gear Tab - 显示装备信息
 */
export const GearTab = memo(function GearTab({ dive }: GearTabProps) {
  const gear = dive.gear;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Form Fields */}
      <div className="col-span-2 space-y-6">
        <div>
          <Label>Dress</Label>
          <SelectField value={gear?.dress || ''} />
        </div>

        <div>
          <Label>Apparatus</Label>
          <SelectField value={gear?.apparatus || ''} />
        </div>

        <div>
          <Label>Tank Size</Label>
          <InputField value={gear?.tankSize || ''} />
        </div>

        <div>
          <Label>Weight</Label>
          <InputField value={gear?.weight ? `${gear.weight}` : ''} />
        </div>
      </div>

      {/* Right Column - Notes */}
      <div>
        <Label>Gear Notes</Label>
        <TextAreaField value={gear?.notes} placeholder="No gear notes..." />
      </div>
    </div>
  );
});
