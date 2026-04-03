import RemoteEntitySelect from './RemoteEntitySelect';
import { getCustomers } from '../../services/customers';

function CustomerSelect({
  value,
  onChange,
  placeholder = 'Search and select customer...',
  disabled = false,
}) {
  return (
    <RemoteEntitySelect
      value={value}
      onChange={onChange}
      fetcher={getCustomers}
      mapOption={(customer) => ({
        value: customer._id || customer.id,
        label: `${customer.name} (${customer.customerCode || customer.phone || 'No code'})`,
        data: customer,
      })}
      placeholder={placeholder}
      disabled={disabled}
      staticParams={{ status: 'active' }}
    />
  );
}

export default CustomerSelect;