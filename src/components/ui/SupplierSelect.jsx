import RemoteEntitySelect from './RemoteEntitySelect';
import { getSuppliers } from '../../services/suppliers';

function SupplierSelect({
  value,
  onChange,
  placeholder = 'Search and select supplier...',
  disabled = false,
}) {
  return (
    <RemoteEntitySelect
      value={value}
      onChange={onChange}
      fetcher={getSuppliers}
      mapOption={(supplier) => ({
        value: supplier._id || supplier.id,
        label: supplier.name,
        data: supplier,
      })}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

export default SupplierSelect;