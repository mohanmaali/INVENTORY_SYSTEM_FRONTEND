import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '0.5rem',
    border: state.isFocused ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    backgroundColor: 'white',
    padding: '2px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    minHeight: '42px',
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
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
    maxHeight: '250px',
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '0.375rem',
    padding: '8px 12px',
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    fontSize: '14px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
    fontSize: '14px',
  }),
};

const toCollection = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
};

function RemoteEntitySelect({
  value,
  onChange,
  fetcher,
  mapOption,
  placeholder,
  disabled = false,
  staticParams = {},
  searchParam = 'search',
  minSearchLength = 2,
  debounceMs = 300,
  excludeIds = [],
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  const loadOptions = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
        ...staticParams,
        ...(searchTerm ? { [searchParam]: searchTerm } : {}),
      };

      const response = await fetcher(params);
      const collection = toCollection(response);
      const mapped = collection
        .map(mapOption)
        .filter(Boolean)
        .filter((option) => option.value === value || !excludeIds.includes(option.value));

      setOptions(mapped);
    } catch (error) {
      console.error('Failed to load select options:', error);
      setOptions((current) => current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions('');
  }, [value, excludeIds.join('|')]);

  useEffect(() => {
    const query = inputValue.trim();
    const shouldQuery = query.length === 0 || query.length >= minSearchLength;
    if (!shouldQuery) return undefined;

    const timer = setTimeout(() => {
      loadOptions(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, minSearchLength]);

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={(selected) => onChange(selected ? selected.value : '', selected ? selected.data : null)}
      placeholder={loading ? 'Loading...' : placeholder}
      isDisabled={disabled}
      isSearchable
      isClearable
      styles={customStyles}
      onInputChange={(next, meta) => {
        if (meta.action === 'input-change') {
          setInputValue(next);
        }
        return next;
      }}
      noOptionsMessage={({ inputValue: query }) =>
        query.length > 0 && query.length < minSearchLength
          ? `Type at least ${minSearchLength} characters`
          : 'No options found'
      }
      loadingMessage={() => 'Loading...'}
      menuPosition="fixed"
      menuPortalTarget={typeof window === 'undefined' ? undefined : window.document.body}
      classNamePrefix="react-select"
    />
  );
}

export default RemoteEntitySelect;
