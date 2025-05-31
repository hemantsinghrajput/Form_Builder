import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { useState } from 'react';
import { FieldPalette } from '~/components/Builder/FieldPalette';
import { FormCanvas } from '~/components/Builder/FormCanvas';
import { FieldConfigPanel } from '~/components/Builder/FieldConfigPanel';
import { FormPreview } from '~/components/Preview/FormPreview';
import { Button } from '~/components/UI/Button';
import { useFormStore } from '~/hooks/useFormStore';
import { useTheme } from '~/context/ThemeContext';

export const meta: MetaFunction = () => [
  { title: 'Form Builder' },
  { name: 'description', content: 'Build and preview forms easily.' },
];

export default function Index() {
  const {
    steps,
    currentStep,
    setCurrentStep,
    undo,
    redo,
    setPreviewMode,
    generateFormId,
    formId,
  } = useFormStore();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-white dark:bg-black">

      {/* Main Content */}
      <div className="mx-auto max-w-7xl p-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Form Builder</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1">
            <FieldPalette onAddField={useFormStore.getState().addField} />
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Steps</h2>
              {steps.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full mb-2 bg-black-100 dark:bg-white-900 text-black-800 dark:text-white-300 hover:bg-black-200 dark:hover:bg-white-800 ${currentStep === index ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                >
                  Step {index + 1}
                </Button>
              ))}
              <Button
                onClick={() => useFormStore.getState().addStep()}
                className="w-full bg-black-100 dark:bg-white-900 text-gray-800 dark:text-gray-300 hover:bg-black-200 dark:hover:bg-white-800"
              >
                Add Step
              </Button>

              <div className="mt-4 space-y-2">
                <Button
                  onClick={undo}
                  disabled={!useFormStore.getState().past.length}
                  className="w-full bg-black-100 dark:bg-white-900 text-gray-800 dark:text-gray-300 hover:bg-black-200 dark:hover:bg-white-800 disabled:opacity-50"
                >
                  Undo
                </Button>
                <Button
                  onClick={redo}
                  disabled={!useFormStore.getState().future.length}
                  className="w-full bg-black-100 dark:bg-white-900 text-gray-800 dark:text-gray-300 hover:bg-black-200 dark:hover:bg-white-800 disabled:opacity-50"
                >
                  Redo
                </Button>
                <Button
                  onClick={generateFormId}
                  className="w-full bg-black-100 dark:bg-white-900 text-gray-800 dark:text-gray-300 hover:bg-black-200 dark:hover:bg-white-800"
                >
                  Generate Shareable Link
                </Button>
                {formId && (
                  <p className="mt-2 text-blue-500 dark:text-blue-400">
                    Share:{' '}
                    <Link to={`/form/${formId}`} className="underline">
                      /form/{formId}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Form Canvas</h2>
            <FormCanvas onSelectField={setSelectedFieldId} />
          </div>

          <div className="col-span-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Field Settings</h2>
            <FieldConfigPanel />
          </div>

          <div className="col-span-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Preview</h2>
            <div className="flex space-x-2 mb-2">
              {['desktop', 'tablet', 'mobile'].map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setPreviewMode(mode as any)}
                  className="capitalize bg-black-100 dark:bg-white-900 text-gray-800 dark:text-gray-300"
                  >
                  {mode}
                </Button>
              ))}
            </div>
            <FormPreview />
          </div>
        </div>
      </div>
    </main>
  );
}