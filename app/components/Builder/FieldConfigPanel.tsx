import { useFormStore } from '~/hooks/useFormStore';
import { Button } from '../UI/Button';

export const FieldConfigPanel = () => {
  const { steps, currentStep, selectedFieldId, updateField, removeField } = useFormStore();
  const currentFields = Array.isArray(steps[currentStep]) ? steps[currentStep] : [];
  const field = currentFields.find((f) => f.id === selectedFieldId);

  if (!field || !selectedFieldId) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Select a field to configure.</p>
      </div>
    );
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    updateField(field.id, { options: newOptions });
  };

  const addOption = () => {
    updateField(field.id, { options: [...(field.options || []), ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(field.options || [])];
    newOptions.splice(index, 1);
    updateField(field.id, { options: newOptions });
  };

  return (
    <div className="p-4 bg-black-100 dark:bg-white-700 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4" role="region" aria-label="Field Configuration">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Field Settings</h3>

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
          Label *
        </label>
        <input
          id="label"
          type="text"
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-300"
          placeholder="Field Label"
          value={field.label || ''}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
          required
        />
      </div>

      {field.type !== 'checkbox' && (
        <div>
          <label htmlFor="placeholder" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            Placeholder
          </label>
          <input
            id="placeholder"
            type="text"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-300"
            placeholder="Placeholder text"
            value={field.placeholder || ''}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
          />
        </div>
      )}

      <div>
        <label htmlFor="required" className="flex items-center space-x-2">
          <input
            id="required"
            type="checkbox"
            checked={field.required || false}
            onChange={(e) => updateField(field.id, { required: e.target.checked })}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Required</span>
        </label>
      </div>

      <div>
        <label htmlFor="helpText" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
          Help Text
        </label>
        <input
          id="helpText"
          type="text"
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-300"
          placeholder="Help text"
          value={field.helpText || ''}
          onChange={(e) => updateField(field.id, { helpText: e.target.value })}
        />
      </div>

      {field.type === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex space-x-2">
                <input
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-300"
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  aria-label={`Option ${i + 1}`}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeOption(i)}
                  disabled={field.options!.length <= 1}
                  className="bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={addOption}
            size="sm"
            className="mt-2 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Add Option
          </Button>
        </div>
      )}

      {['text', 'textarea'].includes(field.type) && (
        <>
          <div>
            <label htmlFor="minLength" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
              Min Length
            </label>
            <input
              id="minLength"
              type="number"
              min="0"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-300"
              value={field.minLength ?? ''}
              onChange={(e) => updateField(field.id, { minLength: parseInt(e.target.value) || undefined })}
            />
          </div>

          <div>
            <label htmlFor="maxLength" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
              Max Length
            </label>
            <input
              id="maxLength"
              type="number"
              min="0"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-300"
              value={field.maxLength ?? ''}
              onChange={(e) => updateField(field.id, { maxLength: parseInt(e.target.value) || undefined })}
            />
          </div>

          <div>
            <label htmlFor="pattern" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
              Pattern (Regex)
            </label>
            <input
              id="pattern"
              type="text"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-300"
              placeholder="e.g., ^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$ for email"
              value={field.pattern || ''}
              onChange={(e) => updateField(field.id, { pattern: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Use regex patterns for validation (e.g., email, phone number formats)
            </p>
          </div>
        </>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <Button
          onClick={() => removeField(field.id)}
          variant="danger"
          className="w-full bg-red-500 text-white hover:bg-red-600"
          aria-label="Remove field"
        >
          Remove Field
        </Button>
      </div>
    </div>
  );
};