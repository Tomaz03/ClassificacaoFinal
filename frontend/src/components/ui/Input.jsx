// src/components/ui/Input.jsx
export function Input({ value, onChange, placeholder, required, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  );
}

// Adicione esta exportação padrão
export default Input;