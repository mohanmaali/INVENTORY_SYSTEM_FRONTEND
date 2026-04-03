import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaBox, FaBuilding, FaClipboard, FaEnvelope, FaMapMarkerAlt, FaPhone, FaPlus, FaTrash, FaUser, FaUserTie } from 'react-icons/fa';
import { Button, Card, ProductSelect, CustomerSelect, SupplierSelect } from '../../../components/ui';
import usePermissions from '../../../hooks/usePermissions';
import { createOrder, getOrderById, updateOrder } from '../../../services/orders';
import { formatOrderCurrency, getOrderTypeLabel, inputClasses } from '../orderConfig';

const createEmptyItem = () => ({ product: '', quantity: '1', unitPrice: '' });

const normalizeItemsForPayload = (items) => {
  const mergedItems = new Map();

  items.forEach((item) => {
    if (!item.product || !item.quantity || item.quantity < 1) {
      return;
    }

    const existingItem = mergedItems.get(item.product);
    if (existingItem) {
      existingItem.quantity += Number(item.quantity);
      if (item.unitPrice !== undefined) {
        existingItem.unitPrice = item.unitPrice;
      }
      return;
    }

    mergedItems.set(item.product, {
      product: item.product,
      quantity: Number(item.quantity),
      ...(item.unitPrice !== undefined ? { unitPrice: Number(item.unitPrice) } : {}),
    });
  });

  return Array.from(mergedItems.values());
};

const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;

  return [
    address?.street,
    address?.city,
    address?.state,
    address?.zipCode,
    address?.country,
  ]
    .filter(Boolean)
    .join(', ');
};

function OrderFormPage({ type, mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = usePermissions('orders');
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [items, setItems] = useState([createEmptyItem()]);
  const [supplierData, setSupplierData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [note, setNote] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(mode === 'edit');

  const listPath = type === 'purchase' ? '/orders/purchase' : '/orders/sales';
  const isEditMode = mode === 'edit';

  useEffect(() => {
    const canAccess = isEditMode ? permissions.canUpdate : permissions.canCreate;
    if (permissions.loading || !canAccess) {
      setLoadingData(false);
    } else {
      setLoadingData(false);
    }
  }, [permissions.loading, permissions.canCreate, permissions.canUpdate, isEditMode]);

  useEffect(() => {
    const loadExistingOrder = async () => {
      if (!isEditMode) {
        setLoadingOrder(false);
        return;
      }

      if (permissions.loading || !permissions.canUpdate) {
        setLoadingOrder(false);
        return;
      }

      setLoadingOrder(true);

      try {
        const order = await getOrderById(id);
        if (order?.status !== 'pending') {
          toast.error('Only pending orders can be edited.');
          navigate(`${listPath}/${id}`);
          return;
        }

        setItems(
          Array.isArray(order?.items) && order.items.length > 0
            ? order.items.map((item) => ({
                product: item.product?._id || item.product?.id || '',
                quantity: String(item.quantity ?? 1),
                unitPrice:
                  item.unitPrice === undefined || item.unitPrice === null
                    ? ''
                    : String(item.unitPrice),
              }))
            : [createEmptyItem()]
        );
        
        if (type === 'purchase' && order?.supplier) {
          setSupplierData(order.supplier);
        }
        
        if (type === 'sale') {
          const custData = order?.customerRecord || order?.customer;
          if (custData) {
            setCustomerData({
              ...custData,
              address: formatAddress(custData?.address),
            });
          }
        }
        setNote(order?.note || '');
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to load order';
        toast.error(message);
        navigate(listPath);
      } finally {
        setLoadingOrder(false);
      }
    };

    loadExistingOrder();
  }, [id, isEditMode, permissions.loading, permissions.canUpdate, navigate, listPath]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      return sum + (quantity * unitPrice);
    }, 0);
  }, [items]);

  const selectedProductIds = items.map((item) => item.product).filter(Boolean);

  const handleItemChange = (index, field, value, productData) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (field === 'product') {
          return {
            ...item,
            product: value,
            unitPrice: item.unitPrice === '' && productData ? String(productData.price ?? '') : item.unitPrice,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedItems = normalizeItemsForPayload(
      items
        .filter((item) => item.product)
        .map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          ...(item.unitPrice >= 0 ? { unitPrice: Number(item.unitPrice) } : {}),
        }))
    );

    if (normalizedItems.length === 0) return toast.error('Add at least one product to the order.');
    if (normalizedItems.some((item) => !item.product || !item.quantity || item.quantity < 1)) {
      return toast.error('Each order item must have a product and quantity.');
    }
    if (type === 'purchase' && !supplierData) return toast.error('Supplier is required for purchase orders.');
    if (type === 'sale' && !customerData) return toast.error('Customer is required for sales orders.');

    const payload = {
      items: normalizedItems,
      note: note.trim() || undefined,
      ...(type === 'purchase'
        ? { supplier: supplierData?._id || supplierData?.id }
        : { customerId: customerData?._id || customerData?.id }),
    };

    if (normalizedItems.length < items.filter((item) => item.product).length) {
      toast.success('Duplicate products were merged into a single line item.');
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        const updatedOrder = await updateOrder(id, payload);
        toast.success(`${getOrderTypeLabel(type)} updated successfully`);
        navigate(`${listPath}/${updatedOrder?._id || updatedOrder?.id || id}`);
      } else {
        const createdOrder = await createOrder({ type, ...payload });
        toast.success(`${getOrderTypeLabel(type)} created successfully`);
        navigate(`${listPath}/${createdOrder?._id || createdOrder?.id || ''}`);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${isEditMode ? 'update' : 'create'} order`;
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!permissions.loading && ((isEditMode && !permissions.canUpdate) || (!isEditMode && !permissions.canCreate))) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to {isEditMode ? 'update' : 'create'} orders.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {isEditMode
              ? type === 'purchase'
                ? 'Update Purchase Order'
                : 'Update Sales Order'
              : type === 'purchase'
                ? 'Add Purchase Order'
                : 'Add Sales Order'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            {isEditMode
              ? 'Edit pending order details and adjust the item list before confirmation.'
              : 'Create a new order with multiple products and partner details.'}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(listPath)}>Back to Order List</Button>
      </div>

      {loadingData || loadingOrder ? (
        <Card className="p-6"><p className="text-sm text-gray-500">Loading order form...</p></Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FaBox className="text-primary" />
                Order Items
              </h2>
              <p className="mt-1 text-sm text-gray-500">Add all products that belong to this order.</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold w-32">Quantity</th>
                    <th className="px-4 py-3 font-semibold w-40">Unit Price</th>
                    <th className="px-4 py-3 font-semibold w-40">Total</th>
                    <th className="px-4 py-3 font-semibold w-24">Stock</th>
                    <th className="px-4 py-3 font-semibold w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((item, index) => {
                    const quantity = Number(item.quantity || 0);
                    const unitPrice = Number(item.unitPrice || 0);
                    const subtotal = quantity * unitPrice;
                    return (
                    <tr key={`${index}-${item.product}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 min-w-[250px]">
                        <ProductSelect
                          value={item.product}
                          onChange={(value, productData) => handleItemChange(index, 'product', value, productData)}
                          placeholder="Select product"
                          excludeIds={selectedProductIds.filter((id, i) => i !== index)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min="1" value={item.quantity} onChange={(event) => handleItemChange(index, 'quantity', event.target.value)} className={inputClasses} placeholder="Qty" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => handleItemChange(index, 'unitPrice', event.target.value)} className={inputClasses} placeholder="Price" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{formatOrderCurrency(subtotal)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        -
                      </td>
                      <td className="px-4 py-3">
                        <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={() => setItems((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index))} disabled={items.length === 1}>
                          <FaTrash className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, createEmptyItem()])}>
                <span className="inline-flex items-center gap-2"><FaPlus className="h-3.5 w-3.5" />Add Item</span>
              </Button>
              <div className="rounded-lg bg-gray-100 px-4 py-2">
                <span className="text-sm text-gray-500">Estimated Total: </span>
                <span className="text-lg font-semibold text-gray-900">{formatOrderCurrency(totalAmount)}</span>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              {type === 'purchase' ? <FaBuilding className="text-primary" /> : <FaUserTie className="text-primary" />}
              {type === 'purchase' ? 'Supplier Details' : 'Customer Details'}
            </h2>
              <div className="mt-4">
              {type === 'purchase' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-800">Supplier</label>
                    <SupplierSelect
                      value={supplierData?._id || supplierData?.id || ''}
                      onChange={(value, supplier) => setSupplierData(supplier)}
                      placeholder="Select supplier"
                    />
                  </div>
                  {supplierData && (() => {
                    return (
                      <>
                        {(supplierData.phone || supplierData.contact) && (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <FaPhone className="text-gray-400" />
                            <span className="text-sm text-gray-700">{supplierData.phone || supplierData.contact}</span>
                          </div>
                        )}
                        {supplierData.email && (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <FaEnvelope className="text-gray-400" />
                            <span className="text-sm text-gray-700">{supplierData.email}</span>
                          </div>
                        )}
                        {supplierData.address && (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-2">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {typeof supplierData.address === 'string' ? supplierData.address : 
                                [supplierData.address?.street, supplierData.address?.city, supplierData.address?.state, supplierData.address?.zipCode].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-800">Customer</label>
                    <CustomerSelect
                      value={customerData?._id || customerData?.id || ''}
                      onChange={(value, customer) =>
                        setCustomerData(
                          customer
                            ? {
                                ...customer,
                                address: formatAddress(customer.address),
                              }
                            : null
                        )
                      }
                      placeholder="Select customer"
                    />
                  </div>
                  {customerData && (() => {
                    return (
                      <>
                        {customerData.name && (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <FaUser className="text-gray-400" />
                            <span className="text-sm text-gray-700">{customerData.name}</span>
                          </div>
                        )}
                        {(customerData.phone || customerData.contact) && (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <FaPhone className="text-gray-400" />
                            <span className="text-sm text-gray-700">{customerData.phone || customerData.contact}</span>
                          </div>
                        )}
                        {customerData.email && (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <FaEnvelope className="text-gray-400" />
                            <span className="text-sm text-gray-700">{customerData.email}</span>
                          </div>
                        )}
                        {customerData.address && (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-2">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span className="text-sm text-gray-700">{customerData.address}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FaClipboard className="text-primary" />
              Order Note
            </h2>
            <div className="mt-4">
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} className={`${inputClasses} resize-none`} placeholder="Add any internal note for this order" />
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate(listPath)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? isEditMode
                  ? 'Updating Order...'
                  : 'Creating Order...'
                : isEditMode
                  ? 'Update Order'
                  : 'Create Order'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default OrderFormPage;
