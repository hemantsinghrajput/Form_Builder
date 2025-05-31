/**
 * Type for a single form response.
 * You can extend this with stricter field types if your forms are known.
 */
export type FormResponse = Record<string, any> & {
    submittedAt: string;
    id: string;
  };
  
  /**
   * Get all responses for a given form from localStorage.
   * @param formId - The unique ID of the form.
   * @returns An array of response objects.
   */
  export const getResponses = (formId: string): FormResponse[] => {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const key = `responses-${formId}`;
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting responses:', error);
      return [];
    }
  };
  
  /**
   * Save a new response for a given form in localStorage.
   * @param formId - The unique ID of the form.
   * @param response - The response data to save.
   */
  export const saveResponse = (formId: string, response: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const key = `responses-${formId}`;
      const current = getResponses(formId);
      const newResponse: FormResponse = {
        ...response,
        submittedAt: new Date().toISOString(),
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10),
      };
      window.localStorage.setItem(key, JSON.stringify([...current, newResponse]));
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };
  
  /**
   * Clear all responses for a given form from localStorage.
   * @param formId - The unique ID of the form.
   */
  export const clearResponses = (formId: string) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const key = `responses-${formId}`;
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing responses:', error);
    }
  };
  
  /**
   * Clear a form and its responses from localStorage.
   * @param formId - The unique ID of the form.
   */
  export const clearForm = (formId: string) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const formKey = `form-${formId}`;
      const responsesKey = `responses-${formId}`;
      window.localStorage.removeItem(formKey);
      window.localStorage.removeItem(responsesKey);
    } catch (error) {
      console.error('Error clearing form:', error);
    }
  };