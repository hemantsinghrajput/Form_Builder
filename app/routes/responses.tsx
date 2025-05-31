import { useEffect, useState } from 'react';
import { getResponses, clearForm } from '~/utils/responseStorage';
import { Link } from '@remix-run/react';
import { useTheme } from '~/context/ThemeContext';

interface SavedForm {
  id: string;
  title: string;
  steps: any[];
}

export default function SavedFormsPage() {
  const { theme } = useTheme();
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [responses, setResponses] = useState<Record<string, any[]>>({});
  const [visibleResponses, setVisibleResponses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const formKeys = Object.keys(window.localStorage).filter((key) =>
      key.startsWith('form-')
    );
    const loadedForms: SavedForm[] = [];
    const loadedResponses: Record<string, any[]> = {};

    formKeys.forEach((key) => {
      try {
        const json = window.localStorage.getItem(key);
        if (json) {
          const parsed = JSON.parse(json);
          const id = key.replace('form-', '');
          const title =
            parsed.title ||
            (parsed.steps && parsed.steps[0] && parsed.steps[0][0]?.label) ||
            id;
          loadedForms.push({ id, title, steps: parsed.steps || [] });
          loadedResponses[id] = getResponses(id) || [];
        }
      } catch {
        // Ignore parse errors
      }
    });
    setForms(loadedForms);
    setResponses(loadedResponses);
  }, []);

  const handleDeleteForm = (formId: string) => {
    if (
      confirm(
        `Are you sure you want to delete the form "${formId}" and all its responses?`
      )
    ) {
      clearForm(formId);
      setForms((prev) => prev.filter((form) => form.id !== formId));
      setResponses((prev) => {
        const newResponses = { ...prev };
        delete newResponses[formId];
        return newResponses;
      });
      setVisibleResponses((prev) => {
        const newVisible = { ...prev };
        delete newVisible[formId];
        return newVisible;
      });
    }
  };

  const toggleResponsesVisibility = (formId: string) => {
    setVisibleResponses((prev) => ({
      ...prev,
      [formId]: !prev[formId],
    }));
  };

  // Theme-based colors
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const responseBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800';
  const btnBase = 'px-3 py-1 rounded font-semibold transition-colors';
  const btnPrimary = 'bg-blue-600 text-white hover:bg-blue-700';
  const btnSecondary = theme === 'dark'
    ? 'bg-gray-600 text-white hover:bg-gray-500'
    : 'bg-gray-300 text-gray-700 hover:bg-gray-400';
  const btnDanger = 'bg-red-600 text-white hover:bg-red-700';

  return (
    <div className={` min-h-screen w-screen  p-6 max-w-4xl mx-auto ${bgColor} ${textColor} rounded-md shadow`}>
      <h1 className="text-2xl font-bold mb-6">Saved Forms</h1>
      {forms.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No saved forms found.</p>
      ) : (
        <ul className="space-y-6">
          {forms.map((form) => (
            <li key={form.id} className={`border rounded p-4 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{form.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Form ID: {form.id}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/form/${form.id}`} className={`${btnBase} ${btnPrimary}`}>
                    Fill Form
                  </Link>
                  <button
                    onClick={() => toggleResponsesVisibility(form.id)}
                    className={`${btnBase} ${btnSecondary}`}
                    aria-expanded={visibleResponses[form.id] ? 'true' : 'false'}
                    aria-controls={`responses-${form.id}`}
                  >
                    {visibleResponses[form.id] ? 'Hide Responses' : 'View Responses'}
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className={`${btnBase} ${btnDanger}`}
                  >
                    Delete Form
                  </button>
                </div>
              </div>

              {visibleResponses[form.id] && (
                <div id={`responses-${form.id}`} className="mt-4">
                  <h3 className="font-semibold mb-2">Responses</h3>
                  {responses[form.id] && responses[form.id].length > 0 ? (
                    <ul className="list-disc ml-5 space-y-2">
                      {responses[form.id].map((res, idx) => (
                        <li key={idx} className={`p-2 rounded ${responseBg}`}>
                          {Object.entries(res).map(([k, v]) => {
                            const field = form.steps.flat().find((f: any) => f.id === k);
                            const label = field?.label || k;
                            return (
                              <div key={k}>
                                <strong>{label}:</strong> {String(v)}
                              </div>
                            );
                          })}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No responses yet.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
