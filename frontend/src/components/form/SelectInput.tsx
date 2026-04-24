import React from 'react';
import { Field, ErrorMessage } from 'formik';

interface SelectInputProps {
    label: string;
    name: string;
    options: { value: number | null; label: string }[];
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, name, options }) => {
  const displayLabel = (name: string) => {
    if (!name) {
      return null;
    } else {
      <label htmlFor={name}>{label}:</label>
    }
  }

    return (
        <>
            {displayLabel(name)}
            <Field as="select" name={name}>
                {options.map((option, index) => (
                    <option key={option.value ?? `null-${index}`} value={option.value ?? ""}>
                        {option.label}
                    </option>
                ))}
            </Field>
            <ErrorMessage className="field-error" name={name} component="span" />
        </>
    );
};

export default SelectInput;
