// src/components/ui/Button.jsx
export function Button({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      {...props}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition ${className}`}
    >
      {children}
    </button>
  );
}