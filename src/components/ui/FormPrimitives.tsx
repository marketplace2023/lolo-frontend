import { cn } from "@/utils/cn";

interface IFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, required, error, children, hint }: IFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: IInputProps) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 rounded-lg bg-input border text-sm text-foreground",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
        error ? "border-destructive focus:ring-destructive/30" : "border-border",
        className
      )}
      {...props}
    />
  );
}

interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ className, error, children, ...props }: ISelectProps) {
  return (
    <select
      className={cn(
        "w-full px-3 py-2 rounded-lg bg-input border text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
        error ? "border-destructive" : "border-border",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}

export function Button({ className, variant = "primary", size = "md", loading, children, disabled, ...props }: IButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "hover:bg-accent text-foreground",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5",
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
