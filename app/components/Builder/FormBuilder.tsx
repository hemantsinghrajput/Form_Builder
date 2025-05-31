import React, { useCallback, useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useFormStore } from '~/hooks/useFormStore';
import { Button } from '../UI/Button';
import { FieldConfigPanel } from './FieldConfigPanel';
import { FieldRenderer } from './FieldRenderer';
import { FIELD_TYPES, FieldType } from '~/utils/constants';
import { FormPreview } from '../Preview/FormPreview';
import { useParams, useNavigate } from 'react-router-dom';

interface DraggableFieldProps {
  type: FieldType;
  label: string;
}
const DraggableField = ({ type, label }: DraggableFieldProps) => {
  const theme = useFormStore(state => state.theme);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [type]);

  const baseClasses = 'p-2 border rounded cursor-move select-none';
  const bgClass = theme === 'dark'
    ? 'bg-gray-800 border-gray-600 text-white'
    : 'bg-gray-100 border-gray-300 text-black';
  const opacityClass = isDragging ? 'opacity-50' : '';

  return (
    <div
      ref={drag}
      className={`${baseClasses} ${bgClass} ${opacityClass}`}
      role="button"
      aria-label={`Add ${label} field`}
      tabIndex={0}
    >
      {label}
    </div>
  );
};

export default function FormBuilder() {
  const { formId: routeFormId } = useParams<{ formId?: string }>();
  const navigate = useNavigate();

  const {
    steps,
    currentStep,
    selectedFieldId,
    selectField,
    addField,
    setCurrentStep,
    undo,
    redo,
    setPreviewMode,
    toggleTheme,
    reset,
    generateFormId,
    loadForm,
    formId,
    past,
    future,
    theme,
  } = useFormStore();

  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // DnD drop area for adding fields
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'FIELD',
    drop: (item: { type: FieldType }, monitor) => {
      if (!monitor.didDrop()) {
        addField(item.type);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [addField]);

  // Save and generate link
  const handleGenerateLink = useCallback(() => {
    generateFormId();
    setCopied(false);
  }, [generateFormId]);

  // Copy link to clipboard
  const handleCopy = useCallback(() => {
    if (!formId) return;
    navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`);
    setCopied(true);
  }, [formId]);

  // When formId changes (after generateFormId), show link
  useEffect(() => {
    if (formId) setShareId(formId);
  }, [formId]);

  // Load form from URL param
  useEffect(() => {
    if (routeFormId && routeFormId !== formId) {
      loadForm(routeFormId);
      setShareId(routeFormId);
    }
    // eslint-disable-next-line
  }, [routeFormId]);

  const currentFields = Array.isArray(steps[currentStep]) ? steps[currentStep] : [];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} flex h-screen w-full`}>
        {/* Sidebar */}
        <aside className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} w-64 border-r p-4`}>
          <h2 className="text-xl font-semibold mb-4">Field Types</h2>
          <div className="space-y-3">
            {FIELD_TYPES.map((field) => (
              <DraggableField key={field.type} type={field.type} label={field.label} />
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Steps</h2>
            {steps.map((_, index) => (
              <Button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-full mb-2 ${currentStep === index ? 'bg-blue-500 text-white' : ''}`}
                aria-label={`Select Step ${index + 1}`}
              >
                Step {index + 1}
              </Button>
            ))}
            <Button
              onClick={() => useFormStore.getState().addStep()}
              className="w-full"
              aria-label="Add new step"
            >
              Add Step
            </Button>
          </div>
        </aside>

        {/* Builder Panel */}
        <main className="flex-1 flex flex-col">
          <div className="flex flex-1">
            {/* Form Builder Canvas */}
            <div
              className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} w-1/3 p-4 border-r ${isOver ? 'border-blue-500 bg-blue-50' : ''}`}
              ref={dropRef}
            >
              <h2 className="text-xl font-semibold mb-2">Build Form</h2>
              {currentFields.length === 0 ? (
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Drag fields here</p>
              ) : (
                <div className="space-y-4">
                  {currentFields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-4 rounded border cursor-pointer ${
                        selectedFieldId === field.id
                          ? 'border-blue-500'
                          : theme === 'dark'
                            ? 'border-gray-600'
                            : 'border-gray-300'
                      }`}
                      onClick={() => selectField(field.id)}
                    >
                      <FieldRenderer field={field} readOnly={true} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Configuration Panel */}
            <div className="w-1/3 p-4">
              <h2 className="text-xl font-semibold mb-2">Field Settings</h2>
              <FieldConfigPanel />
            </div>

            {/* Preview Panel */}
            <div className="w-1/3 p-4">
              <h2 className="text-xl font-semibold mb-2">Preview</h2>
              <div className="flex space-x-2 mb-2">
                {['desktop', 'tablet', 'mobile'].map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setPreviewMode(mode as any)}
                    className={`capitalize ${useFormStore.getState().previewMode === mode ? 'bg-blue-500 text-white' : ''}`}
                    aria-label={`Set preview mode to ${mode}`}
                  >
                    {mode}
                  </Button>
                ))}
              </div>
              <FormPreview />
            </div>
          </div>

          {/* Actions */}
          <div className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t p-4 flex justify-between`}>
            <div className="space-x-2">
              <Button
                onClick={undo}
                disabled={!past.length}
                aria-label="Undo last action"
              >
                Undo
              </Button>
              <Button
                onClick={redo}
                disabled={!future.length}
                aria-label="Redo last action"
              >
                Redo
              </Button>
              <Button onClick={toggleTheme} aria-label="Toggle theme">
                Toggle Theme
              </Button>
            </div>
            <div className="space-x-2 flex items-center">
              <Button onClick={reset}>
                Reset
              </Button>
              <Button onClick={handleGenerateLink}>
                Generate Shareable Link
              </Button>
              {shareId && (
                <div className="flex flex-col items-start ml-2">
                  <div className="flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/form/${shareId}`}
                      className="border px-2 py-1 rounded text-blue-700 bg-blue-50 w-64"
                      style={{ fontSize: '0.9em' }}
                      onFocus={e => e.target.select()}
                    />
                    <Button size="sm" onClick={handleCopy} className="ml-2">
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <span className="text-xs text-blue-500 mt-1">
                    Share this link to access your form.
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </DndProvider>
  );
}
