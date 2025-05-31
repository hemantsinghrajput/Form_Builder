import { useFormStore } from '~/hooks/useFormStore';
import { FieldRenderer } from './FieldRenderer';
import type { FormField } from '~/utils/constants';

interface FormCanvasProps {
  onSelectField: (id: string | null) => void;
}

export const FormCanvas = ({ onSelectField }: FormCanvasProps) => {
  const { steps, currentStep, addField, selectField } = useFormStore();
  const currentFields = Array.isArray(steps[currentStep]) ? steps[currentStep] : [];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Allow drop
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    const fieldType = e.dataTransfer.getData('fieldType');
    if (fieldType) {
      addField(fieldType as any); // Assumes fieldType is valid; validate if needed
    }
  };

  return (
    <div
      className="min-h-[300px] p-4 border-2 border-dashed rounded border-gray-300"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label="Form Canvas"
    >
      {currentFields.length === 0 ? (
        <p className="text-gray-500 text-center">Drag fields here to build your form</p>
      ) : (
        currentFields.map((field: FormField) => (
          <div
            key={field.id}
            onClick={() => {
              selectField(field.id);
              onSelectField(field.id);
            }}
            className="cursor-pointer mb-2"
          >
            <FieldRenderer field={field} readOnly={true} />
          </div>
        ))
      )}
    </div>
  );
};