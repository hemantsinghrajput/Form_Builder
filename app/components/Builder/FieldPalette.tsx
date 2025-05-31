// app/components/Builder/FieldPalette.tsx

import { FC } from 'react';
import { Button } from '../UI/Button';
import { FIELD_TYPES, FieldType, FormField } from '~/utils/constants';
import { useFormStore } from '~/hooks/useFormStore';

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export const FieldPalette: FC<FieldPaletteProps> = ({ onAddField }) => {
  const { steps, reset } = useFormStore();

  const templates: Record<string, {
    name: string;
    description: string;
    fields: Partial<FormField>[];
  }> = {
    'contact-form': {
      name: 'Contact Form',
      description: 'Basic contact form with name, email, and message',
      fields: [
        { type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
        { type: 'text', label: 'Email Address', placeholder: 'your@email.com', required: true, pattern: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$' },
        { type: 'text', label: 'Phone Number', placeholder: '(555) 123-4567', required: false },
        { type: 'select', label: 'Inquiry Type', options: ['General Question', 'Support Request', 'Sales Inquiry', 'Other'], required: true },
        { type: 'textarea', label: 'Message', placeholder: 'Please describe your inquiry...', required: true, minLength: 10, maxLength: 500 },
        { type: 'checkbox', label: 'Subscribe to newsletter', required: false }
      ]
    },
    'registration-form': {
      name: 'Registration Form',
      description: 'User registration form with personal details',
      fields: [
        { type: 'text', label: 'First Name', placeholder: 'First name', required: true },
        { type: 'text', label: 'Last Name', placeholder: 'Last name', required: true },
        { type: 'text', label: 'Email', placeholder: 'Email address', required: true, pattern: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$' },
        { type: 'date', label: 'Date of Birth', required: true },
        { type: 'select', label: 'Gender', options: ['Male', 'Female', 'Other', 'Prefer not to say'], required: false },
        { type: 'text', label: 'Phone Number', placeholder: 'Phone number', required: false },
        { type: 'checkbox', label: 'I agree to the terms and conditions', required: true }
      ]
    },
    'survey-form': {
      name: 'Survey Form',
      description: 'Customer satisfaction survey',
      fields: [
        { type: 'text', label: 'Your Name', placeholder: 'Optional', required: false },
        { type: 'select', label: 'How did you hear about us?', options: ['Search Engine', 'Social Media', 'Friend/Family', 'Advertisement', 'Other'], required: true },
        { type: 'select', label: 'Overall Satisfaction', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'], required: true },
        { type: 'textarea', label: 'Additional Comments', placeholder: 'Please share any additional feedback...', required: false, maxLength: 300 },
        { type: 'checkbox', label: 'Would you recommend us to others?', required: false }
      ]
    }
  };

  const loadTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey];
    if (!template) return;

    reset();

    template.fields.forEach((fieldConfig) => {
      if (!fieldConfig.type) return;

      onAddField(fieldConfig.type);

      setTimeout(() => {
        const state = useFormStore.getState();
        const currentFields = state.steps[state.currentStep];
        const lastField = currentFields[currentFields.length - 1];

        const updates: Partial<FormField> = {
          label: fieldConfig.label,
          placeholder: fieldConfig.placeholder,
          required: fieldConfig.required,
        };

        if ('options' in fieldConfig) updates.options = fieldConfig.options;
        if ('pattern' in fieldConfig) updates.pattern = fieldConfig.pattern;
        if ('minLength' in fieldConfig) updates.minLength = fieldConfig.minLength;
        if ('maxLength' in fieldConfig) updates.maxLength = fieldConfig.maxLength;

        state.updateField(lastField.id, updates);
      }, 0);
    });
  };

  return (
    <div className="space-y-6">
      {/* Field Types */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Field Types</h2>
        <div className="space-y-2">
          {FIELD_TYPES.map((field) => (
            <div
              key={field.type}
              className="group p-3 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('fieldType', field.type);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onAddField(field.type)}
              role="button"
              tabIndex={0}
              aria-label={`Add ${field.label} field`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAddField(field.type);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg group-hover:scale-110 transition-transform">{field.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          💡 Drag or click to add fields to your form
        </p>
      </div>

      {/* Templates */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Templates</h2>
        <div className="space-y-3">
          {Object.entries(templates).map(([key, template]) => (
            <div
              key={key}
              className="border border-gray-200 dark:border-gray-600 rounded-md p-3 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{template.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
              <Button onClick={() => loadTemplate(key as keyof typeof templates)} size="sm" className="w-full">
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Form Statistics</h3>
        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-200">
          <p>Steps: {steps.length}</p>
          <p>Total Fields: {steps.flat().length}</p>
          <p>Required Fields: {steps.flat().filter(f => f.required).length}</p>
        </div>
      </div>
    </div>
  );
};
