import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-btn-gradient text-white shadow-gold-sm hover:shadow-gold hover:scale-105 active:scale-95",
      secondary: "bg-bg-tertiary border-2 border-gold-600 text-gold-300 hover:bg-gold-700/20 hover:border-gold-400 hover:scale-105 active:scale-95",
      danger: "bg-accent-red/80 text-white hover:bg-accent-red hover:scale-105 active:scale-95",
      ghost: "text-gold-400 hover:bg-gold-700/20 hover:text-gold-300",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
