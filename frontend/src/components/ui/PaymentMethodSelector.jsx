const PAYMENT_METHODS = [
  {
    value: "cash",
    label: "Cash",
    description: "Pay in person. Booking stays pending until admin confirms.",
    comingSoon: false,
  },
  {
    value: "esewa",
    label: "eSewa",
    description: "Pay online via eSewa. Booking confirmed instantly.",
    comingSoon: true,
  },
  {
    value: "khalti",
    label: "Khalti",
    description: "Pay online via Khalti. Booking confirmed instantly.",
    comingSoon: true,
  },
];

function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-app-text">Payment Method</p>
      <div className="grid gap-2">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = value === method.value;
          const isDisabled = method.comingSoon;

          return (
            <button
              key={method.value}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(method.value)}
              className={[
                "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                isSelected
                  ? "border-brand-primary bg-brand-primary/10 text-app-text"
                  : "border-app-border bg-app-surface-2 text-app-text-soft hover:border-brand-primary/40",
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer",
              ].join(" ")}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-current">
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-brand-primary" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {method.label}
                  {isDisabled && (
                    <span className="ml-2 text-xs font-normal text-app-text-muted">
                      (coming soon)
                    </span>
                  )}
                </p>
                <p className="text-xs text-app-text-muted">
                  {method.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentMethodSelector;
