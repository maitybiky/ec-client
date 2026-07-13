import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { checkoutSchema } from '../model/schema.js';
import { usePlaceOrder } from '../api/placeOrder.js';
import { detectAddress } from '../api/geocode.js';
import { useAddresses } from '@/entities/address';
import { Button, Input, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';
import { formatMoney } from '@/shared/lib/money.js';

function SavedAddressPicker({ addresses, selectedId, onSelect }) {
  return (
    <div className="space-y-2">
      {addresses.map((a) => (
        <label
          key={a._id}
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
            selectedId === a._id
              ? 'border-ink bg-surface-2'
              : 'border-line hover:border-muted'
          }`}
        >
          <input
            type="radio"
            name="savedAddress"
            className="mt-1"
            checked={selectedId === a._id}
            onChange={() => onSelect(a._id)}
          />
          <span>
            <span className="font-medium">{a.fullName}</span> · {a.phone}
            <br />
            <span className="text-muted">
              {a.line1}, {a.city}, {a.state} {a.postalCode}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

export function CheckoutForm({ payable }) {
  const navigate = useNavigate();
  const placeOrder = usePlaceOrder();
  const { data: addresses = [], isLoading: loadingAddresses } = useAddresses();

  const [mode, setMode] = useState(null); // null → auto: 'existing' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(checkoutSchema) });

  const hasSaved = addresses.length > 0;
  const activeMode = mode ?? (hasSaved ? 'existing' : 'new');
  const activeId = selectedId ?? addresses[0]?._id;

  const submitOrder = (shippingAddress) => {
    placeOrder.mutate(shippingAddress, {
      onSuccess: (order) =>
        navigate(`/orders/${order._id ?? order.id}`, {
          replace: true,
          state: { justPlaced: true },
        }),
    });
  };

  const onSubmitNew = (values) => submitOrder(values);

  const onSubmitExisting = () => {
    const a = addresses.find((x) => x._id === activeId);
    if (!a) return;
    const { fullName, phone, line1, city, state, postalCode } = a;
    submitOrder({ fullName, phone, line1, city, state, postalCode });
  };

  const handleDetect = async () => {
    setDetecting(true);
    setDetectError(null);
    try {
      const detected = await detectAddress();
      for (const [key, value] of Object.entries(detected)) {
        if (value) setValue(key, value, { shouldValidate: false });
      }
    } catch (err) {
      setDetectError(err.message);
    } finally {
      setDetecting(false);
    }
  };

  if (loadingAddresses) return <Spinner />;

  const payButton = (onClick, asSubmit = false) => (
    <Button
      type={asSubmit ? 'submit' : 'button'}
      onClick={onClick}
      className="w-full"
      disabled={placeOrder.isPending}
    >
      {placeOrder.isPending ? (
        <Spinner className="h-4 w-4" />
      ) : (
        `Pay now — ${formatMoney(payable)} (mock payment)`
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {hasSaved && (
        <div className="flex gap-1 rounded-lg bg-surface-2 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
              activeMode === 'existing' ? 'bg-surface shadow-sm' : 'text-muted'
            }`}
          >
            Saved addresses
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
              activeMode === 'new' ? 'bg-surface shadow-sm' : 'text-muted'
            }`}
          >
            New address
          </button>
        </div>
      )}

      {activeMode === 'existing' ? (
        <div className="space-y-4">
          <SavedAddressPicker
            addresses={addresses}
            selectedId={activeId}
            onSelect={setSelectedId}
          />
          {placeOrder.isError && (
            <p className="text-sm text-red-600">
              {apiErrorMessage(placeOrder.error)}
            </p>
          )}
          {payButton(onSubmitExisting)}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmitNew)} className="space-y-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDetect}
            disabled={detecting}
          >
            {detecting ? <Spinner className="h-4 w-4" /> : '📍 Use my location'}
          </Button>
          {detectError && (
            <p className="text-xs text-amber-700">
              {detectError} — please fill the address manually.
            </p>
          )}

          <Input
            label="Full name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Phone"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Address"
            error={errors.line1?.message}
            {...register('line1')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              error={errors.city?.message}
              {...register('city')}
            />
            <Input
              label="State"
              error={errors.state?.message}
              {...register('state')}
            />
          </div>
          <Input
            label="Postal code"
            error={errors.postalCode?.message}
            {...register('postalCode')}
          />

          {placeOrder.isError && (
            <p className="text-sm text-red-600">
              {apiErrorMessage(placeOrder.error)}
            </p>
          )}

          {payButton(undefined, true)}
        </form>
      )}

      <p className="text-center text-xs text-muted">
        Payment is simulated in this version — no real charge happens. Your
        address is saved for faster checkout next time.
      </p>
    </div>
  );
}
