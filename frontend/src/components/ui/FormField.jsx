export default function FormField({ label, error, required, children }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}{required && <span className="text-brand-red ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
