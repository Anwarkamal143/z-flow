import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

function FieldHelperText({
  name,
  className,
  helperText
}: {
  name: string;
  className?: string;
  helperText?: ReactNode;
}) {
  // the useFormContext hook returns the current state of hook form.
  const {
    formState: { errors }
  } = useFormContext();
  if (!helperText) {
    return null;
  }
  if (!name) return null;

  const error = errors[name];

  if (error) return null;

  return (
    <span className={`field-helper-text text-xs ${className}`}>
      {helperText}
    </span>
  );
}
export default FieldHelperText;
