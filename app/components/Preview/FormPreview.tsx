// app/components/Preview/FormPreview.tsx

import { useFormStore } from '~/hooks/useFormStore';
import { FieldRenderer } from '../Builder/FieldRenderer';
import { useState, useEffect } from 'react';
import type { FormField } from '~/utils/constants';

export const FormPreview = () => {
  const { steps, currentStep, previewMode, updateField } = useFormStore();
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentFields = Array.isArray(steps[currentStep]) ? steps[currentStep] : [];

  // Initialize form data with current field values
  useEffect(() => {
    const initialData: Record<string, string | boolean> = {};
    currentFields.forEach(field => {
      if (field.value !== undefined) {
        initialData[field.id] = field.value;
      }
    });
    setFormData(initialData);
  }, [currentFields]);

  const validateField = (field: FormField, value: string | boolean) => {
    if (field.required && (value === '' || value === false || value === undefined)) {
      return 'This field is required';
    }

    if (typeof value === 'string') {
      if (field.minLength && value.length < field.minLength) {
        return `Minimum length is ${field.minLength}`;
      }
      if (field.maxLength && value.length > field.maxLength) {
        return `Maximum length is ${field.maxLength}`;
      }
      if (field.pattern && value) {
        try {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) {
            return 'Invalid format';
          }
        } catch {
          return 'Invalid regex pattern';
        }
      }
    }
    return '';
  };

  const handleInputChange = (id: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [id]: value }));

    // Update the field value in the store
    updateField(id, { value });

    // Validate the field
    const field = currentFields.find(f => f.id === id);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [id]: error }));
    }
  };

  const getPreviewWrapperClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-[375px] border-[10px] rounded-[40px] border-black shadow-xl';
      case 'tablet':
        return 'w-[768px] border-[16px] rounded-[30px] border-black shadow-xl';
      case 'desktop':
      default:
        return 'w-full max-w-4xl';
    }
  };

  return (
    <div className="flex justify-center py-4">
      <div className={`${getPreviewWrapperClass()} bg-gray-100 dark:bg-gray-900 p-4`}>
        <form
          className="space-y-4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
          role="form"
          aria-label="Form Preview"
          onSubmit={(e) => e.preventDefault()}
        >
          {currentFields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No fields in this step. Add fields to see the preview.
              </p>
            </div>
          ) : (
            currentFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label
                  htmlFor={`preview-${field.id}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  )}
                </label>

                <div className="relative">
                  <FieldRenderer
                    field={field}
                    readOnly={false}
                    value={formData[field.id] !== undefined ? formData[field.id] : field.value}
                    onChange={(value) => handleInputChange(field.id, value)}
                    id={`preview-${field.id}`}
                  />

                  {errors[field.id] && (
                    <div className="absolute -bottom-5 left-0">
                      <p
                        id={`${field.id}-error`}
                        className="text-red-500 text-xs"
                        role="alert"
                      >
                        {errors[field.id]}
                      </p>
                    </div>
                  )}
                </div>

                {field.helpText && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {field.helpText}
                  </p>
                )}
              </div>
            ))
          )}

          {currentFields.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                disabled
              >
                Submit (Preview Mode)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
