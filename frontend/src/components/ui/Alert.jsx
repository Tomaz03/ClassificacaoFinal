// src/components/ui/Alert.jsx
import { forwardRef } from 'react';

const Alert = forwardRef(({ className = '', variant = 'default', children, ...props }, ref) => {
  const baseClasses = 'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground';
  
  const variants = {
    default: 'bg-background text-foreground',
    destructive:
      'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Alert.displayName = 'Alert';

const AlertDescription = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    />
  );
});

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };