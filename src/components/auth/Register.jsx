import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Constants
const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_LENGTH: 10,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PHONE_REGEX: /^[0-9]{10}$/,
};

const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
};

const Register = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone1: "",
    phone2: "",
    password: "",
    confirmPassword: "",
    role: ROLES.STUDENT,
    class: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Hooks
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear errors when component mounts or form changes
  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [formData, clearError]);

  // Check form validity
  useEffect(() => {
    const hasErrors = Object.keys(validationErrors).length > 0;
    const hasRequiredFields =
      formData.name &&
      formData.email &&
      formData.phone1 &&
      formData.password &&
      formData.confirmPassword &&
      (formData.role !== ROLES.STUDENT || formData.class);
    setIsFormValid(!hasErrors && hasRequiredFields);
  }, [formData, validationErrors]);

  // Utility functions
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    return phoneNumber.slice(0, 10); // Limit to 10 digits
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return {
      score,
      label: ["Very Weak", "Weak", "Fair", "Good", "Strong"][score],
    };
  };

  // Validation functions
  const validateField = useCallback(
    (name, value) => {
      const errors = {};

      switch (name) {
        case "name":
          if (!value.trim()) {
            errors.name = "Name is required";
          } else if (value.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
            errors.name = `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
          }
          break;

        case "email":
          if (!value) {
            errors.email = "Email is required";
          } else if (!VALIDATION_RULES.EMAIL_REGEX.test(value)) {
            errors.email = "Please enter a valid email address";
          }
          break;

        case "phone1":
          if (!value) {
            errors.phone1 = "Primary phone number is required";
          } else if (!VALIDATION_RULES.PHONE_REGEX.test(value)) {
            errors.phone1 = "Phone number must be 10 digits";
          }
          break;

        case "phone2":
          if (value && !VALIDATION_RULES.PHONE_REGEX.test(value)) {
            errors.phone2 = "Phone number must be 10 digits";
          }
          break;

        case "password":
          if (!value) {
            errors.password = "Password is required";
          } else if (value.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
            errors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
          } else if (!VALIDATION_RULES.PASSWORD_REGEX.test(value)) {
            errors.password =
              "Password must contain uppercase, lowercase, and number";
          }
          break;

        case "confirmPassword":
          if (!value) {
            errors.confirmPassword = "Please confirm your password";
          } else if (formData.password !== value) {
            errors.confirmPassword = "Passwords do not match";
          }
          break;

        case "class":
          if (formData.role === ROLES.STUDENT && !value.trim()) {
            errors.class = "Class is required for students";
          }
          break;

        default:
          break;
      }

      return errors;
    },
    [formData.password, formData.role]
  );

  const validateForm = () => {
    const allErrors = {};

    Object.keys(formData).forEach((field) => {
      const fieldErrors = validateField(field, formData[field]);
      Object.assign(allErrors, fieldErrors);
    });

    setValidationErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Format phone numbers
    if (name === "phone1" || name === "phone2") {
      processedValue = formatPhoneNumber(value);
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear specific field error and validate
    const fieldErrors = validateField(name, processedValue);
    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return { ...updated, ...fieldErrors };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for registration
    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      phone1: formData.phone1,
      phone2: formData.phone2 || undefined,
      password: formData.password,
      role: formData.role,
      ...(formData.role === ROLES.STUDENT && { class: formData.class.trim() }),
    };

    try {
      const result = await register(registrationData);

      if (result.success) {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  // Component render helpers
  const renderPasswordStrength = () => {
    if (!formData.password) return null;

    const { score, label } = getPasswordStrength(formData.password);
    const colors = [
      "bg-red-500",
      "bg-red-400",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return (
      <div className="mt-2">
        <div className="flex space-x-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                i < score ? colors[score - 1] : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-600">Strength: {label}</p>
      </div>
    );
  };

  const renderInput = ({
    id,
    name,
    type = "text",
    label,
    required = false,
    placeholder,
    autoComplete,
    children,
    helpText,
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={formData[name]}
          onChange={handleChange}
          className={`appearance-none block w-full px-3 py-2 border ${
            validationErrors[name]
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
            children ? "pr-10" : ""
          }`}
          placeholder={placeholder}
          aria-describedby={
            validationErrors[name] ? `${name}-error` : undefined
          }
          aria-invalid={validationErrors[name] ? "true" : "false"}
        />
        {children}
      </div>
      {validationErrors[name] && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {validationErrors[name]}
        </p>
      )}
      {helpText && !validationErrors[name] && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );

  const renderPasswordToggle = (isVisible, toggleFn) => (
    <button
      type="button"
      onClick={toggleFn}
      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 focus:outline-none focus:text-gray-600"
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? (
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our learning platform today
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-md p-4"
                role="alert"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Name Field */}
            {renderInput({
              id: "name",
              name: "name",
              label: "Full Name",
              required: true,
              placeholder: "Enter your full name",
              autoComplete: "name",
            })}

            {/* Email Field */}
            {renderInput({
              id: "email",
              name: "email",
              type: "email",
              label: "Email Address",
              required: true,
              placeholder: "Enter your email",
              autoComplete: "email",
            })}

            {/* Phone Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                {renderInput({
                  id: "phone1",
                  name: "phone1",
                  type: "tel",
                  label: "Primary Phone",
                  required: true,
                  placeholder: "1234567890",
                })}
              </div>
              <div>
                {renderInput({
                  id: "phone2",
                  name: "phone2",
                  type: "tel",
                  label: "Secondary Phone",
                  placeholder: "0987654321",
                })}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                I am a <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  required
                >
                  <option value={ROLES.STUDENT}>Student</option>
                  <option value={ROLES.ADMIN}>Administrator</option>
                </select>
              </div>
            </div>

            {/* Class Field (for students only) */}
            {formData.role === ROLES.STUDENT &&
              renderInput({
                id: "class",
                name: "class",
                label: "Class",
                required: true,
                placeholder: "e.g., 10A, 12B, Grade 9",
              })}

            {/* Password Field */}
            <div>
              {renderInput({
                id: "password",
                name: "password",
                type: showPassword ? "text" : "password",
                label: "Password",
                required: true,
                placeholder: "Create a strong password",
                autoComplete: "new-password",
                helpText:
                  "Must contain uppercase, lowercase, and number. At least 6 characters.",
                children: renderPasswordToggle(showPassword, () =>
                  setShowPassword(!showPassword)
                ),
              })}
              {renderPasswordStrength()}
            </div>

            {/* Confirm Password Field */}
            {renderInput({
              id: "confirmPassword",
              name: "confirmPassword",
              type: showConfirmPassword ? "text" : "password",
              label: "Confirm Password",
              required: true,
              placeholder: "Re-enter your password",
              autoComplete: "new-password",
              children: renderPasswordToggle(showConfirmPassword, () =>
                setShowConfirmPassword(!showConfirmPassword)
              ),
            })}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                  isLoading || !isFormValid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
