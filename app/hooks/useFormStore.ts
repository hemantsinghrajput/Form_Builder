// app/hooks/useFormStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FieldType, FormField } from '~/utils/constants';

interface FormStore {
  steps: FormField[][];
  currentStep: number;
  selectedFieldId: string | null;
  past: FormField[][][];
  future: FormField[][][];
  theme: 'light' | 'dark';
  previewMode: 'desktop' | 'tablet' | 'mobile';
  formId: string | null;
  formTitle: string;
  formDescription: string;
  
  // Actions
  addField: (type: FieldType) => void;
  removeField: (id: string) => void;
  updateField: (id: string, data: Partial<FormField>) => void;
  moveField: (from: number, to: number) => void;
  selectField: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  addStep: () => void;
  removeStep: (index: number) => void;
  setCurrentStep: (step: number) => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  toggleTheme: () => void;
  generateFormId: () => void;
  loadForm: (id: string) => void;
  saveForm: () => void;
  setFormTitle: (title: string) => void;
  setFormDescription: (description: string) => void;
}

function generateUuid(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
}

const isBrowser = typeof window !== 'undefined';

// Type guard to validate FormField
function isFormField(obj: unknown): obj is FormField {
  if (!obj || typeof obj !== 'object') return false;
  const field = obj as Record<string, unknown>;
  
  if (typeof field.id !== 'string' || typeof field.type !== 'string' || typeof field.label !== 'string') {
    return false;
  }
  
  const validTypes = ['text', 'textarea', 'date', 'select', 'checkbox'];
  if (!validTypes.includes(field.type)) return false;
  
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'date':
      return field.value === undefined || typeof field.value === 'string';
    case 'select':
      return (
        Array.isArray(field.options) &&
        (field.value === undefined || typeof field.value === 'string')
      );
    case 'checkbox':
      return field.value === undefined || typeof field.value === 'boolean';
    default:
      return false;
  }
}

// Type guard for FormField[][]
function isFormFieldArray(data: unknown): data is FormField[][] {
  return Array.isArray(data) && data.every((step) => 
    Array.isArray(step) && step.every(isFormField)
  );
}

// Create a new field based on type
function createNewField(type: FieldType): FormField {
  const baseField = {
    id: generateUuid(),
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    required: false,
  };

  switch (type) {
    case 'checkbox':
      return {
        ...baseField,
        type: 'checkbox',
        value: false,
      } as FormField;
    case 'select':
      return {
        ...baseField,
        type: 'select',
        placeholder: 'Select an option',
        options: ['Option 1', 'Option 2'],
        value: '',
      } as FormField;
    case 'text':
      return {
        ...baseField,
        type: 'text',
        placeholder: 'Enter text',
        value: '',
      } as FormField;
    case 'textarea':
      return {
        ...baseField,
        type: 'textarea',
        placeholder: 'Enter your text here',
        value: '',
      } as FormField;
    case 'date':
      return {
        ...baseField,
        type: 'date',
        placeholder: '',
        value: '',
      } as FormField;
    default:
      throw new Error(`Unsupported field type: ${type}`);
  }
}

// Merge partial field data with existing field
function mergeFormField(existing: FormField, data: Partial<FormField>): FormField {
  const merged = { ...existing, ...data };
  
  // Ensure type consistency
  switch (existing.type) {
    case 'checkbox':
      return {
        ...merged,
        type: 'checkbox',
        value: typeof merged.value === 'boolean' ? merged.value : existing.value || false,
        placeholder: undefined,
      } as FormField;
    case 'select':
      return {
        ...merged,
        type: 'select',
        value: typeof merged.value === 'string' ? merged.value : existing.value || '',
        options: Array.isArray(merged.options) ? merged.options : existing.options || ['Option 1'],
      } as FormField;
    case 'text':
    case 'textarea':
    case 'date':
      return {
        ...merged,
        type: existing.type,
        value: typeof merged.value === 'string' ? merged.value : existing.value || '',
      } as FormField;
    default:
      return existing;
  }
}

const deepCopy = <T>(data: T): T => JSON.parse(JSON.stringify(data));

const saveToHistory = (state: FormStore): Partial<FormStore> => ({
  past: [...state.past.slice(-9), deepCopy(state.steps)], // Keep only last 10 states
  future: [],
});

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      steps: [[]],
      currentStep: 0,
      selectedFieldId: null,
      past: [],
      future: [],
      theme: 'light',
      previewMode: 'desktop',
      formId: null,
      formTitle: 'Untitled Form',
      formDescription: '',

      addField: (type: FieldType) => {
        const newField = createNewField(type);
        set((state) => {
          const newSteps = [...state.steps];
          newSteps[state.currentStep] = [...newSteps[state.currentStep], newField];
          return {
            ...saveToHistory(state),
            steps: newSteps,
            selectedFieldId: newField.id,
          };
        });
      },

      removeField: (id: string) => {
        set((state) => {
          const newSteps = [...state.steps];
          newSteps[state.currentStep] = newSteps[state.currentStep].filter((f) => f.id !== id);
          return {
            ...saveToHistory(state),
            steps: newSteps,
            selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
          };
        });
      },

      updateField: (id: string, data: Partial<FormField>) => {
        set((state) => {
          const newSteps = [...state.steps];
          newSteps[state.currentStep] = newSteps[state.currentStep].map((f) =>
            f.id === id ? mergeFormField(f, data) : f
          );
          return {
            steps: newSteps, // Don't save to history for every field update
          };
        });
      },

      moveField: (from: number, to: number) => {
        set((state) => {
          const current = [...state.steps[state.currentStep]];
          if (from < 0 || from >= current.length || to < 0 || to >= current.length || from === to) {
            return state;
          }
          
          const [moved] = current.splice(from, 1);
          current.splice(to, 0, moved);
          
          const newSteps = [...state.steps];
          newSteps[state.currentStep] = current;
          
          return {
            ...saveToHistory(state),
            steps: newSteps,
          };
        });
      },

      selectField: (id: string | null) => set({ selectedFieldId: id }),

      undo: () => {
        set((state) => {
          if (state.past.length === 0) return state;
          
          const past = [...state.past];
          const previous = past.pop()!;
          
          return {
            past,
            future: [deepCopy(state.steps), ...state.future.slice(0, 9)],
            steps: previous,
            selectedFieldId: null,
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.future.length === 0) return state;
          
          const future = [...state.future];
          const next = future.shift()!;
          
          return {
            future,
            past: [...state.past, deepCopy(state.steps)],
            steps: next,
            selectedFieldId: null,
          };
        });
      },

      reset: () => set({
        steps: [[]],
        past: [],
        future: [],
        selectedFieldId: null,
        currentStep: 0,
        formId: null,
        formTitle: 'Untitled Form',
        formDescription: '',
      }),

      addStep: () => set((state) => ({
        steps: [...state.steps, []],
      })),

      removeStep: (index: number) => set((state) => {
        if (state.steps.length <= 1) return state; // Don't remove the last step
        
        const newSteps = state.steps.filter((_, i) => i !== index);
        const newCurrentStep = state.currentStep >= newSteps.length 
          ? newSteps.length - 1 
          : state.currentStep;
        
        return {
          ...saveToHistory(state),
          steps: newSteps,
          currentStep: newCurrentStep,
        };
      }),

      setCurrentStep: (step: number) => set((state) => ({
        currentStep: step >= 0 && step < state.steps.length ? step : state.currentStep,
        selectedFieldId: null, // Clear selection when changing steps
      })),

      setPreviewMode: (mode) => set({ previewMode: mode }),

      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (isBrowser) {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
        return { theme: newTheme };
      }),

      generateFormId: () => set((state) => {
        const id = generateUuid();
        if (isBrowser) {
          const formData = {
            steps: state.steps,
            title: state.formTitle,
            description: state.formDescription,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(`form-${id}`, JSON.stringify(formData));
        }
        return { formId: id };
      }),

      saveForm: () => {
        const state = get();
        if (state.formId && isBrowser) {
          const formData = {
            steps: state.steps,
            title: state.formTitle,
            description: state.formDescription,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(`form-${state.formId}`, JSON.stringify(formData));
        }
      },

      loadForm: (id: string) => {
        if (isBrowser) {
          try {
            const data = localStorage.getItem(`form-${id}`);
            if (data) {
              const parsed = JSON.parse(data);
              if (isFormFieldArray(parsed.steps || parsed)) {
                set({ 
                  steps: parsed.steps || parsed, 
                  formId: id, 
                  currentStep: 0,
                  formTitle: parsed.title || 'Untitled Form',
                  formDescription: parsed.description || '',
                  selectedFieldId: null,
                });
              } else {
                console.error('Invalid form data format');
              }
            }
          } catch (error) {
            console.error('Error loading form:', error);
          }
        }
      },

      setFormTitle: (title: string) => set({ formTitle: title }),
      setFormDescription: (description: string) => set({ formDescription: description }),
    }),
    { 
      name: 'form-builder-storage',
      partialize: (state) => ({
        steps: state.steps,
        formTitle: state.formTitle,
        formDescription: state.formDescription,
        theme: state.theme,
        previewMode: state.previewMode,
        formId: state.formId,
      }),
    }
  )
);