import React from 'react';
import { Field, ErrorMessage } from 'formik';

interface TextInputProps {
  label: string;
  name: string;
  type?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, name, type = 'text' }) => {
  return (
    <>
      <label htmlFor={name}>{label}:</label>
      <Field type={type} name={name} />
      <ErrorMessage className="field-error" name={name} component="span" />
    </>
  );
};

export default TextInput;