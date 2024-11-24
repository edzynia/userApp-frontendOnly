import React, { useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { loginUser } from '../redux/authSlice';
import InputField from '../UI/InputField';
import FormWrapper from '../UI/FormWrapper';
import FormButton from '../UI/FormButton';
import {
  validateForm,
  emailValidation,
  requiredField,
} from '../utils/validationUtils';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, string>>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error messages for the current field
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
      form: '', // Clear global form error when editing
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const validationErrors = validateForm(formData, {
      email: emailValidation,
      password: requiredField,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const resultAction = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        }),
      );

      if (loginUser.fulfilled.match(resultAction)) {
        const userId = resultAction.payload.id;
        if (userId) {
          navigate(`/user/${userId}`);
        } else {
          setErrors({
            form: 'User ID not found in response. Login failed.',
          });
        }
      } else {
        setErrors({
          form: resultAction.payload || 'Login failed. Please try again.',
        });
      }
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'An unknown error occurred.',
      });
    }
  };

  const fields = [
    {
      label: 'Email',
      name: 'email',
      type: 'email',
      placeholder: 'Enter your email',
    },
    {
      label: 'Password',
      name: 'password',
      type: 'password',
      placeholder: 'Enter your password',
    },
  ];

  return (
    <FormWrapper title='Login' onSubmit={handleSubmit}>
      {fields.map((field) => (
        <InputField
          key={field.name}
          label={field.label}
          name={field.name}
          type={field.type}
          value={formData[field.name] || ''}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          error={errors[field.name] || ''}
        />
      ))}
      {/* Display errors */}
      {(error || errors.form) && (
        <div className='text-red-500 mt-2 text-sm text-left pl-4'>
          {error || errors.form}
        </div>
      )}
      <FormButton label='Login' loading={loading} disabled={loading} />
    </FormWrapper>
  );
};

export default LoginForm;
