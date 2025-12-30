import { memo } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * 信息行组件 - 显示标签和值
 */
interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

export const InfoRow = memo(function InfoRow({
  label,
  value,
  highlight = false,
  className = '',
}: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-400 text-sm">{label}</span>
      <span
        className={`font-mono ${highlight ? 'text-cyan-400 font-semibold' : 'text-gray-200'} ${className}`}
      >
        {value}
      </span>
    </div>
  );
});

/**
 * 带单位的信息行组件
 */
interface InfoRowWithUnitProps {
  label: string;
  value?: number;
  unit: string;
}

export const InfoRowWithUnit = memo(function InfoRowWithUnit({
  label,
  value,
  unit,
}: InfoRowWithUnitProps) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-400">{label}</span>
      <span>
        <span className="text-gray-200">{value ?? '-'}</span>
        {value !== undefined && (
          <span className="text-cyan-400 ml-1">{unit}</span>
        )}
      </span>
    </div>
  );
});

/**
 * 简单信息行组件 - 用于电脑信息等
 */
interface InfoRowSimpleProps {
  label: string;
  value: string;
  valueColor?: 'white' | 'cyan';
  unit?: string;
}

export const InfoRowSimple = memo(function InfoRowSimple({
  label,
  value,
  valueColor = 'white',
  unit,
}: InfoRowSimpleProps) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className={valueColor === 'cyan' ? 'text-cyan-400' : 'text-gray-200'}>
        {value}
        {unit && <span className="text-cyan-400 ml-1">{unit}</span>}
      </span>
    </div>
  );
});

/**
 * 只读选择框组件
 */
interface SelectFieldProps {
  value: string;
  className?: string;
}

export const SelectField = memo(function SelectField({
  value,
  className = '',
}: SelectFieldProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full px-4 py-2.5 bg-gray-700 rounded-lg text-gray-300 text-sm flex items-center justify-between">
        <span>{value || '\u00A0'}</span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
});

/**
 * 只读输入框组件
 */
interface InputFieldProps {
  value: string;
}

export const InputField = memo(function InputField({ value }: InputFieldProps) {
  return (
    <div className="border-b border-gray-600 py-2">
      <span className="text-gray-300">{value || '\u00A0'}</span>
    </div>
  );
});

/**
 * 文本区域组件
 */
interface TextAreaFieldProps {
  value?: string;
  placeholder?: string;
  className?: string;
}

export const TextAreaField = memo(function TextAreaField({
  value,
  placeholder = 'No notes...',
  className = 'h-64',
}: TextAreaFieldProps) {
  return (
    <textarea
      className={`w-full bg-gray-700 border-none rounded-lg p-3 text-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}
      value={value || ''}
      readOnly
      placeholder={placeholder}
    />
  );
});

/**
 * 区域标题组件
 */
interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle = memo(function SectionTitle({
  children,
}: SectionTitleProps) {
  return <h3 className="text-white font-bold mb-4">{children}</h3>;
});

/**
 * 标签组件
 */
interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export const Label = memo(function Label({
  children,
  className = '',
}: LabelProps) {
  return (
    <label className={`block text-white font-medium mb-2 ${className}`}>
      {children}
    </label>
  );
});
