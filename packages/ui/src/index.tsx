import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. Elegant Button with hover micro-animations and vibrant gradient accents
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          // Variants
          variant === 'primary' && "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110",
          variant === 'secondary' && "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 hover:text-white border border-neutral-700",
          variant === 'outline' && "border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white",
          variant === 'ghost' && "bg-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100",
          variant === 'danger' && "bg-red-600 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25",
          // Sizes
          size === 'sm' && "px-3 py-1.5 text-sm",
          size === 'md' && "px-5 py-2.5 text-base",
          size === 'lg' && "px-7 py-3 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// 2. Glassmorphic Card for dark modern UI
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md p-6 text-neutral-100 shadow-xl transition-all duration-300",
          hoverEffect && "hover:border-neutral-700 hover:shadow-2xl hover:shadow-indigo-500/5",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// 3. Custom Input with glowing borders
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-sm font-medium text-neutral-400">{label}</label>}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <span className="block text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
