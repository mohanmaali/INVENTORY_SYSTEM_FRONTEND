import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Button, Modal } from '../../../components/ui';
import { createOrder } from '../../../services/orders';
import {
  formatOrderCurrency,
  getOrderTypeLabel,
  inputClasses,
} from '../orderConfig';

const createEmptyItem = () => ({
  product: '',
  quantity: '1',
  unitPrice: '',
});

function OrderFormModal({
  isOpen,
  onClose,
  type,
  products,
  suppliers,
  onCreated,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([createEmptyItem()]);
  const [supplier, setSupplier] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
  });
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setItems([createEmptyItem()]);
      setSupplier('');
      setCustomer({ name: '', contact: '', email: '', address: '' });
      setNote('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product._id || product.id, product])),
    [products]
  );

  const itemsWithTotals = useMemo(
    () =>
      items.map((item) => {
        const product = productMap.get(item.product);
        const unitPrice =
          item.unitPrice === '' || Number.isNaN(Number(item.unitPrice))
            ? Number(product?.price || 0)
            : Number(item.unitPrice);
        const quantity = Number(item.quantity || 0);

        return {
          ...item,
          productData: product,
          unitPrice,
          quantity,
          subtotal: unitPrice * quantity,
        };
      }),
    [items, productMap]
  );

  const totalAmount = itemsWithTotals.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  const handleItemChange = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'product') {
          const selectedProduct = productMap.get(value);
          return {
            ...item,
            product: value,
            unitPrice:
              item.unitPrice === '' && selectedProduct
                ? String(selectedProduct.price ?? '')
                : item.unitPrice,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleCustomerChange = (field, value) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedItems = itemsWithTotals
      .filter((item) => item.product)
      .map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        ...(item.unitPrice >= 0 ? { unitPrice: Number(item.unitPrice) } : {}),
      }));

    if (normalizedItems.length === 0) {
      toast.error('Add at least one product to the order.');
      return;
    }

    if (normalizedItems.some((item) => !item.product || !item.quantity || item.quantity < 1)) {
      toast.error('Each order item must have a product and quantity.');
      return;
    }

    if (type === 'purchase' && !supplier) {
      toast.error('Supplier is required for purchase orders.');
      return;
    }

    if (type === 'sale' && !customer.name.trim()) {
      toast.error('Customer name is required for sales orders.');
      return;
    }

    const payload = {
      type,
      items: normalizedItems,
      note: note.trim() || undefined,
      ...(type === 'purchase'
        ? { supplier }
        : {
            customer: {
              name: customer.name.trim(),
              contact: customer.contact.trim() || undefined,
              email: customer.email.trim() || undefined,
              address: customer.address.trim() || undefined,
            },
          }),
    };

    setSubmitting(true);

    try {
      const createdOrder = await createOrder(payload);
      toast.success(`${getOrderTypeLabel(type)} created successfully`);
      onCreated(createdOrder);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to create order';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={submitting ? () => {} : onClose} className="max-w-5xl">
      <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Create {getOrderTypeLabel(type)}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add one or more products and capture the order details in a single flow.
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Order Items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select products, quantity, and the price snapshot for this order.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, createEmptyItem()])}>
                <span className="inline-flex items-center gap-2">
                  <FaPlus className="h-3.5 w-3.5" />
                  Add Item
                </span>
              </Button>
            </div>

            <div className="space-y-4">
              {itemsWithTotals.map((item, index) => (
                <div key={`${index}-${item.product}`} className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_140px_160px_auto]">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-800">Product</label>
                      <select
                        value={item.product}
                        onChange={(event) => handleItemChange(index, 'product', event.target.value)}
                        className={inputClasses}
                      >
                        <option value="">Select product</option>
                        {products.map((product) => {
                          const productId = product._id || product.id;
                          return (
                            <option key={productId} value={productId}>
                              {product.name} ({product.sku || 'No SKU'})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-800">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                        className={inputClasses}
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-800">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) => handleItemChange(index, 'unitPrice', event.target.value)}
                        className={inputClasses}
                        placeholder="Use product price"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="inline-flex items-center gap-2"
                        onClick={() =>
                          setItems((current) =>
                            current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        disabled={items.length === 1}
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-1 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
                    <span>
                      Available stock: {item.productData?.quantity ?? '-'} {item.productData?.unit || 'pcs'}
                    </span>
                    <span className="font-medium text-gray-900">
                      Line total: {formatOrderCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <p className="text-sm text-gray-500">Estimated total</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatOrderCurrency(totalAmount)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {type === 'purchase' ? 'Supplier Details' : 'Customer Details'}
              </h3>
            </div>

            {type === 'purchase' ? (
              <div className="max-w-xl">
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Supplier
                </label>
                <select
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                  className={inputClasses}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplierItem) => {
                    const supplierId = supplierItem._id || supplierItem.id;
                    return (
                      <option key={supplierId} value={supplierId}>
                        {supplierItem.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-800">
                    Customer name
                  </label>
                  <input
                    value={customer.name}
                    onChange={(event) => handleCustomerChange('name', event.target.value)}
                    className={inputClasses}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-800">
                    Contact number
                  </label>
                  <input
                    value={customer.contact}
                    onChange={(event) => handleCustomerChange('contact', event.target.value)}
                    className={inputClasses}
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-800">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(event) => handleCustomerChange('email', event.target.value)}
                    className={inputClasses}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-800">
                    Delivery address
                  </label>
                  <input
                    value={customer.address}
                    onChange={(event) => handleCustomerChange('address', event.target.value)}
                    className={inputClasses}
                    placeholder="Enter delivery address"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <label className="mb-1.5 block text-sm font-medium text-gray-800">Order Note</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className={`${inputClasses} resize-none`}
              placeholder="Add any internal note for this order"
            />
          </section>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default OrderFormModal;
