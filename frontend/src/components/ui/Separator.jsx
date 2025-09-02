// src/components/ui/Separator.jsx
export function Separator({ className = '', orientation = 'horizontal', ...props }) {
  const orientationClass = orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full';
  return (
    <div
      className={`shrink-0 bg-border ${orientationClass} ${className}`}
      {...props}
    />
  );
}