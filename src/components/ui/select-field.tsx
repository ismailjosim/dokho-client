'use client';

import Select, { type SingleValue, type StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import type { SelectOption } from '@/lib/location-options';

type SelectFieldProps = {
  name: string;
  options: SelectOption[];
  value: SelectOption | null;
  placeholder: string;
  inputId?: string;
  isDisabled?: boolean;
  isCreatable?: boolean;
  onChange: (option: SelectOption | null) => void;
  onCreateOption?: (inputValue: string) => void;
};

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
    backgroundColor: 'var(--background)',
    borderRadius: 'var(--radius)',
    boxShadow: state.isFocused ? '0 0 0 2px color-mix(in oklch, var(--ring) 35%, transparent)' : 'none',
    ':hover': {
      borderColor: 'var(--ring)',
    },
  }),
  input: (base) => ({
    ...base,
    color: 'var(--foreground)',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 40,
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--primary)'
      : state.isFocused
        ? 'var(--secondary)'
        : 'var(--popover)',
    color: state.isSelected ? 'var(--primary-foreground)' : 'var(--popover-foreground)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--foreground)',
  }),
};

export function SelectField({
  name,
  options,
  value,
  placeholder,
  inputId,
  isDisabled,
  isCreatable,
  onChange,
  onCreateOption,
}: SelectFieldProps) {
  function handleChange(option: SingleValue<SelectOption>) {
    onChange(option ?? null);
  }

  const selectProps = {
    inputId,
    instanceId: inputId || name,
    options,
    value,
    onChange: handleChange,
    placeholder,
    isDisabled,
    isClearable: true,
    styles: selectStyles,
    noOptionsMessage: () => 'কোনো অপশন পাওয়া যায়নি',
  };

  return (
    <>
      {isCreatable ? (
        <CreatableSelect
          {...selectProps}
          formatCreateLabel={(inputValue) => `"${inputValue}" যোগ করুন`}
          onCreateOption={onCreateOption}
        />
      ) : (
        <Select {...selectProps} />
      )}
      <input type="hidden" name={name} value={value?.value || ''} />
    </>
  );
}
