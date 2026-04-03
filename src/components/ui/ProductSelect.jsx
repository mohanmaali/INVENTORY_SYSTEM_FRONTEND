import RemoteEntitySelect from './RemoteEntitySelect';
import { getProducts } from '../../services/products';

function ProductSelect({
  value,
  onChange,
  placeholder = 'Search and select product...',
  disabled = false,
  excludeIds = [],
}) {
  return (
    <RemoteEntitySelect
      value={value}
      onChange={onChange}
      fetcher={getProducts}
      mapOption={(product) => ({
        value: product._id || product.id,
        label: `${product.name} (${product.sku || 'No SKU'})`,
        data: product,
      })}
      placeholder={placeholder}
      disabled={disabled}
      staticParams={{ status: 'active' }}
      excludeIds={excludeIds}
    />
  );
}

export default ProductSelect;