import { useParams } from '@remix-run/react';
import { useFormStore } from '~/hooks/useFormStore';
import { FormPreview } from '~/components/Preview/FormPreview';
import { Button } from '~/components/UI/Button';
import { useEffect, useState } from 'react';
import { saveResponse } from '~/utils/responseStorage';

export default function PublicFormPage() {
  const { id: formId } = useParams();
  const { steps, currentStep, setCurrentStep, loadForm } = useFormStore();
  const [notFound, setNotFound] = useState(false);

  // Calculate progress based on filled fields
  const calculateProgress = () => {
    const allFields = steps.flat();
    const totalFields = allFields.length;
    const filledFields = allFields.filter(
      (field) => field.value !== undefined && field.value !== '' && field.value !== false
    ).length;
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  };

  // Load form from localStorage on client
  useEffect(() => {
    if (!formId) return;
    // Only runs in the browser
    if (typeof window === 'undefined' || !window.localStorage) {
      setNotFound(true);
      return;
    }
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
  const validateStep = (isSubmission = false) => {
    const formData = useFormStore.getState().steps[currentStep].reduce<
      Record<string, string | boolean | undefined>
    >((acc, field) => ({
      ...acc,
      [field.id]: field.value,
    }), {});
    const errors: Record<string, string> = {};
    
    steps[currentStep].forEach((field) => {
      const value = formData[field.id];
      
      // Skip terms and conditions validation unless it's the final submission
      const isTermsField = field.label?.toLowerCase().includes('terms') || 
                          field.label?.toLowerCase().includes('agree') ||
                          field.id?.toLowerCase().includes('terms') ||
                          field.id?.toLowerCase().includes('agree');
      
      if (field.required && !isTermsField && (value === undefined || value === '' || value === false)) {
        errors[field.id] = 'This field is required';
      } else if (field.required && isTermsField && isSubmission && (value === undefined || value === '' || value === false)) {
        // Only validate terms field on final submission
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
    
    // Show alert if there are validation errors
    if (Object.keys(errors).length > 0) {
      const errorFields = steps[currentStep]
        .filter((field) => errors[field.id])
        .map((field) => field.label || field.id)
        .join(', ');
      alert(`Please fill out the following required fields: ${errorFields}`);
    }
    
    return Object.keys(errors).length === 0;
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = () => {
    if (!formId) return;
    
    // Check if this is the final step (submission)
    const isSubmission = currentStep === steps.length - 1;
    
    if (validateStep(isSubmission)) {
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
        saveResponse(formId, submissionData); // Save response to localStorage

        // Reset form fields and currentStep
        useFormStore.setState((state) => ({
          steps: state.steps.map((step) =>
            step.map((field) => ({
              ...field,
              value: undefined, // Clear field value
              error: undefined, // Clear any validation errors
            })),
          ),
        }));
        setCurrentStep(0); // Return to the first step
        alert('Form submitted and fields cleared!');
        // Refresh the page
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    }
  };

  // --- UI ---
  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Fill Out Form</h1>
      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Progress: {Math.round(calculateProgress())}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 dark:bg-blue-400"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index <= currentStep || validateStep(false)) {
                  setCurrentStep(index);
                }
              }}
              className={`inline-block w-8 h-8 rounded-full text-center leading-8 text-sm font-medium ${
                index <= currentStep
                  ? 'bg-blue-500 text-white dark:bg-blue-400'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
              } ${index <= currentStep || validateStep(false) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              aria-label={`Go to Step ${index + 1}`}
              disabled={index > currentStep && !validateStep(false)}
            >
              {index + 1}
            </button>
          ))}
        </div>
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