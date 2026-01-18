
import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { DEFAULT_PROMPTS } from '../constants';

interface UserFormProps {
  initialData?: UserData | null;
  onSubmit: (data: UserData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  existingUsers: string[];
}

interface FormErrors {
  user?: string;
  pass?: string;
  textprompt?: string;
  imageprompt?: string;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting, existingUsers }) => {
  const [formData, setFormData] = useState<UserData>({
    user: '',
    pass: '',
    textprompt: DEFAULT_PROMPTS.TEXT,
    imageprompt: DEFAULT_PROMPTS.IMAGE,
    type: '1'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        pass: '' // Always clear password field for editing for security/UI clarity
      });
    }
  }, [initialData]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'user':
        if (!initialData) {
          if (!value) return 'Username is required';
          if (value.length < 3) return 'Username must be at least 3 characters';
          if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores allowed';
          if (existingUsers.includes(value)) return 'This username is already taken';
        }
        break;
      case 'pass':
        if (!initialData && !value) return 'Password is required for new users';
        if (value && value.length < 6) return 'Password must be at least 6 characters';
        break;
      case 'textprompt':
        if (!value) return 'Text prompt is required';
        if (value.length < 20) return 'Prompt is too short (min 20 chars)';
        break;
      case 'imageprompt':
        if (!value) return 'Image prompt is required';
        if (value.length < 20) return 'Prompt is too short (min 20 chars)';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if already touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {
      user: validateField('user', formData.user),
      pass: validateField('pass', formData.pass || ''),
      textprompt: validateField('textprompt', formData.textprompt),
      imageprompt: validateField('imageprompt', formData.imageprompt),
    };

    setErrors(newErrors);
    setTouched({ user: true, pass: true, textprompt: true, imageprompt: true });

    const hasErrors = Object.values(newErrors).some(error => error !== undefined);
    if (!hasErrors) {
      onSubmit(formData);
    }
  };

  const isInvalid = Object.values(errors).some(error => error !== undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
            Username
            {touched.user && !errors.user && formData.user && (
              <span className="text-green-500 flex items-center text-xs">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Available
              </span>
            )}
          </label>
          <input
            type="text"
            name="user"
            value={formData.user}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!!initialData}
            required
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${
              errors.user && touched.user 
                ? 'border-red-500 focus:ring-red-100 focus:border-red-500' 
                : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-400'
            } ${initialData ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
            placeholder="e.g., user_001"
          />
          {errors.user && touched.user && (
            <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.user}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="pass"
            value={formData.pass || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${
              errors.pass && touched.pass 
                ? 'border-red-500 focus:ring-red-100 focus:border-red-500' 
                : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-400'
            }`}
            placeholder={initialData ? "Leave empty to keep current" : "Minimum 6 characters"}
          />
          {errors.pass && touched.pass && (
            <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.pass}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Text Processing Prompt</label>
        <textarea
          name="textprompt"
          value={formData.textprompt}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          rows={8}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition-all font-mono text-sm leading-relaxed ${
            errors.textprompt && touched.textprompt 
              ? 'border-red-500 focus:ring-red-100 focus:border-red-500' 
              : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-400'
          }`}
          placeholder="Define the bot's behavior and system instructions..."
        />
        {errors.textprompt && touched.textprompt && (
          <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.textprompt}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Image Processing Prompt</label>
        <textarea
          name="imageprompt"
          value={formData.imageprompt}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          rows={6}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition-all font-mono text-sm leading-relaxed ${
            errors.imageprompt && touched.imageprompt 
              ? 'border-red-500 focus:ring-red-100 focus:border-red-500' 
              : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-400'
          }`}
          placeholder="Define how the bot handles image inputs..."
        />
        {errors.imageprompt && touched.imageprompt && (
          <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.imageprompt}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (isInvalid && Object.keys(touched).length > 0)}
          className="px-8 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100 flex items-center"
        >
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {initialData ? 'Save Changes' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
