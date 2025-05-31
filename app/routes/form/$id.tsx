import { useParams } from '@remix-run/react';
import { useFormStore } from '~/hooks/useFormStore';
import { FormPreview } from '~/components/Preview/FormPreview';
import { Button } from '~/components/UI/Button';
import { useEffect, useState } from 'react';

export default function PublicFormPage() {
  const { id: formId } = useParams();
  const { steps, currentStep, setCurrentStep, loadForm } = useFormStore();
  const [notFound, setNotFound] = useState(false);

  // Load form from localStorage on client
  useEffect(() => {
    if (!formId) return;
    // Only runs in the browser
    const json = window.localStorage.getItem(`form-${formId}`);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        // loadForm should accept { steps, currentStep }
        loadForm(parsed);
        setNotFound(false);
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
    // eslint-disable-next-line
  }, [formId]);

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <h1 className="text-2xl font-semibold mb-4">Form Not Found</h1>
        <p className="text-gray-600">The form you are looking for does not exist or has been deleted.</p>
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <p className="text-gray-500">Loading form...</p>
      </div>
    );
  }

  // --- FORM VALIDATION LOGIC ---
  const validateStep = () => {
    const formData = useFormStore.getState().steps[currentStep].reduce<
      Record<string, string | boolean | undefined>
    >((acc, field) => ({
      ...acc,
      [field.id]: field.value,
    }), {});
    const errors: Record<string, string> = {};
    steps[currentStep].forEach((field) => {
      const value = formData[field.id];
      if (field.required && (value === undefined || value === '' || value === false)) {
        errors[field.id] = 'This field is required';
      } else if (typeof value === 'string' && field.pattern && value) {
        try {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) errors[field.id] = 'Invalid format';
        } catch {
          errors[field.id] = 'Invalid regex pattern';
        }
      } else if (typeof value === 'string') {
        if (field.minLength && value.length < field.minLength) {
          errors[field.id] = `Minimum length is ${field.minLength}`;
        }
        if (field.maxLength && value.length > field.maxLength) {
          errors[field.id] = `Maximum length is ${field.maxLength}`;
        }
      }
    });
    useFormStore.setState((state) => ({
      steps: state.steps.map((s, i) =>
        i === currentStep
          ? s.map((f) => ({ ...f, error: errors[f.id] }))
          : s,
      ),
    }));
    return Object.keys(errors).length === 0;
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = () => {
    if (!formId) return;
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        const formData = steps.flat().reduce<Record<string, string | boolean | undefined>>(
          (acc, field) => ({
            ...acc,
            [field.id]: field.value,
          }),
          {},
        );
        // Filter out undefined values before saving
        const submissionData = Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => value !== undefined),
        ) as Record<string, string | boolean>;
        // saveResponse(formId, submissionData); // Uncomment if you have this util
        alert('Form submitted!');
      }
    }
  };

  // --- UI ---
  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-4">Fill Out Form</h1>
      <div className="flex space-x-2 mb-4">
        {steps.map((_, index) => (
          <span
            key={index}
            className={`inline-block w-8 h-8 rounded-full text-center leading-8 ${
              currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            aria-label={`Step ${index + 1}`}
          >
            {index + 1}
          </span>
        ))}
      </div>
      <FormPreview />
      <div className="mt-4 space-x-2">
        {currentStep > 0 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)} aria-label="Previous step">
            Previous
          </Button>
        )}
        <Button onClick={handleSubmit} aria-label={currentStep < steps.length - 1 ? 'Next step' : 'Submit form'}>
          {currentStep < steps.length - 1 ? 'Next' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
