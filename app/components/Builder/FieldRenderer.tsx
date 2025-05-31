// app/components/Builder/FieldRenderer.tsx

import type { FormField } from '~/utils/constants';
import { useState } from 'react';

interface FieldRendererProps {
  field: FormField;
  readOnly?: boolean;
  value?: string | boolean;
  onChange?: (value: string | boolean) => void;
  id?: string;
  showLabel?: boolean;
  className?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  field, 
  readOnly = false, 
  value, 
  onChange, 
  id,
  showLabel = false,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState<string | boolean>('');
  
  // Determine the current value
  const currentValue = value !== undefined ? value : field.value ?? (field.type === 'checkbox' ? false : '');
  
  const handleChange = (newValue: string | boolean) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const baseInputClasses = `
    w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
    ${className}
  `;

  const textareaClasses = `
    ${baseInputClasses} 
    min-h-[80px] resize-vertical
  `;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            id={id}
            type="text"
            placeholder={field.placeholder || ''}
            readOnly={readOnly}
            disabled={readOnly}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            aria-label={field.label}
            aria-required={field.required}
            minLength={field.minLength}
            maxLength={field.maxLength}
            pattern={field.pattern}
            title={field.helpText}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={id}
            placeholder={field.placeholder || ''}
            readOnly={readOnly}
            disabled={readOnly}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            className={textareaClasses}
            aria-label={field.label}
            aria-required={field.required}
            minLength={field.minLength}
            maxLength={field.maxLength}
            title={field.helpText}
            rows={3}
          />
        );

      case 'select':
        return (
          <select
            id={id}
            disabled={readOnly}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            aria-label={field.label}
            aria-required={field.required}
            title={field.helpText}
          >
            <option value="">
              {field.placeholder || 'Select an option...'}
            </option>
            {(field.options || []).map((option, index) => (
              <option key={`${option}-${index}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={id}
              type="checkbox"
              checked={typeof currentValue === 'boolean' ? currentValue : false}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={readOnly}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              aria-label={field.label}
              aria-required={field.required}
              title={field.helpText}
            />
            {showLabel && (
              <label 
                htmlFor={id} 
                className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            id={id}
            type="date"
            readOnly={readOnly}
            disabled={readOnly}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            aria-label={field.label}
            aria-required={field.required}
            title={field.helpText}
          />
        );

      default:
        return (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Unsupported field type: {field}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {showLabel && field.type !== 'checkbox' && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {readOnly && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {field.type}
            </span>
            {field.required && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs">
                Required
              </span>
            )}
            {field.pattern && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                Pattern
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};