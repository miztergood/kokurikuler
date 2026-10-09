import { ReactNode } from "react";

interface InputWrapperProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export function InputWrapper({ label, required, children }: InputWrapperProps) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-semibold mb-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
    </div>
  );
}
