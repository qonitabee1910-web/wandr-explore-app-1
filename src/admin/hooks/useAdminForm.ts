/**
 * Admin Form Hook
 * Handles form state, validation, and submission
 * Provides a clean API for managing form state
 */

import { useState, useCallback } from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseAdminFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => ValidationError[] | Promise<ValidationError[]>;
}

export interface UseAdminFormReturn<T> {
  // Form state
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;

  // Form actions
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Record<string, string>) => void;

  // Utilities
  getFieldProps: (field: keyof T) => {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
  getFieldError: (field: keyof T) => string | undefined;
  isFieldTouched: (field: keyof T) => boolean;
  hasFieldError: (field: keyof T) => boolean;
}

/**
 * Hook for managing admin form state and validation
 *
 * Usage:
 * ```typescript
 * interface SignupForm {
 *   email: string;
 *   password: string;
 * }
 *
 * const { values, errors, handleChange, handleSubmit } = useAdminForm<SignupForm>({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => {
 *     await api.signup(values);
 *   },
 *   validate: (values) => {
 *     const errors: ValidationError[] = [];
 *     if (!values.email.includes('@')) {
 *       errors.push({ field: 'email', message: 'Invalid email' });
 *     }
 *     if (values.password.length < 8) {
 *       errors.push({ field: 'password', message: 'Password too short' });
 *     }
 *     return errors;
 *   },
 * });
 *
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <input {...getFieldProps('email')} />
 *     {errors.email && <span>{errors.email}</span>}
 *     <button type="submit">Submit</button>
 *   </form>
 * );
 * ```
 */
export function useAdminForm<T extends Record<string, any>>(
  options: UseAdminFormOptions<T>
): UseAdminFormReturn<T> {
  const { initialValues, onSubmit, validate } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is dirty (has changes)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Validate form
  const validateForm = useCallback(async (): Promise<Record<string, string>> => {
    if (!validate) return {};

    try {
      const validationErrors = await validate(values);
      const errorMap: Record<string, string> = {};

      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message;
      });

      return errorMap;
    } catch (err) {
      console.error('Validation error:', err);
      return {};
    }
  }, [values, validate]);

  // Set field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValuesState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Set field error
  const setFieldError = useCallback((field: string, error: string) => {
    setErrorsState((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((field: string, touched: boolean) => {
    setTouchedState((prev) => ({
      ...prev,
      [field]: touched,
    }));
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as any;
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setFieldValue(name, fieldValue);
    },
    [setFieldValue]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setFieldTouched(name, true);
    },
    [setFieldTouched]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        setIsSubmitting(true);

        // Validate
        const formErrors = await validateForm();
        setErrorsState(formErrors);

        if (Object.keys(formErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }

        // Submit
        await onSubmit(values);
      } catch (err) {
        console.error('Form submission error:', err);
        setFieldError('_form', err instanceof Error ? err.message : 'Submission failed');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, values]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
  }, [initialValues]);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  // Get field props
  const getFieldProps = useCallback(
    (field: keyof T) => ({
      name: String(field),
      value: values[field] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  // Get field error
  const getFieldError = useCallback(
    (field: keyof T) => errors[String(field)],
    [errors]
  );

  // Check if field is touched
  const isFieldTouched = useCallback(
    (field: keyof T) => touched[String(field)] || false,
    [touched]
  );

  // Check if field has error
  const hasFieldError = useCallback(
    (field: keyof T) => {
      const fieldName = String(field);
      return Boolean(errors[fieldName]) && touched[fieldName];
    },
    [errors, touched]
  );

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,

    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,

    getFieldProps,
    getFieldError,
    isFieldTouched,
    hasFieldError,
  };
}
