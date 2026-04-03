import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '0.5rem',
    border: state.isFocused ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    backgroundColor: 'white',
    padding: '2px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#d1d5db',
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: '6px 0',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '0.375rem',
    padding: '8px 12px',
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#f3f4f6'
      : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : '#f3f4f6',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
  }),
};

function SelectInput({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  name,
  label,
  error,
  className = '',
}) {
  const handleChange = (selectedOption) => {
    onChange(selectedOption ? selectedOption.value : '');
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        styles={customStyles}
        name={name}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default SelectInput;