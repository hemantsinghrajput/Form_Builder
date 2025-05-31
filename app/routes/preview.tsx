import { useState } from 'react';
import { FormPreview } from '~/components/Preview/FormPreview';
import { useTheme } from '~/context/ThemeContext';

export default function PreviewPage() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { theme } = useTheme();

  const sizes = {
    desktop: 'w-full',
    tablet: 'max-w-md',
    mobile: 'max-w-xs',
  };

  // button base + theme-aware styles
  const baseBtnClasses = 'px-4 py-2 rounded font-semibold transition-colors';
  const activeBtnClasses = 'bg-blue-600 text-white hover:bg-blue-700';
  const inactiveBtnClasses =
    theme === 'dark'
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <div className=" min-h-screen w-screen  p-6 max-w-4xl mx-auto">
      <div className="mb-4 space-x-2">
        {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`${baseBtnClasses} ${
              device === d ? activeBtnClasses : inactiveBtnClasses
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className={`mx-auto border rounded p-4 ${sizes[device]}`}>
        <FormPreview />
      </div>
    </div>
  );
}
