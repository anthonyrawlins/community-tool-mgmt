'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  name: string;
  value?: string | number | boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  rows?: number;
  accept?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export function FormField({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  options = [],
  rows = 3,
  accept,
  min,
  max,
  step,
  pattern,
  onChange,
  onBlur,
  className = '',
  labelClassName = '',
  inputClassName = ''
}: FormFieldProps) {
  const baseInputClasses = `
    block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${inputClassName}
  `.trim();

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value as string || ''}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            onChange={onChange}
            onBlur={onBlur}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value as string || ''}
            required={required}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            className={baseInputClasses}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={value as boolean || false}
              required={required}
              disabled={disabled}
              onChange={onChange}
              onBlur={onBlur}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor={name} className={`ml-2 block text-sm text-gray-900 ${labelClassName}`}>
              {label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${name}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  required={required}
                  disabled={disabled}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value as string | number || ''}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            accept={accept}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            onChange={onChange}
            onBlur={onBlur}
            className={baseInputClasses}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={`space-y-1 ${className}`}>
        {renderInput()}
        {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}