// src/components/ui/Label.jsx
import { forwardRef } from 'react';

const Label = forwardRef(({ 
  className = '', 
  htmlFor,
  children,
  ...props 
}, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };


