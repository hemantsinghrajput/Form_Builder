// app/utils/constants.ts

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'date';

export interface BaseFormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  error?: string;
}

export interface TextFormField extends BaseFormField {
  type: 'text';
  value?: string;
  placeholder?: string;
}

export interface TextareaFormField extends BaseFormField {
  type: 'textarea';
  value?: string;
  placeholder?: string;
}

export interface SelectFormField extends BaseFormField {
  type: 'select';
  value?: string;
  options: string[];
}

export interface CheckboxFormField extends BaseFormField {
  type: 'checkbox';
  value?: boolean;
  placeholder?: undefined;
}

export interface DateFormField extends BaseFormField {
  type: 'date';
  value?: string;
  placeholder?: string;
}

export type FormField = TextFormField | TextareaFormField | SelectFormField | CheckboxFormField | DateFormField;

export const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'date', label: 'Date Picker', icon: '📅' },
];