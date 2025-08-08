// components/TestPage.js - Quick page to test your theme
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const TestPage = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg-primary text-text-light-primary dark:text-text-dark-primary transition-colors duration-250">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-purple-700 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold font-display">Theme Test Page</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Current: {theme}</span>
            <ThemeToggle variant="header" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Card */}
        <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-md dark:shadow-dark border border-gray-200 dark:border-dark-purple-700">
          <h2 className="text-xl font-semibold mb-4">Sample Card</h2>
          <p className="text-text-light-secondary dark:text-text-dark-secondary mb-4">
            This is how your content will look in both light and dark themes.
          </p>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-primary-600 dark:bg-dark-purple-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-dark-purple-600 transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-dark-bg-tertiary text-gray-800 dark:text-text-dark-primary rounded-lg hover:bg-gray-300 dark:hover:bg-dark-purple-700 transition-colors">
              Secondary Button
            </button>
          </div>
        </div>

        {/* Form Elements */}
        <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-md dark:shadow-dark border border-gray-200 dark:border-dark-purple-700">
          <h2 className="text-xl font-semibold mb-6">Form Elements</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-purple-600 rounded-lg bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                Email Input
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-purple-600 rounded-lg bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors"
              />
            </div>

            {/* Select Dropdown */}
            <div>
              <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                Select Option
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-dark-purple-600 rounded-lg bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors">
                <option value="">Choose an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </div>

            {/* Number Input */}
            <div>
              <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                Number Input
              </label>
              <input
                type="number"
                placeholder="Enter a number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-purple-600 rounded-lg bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Textarea */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
              Textarea
            </label>
            <textarea
              rows="4"
              placeholder="Enter your message here..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-purple-600 rounded-lg bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors resize-vertical"
            ></textarea>
          </div>

          {/* Radio Buttons */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-3">
              Radio Buttons
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="radio-group"
                  value="option1"
                  className="w-4 h-4 text-primary-600 dark:text-dark-purple-500 bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-purple-600 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-text-light-primary dark:text-text-dark-primary">
                  Option 1
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="radio-group"
                  value="option2"
                  className="w-4 h-4 text-primary-600 dark:text-dark-purple-500 bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-purple-600 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-text-light-primary dark:text-text-dark-primary">
                  Option 2
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="radio-group"
                  value="option3"
                  className="w-4 h-4 text-primary-600 dark:text-dark-purple-500 bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-purple-600 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-text-light-primary dark:text-text-dark-primary">
                  Option 3
                </span>
              </label>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-3">
              Checkboxes
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 dark:text-dark-purple-500 bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-purple-600 rounded focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-text-light-primary dark:text-text-dark-primary">
                  Subscribe to newsletter
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 dark:text-dark-purple-500 bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-purple-600 rounded focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-text-light-primary dark:text-text-dark-primary">
                  Accept terms and conditions
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 dark:text-dark-purple-500 bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-purple-600 rounded focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-text-light-primary dark:text-text-dark-primary">
                  Remember my preferences
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Different Toggle Variants */}
        <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-md dark:shadow-dark border border-gray-200 dark:border-dark-purple-700">
          <h2 className="text-xl font-semibold mb-4">Theme Toggle Variants</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">
                Default variant:
              </p>
              <ThemeToggle />
            </div>
            <div>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">
                Header variant:
              </p>
              <ThemeToggle variant="header" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
