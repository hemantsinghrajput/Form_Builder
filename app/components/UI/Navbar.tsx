import { Link } from '@remix-run/react';
import { Button } from './Button';
import { useTheme } from '~/context/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 py-4">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link
              to="/"
              className="px-4 py-2 text-gray-800 dark:text-gray-300 font-semibold rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Builder
            </Link>
            <Link
              to="/preview"
              className="px-4 py-2 text-gray-800 dark:text-gray-300 font-semibold rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Preview
            </Link>
            <Link
              to="/responses"
              className="px-4 py-2 text-gray-800 dark:text-gray-300 font-semibold rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Responses
            </Link>
          </div>
          <Button
            onClick={toggleTheme}
            className="bg-black-100 dark:bg-white-900 text-gray-800 dark:text-gray-300"
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>
      </div>
    </nav>
  );
}