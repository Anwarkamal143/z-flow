import { FieldError } from "@/components/ui/field";
import { useFormContext } from "react-hook-form";

function FieldErrorC({
  name,
  className
}: {
  name: string;
  className?: string;
}) {
  // the useFormContext hook returns the current state of hook form.
  const {
    formState: { errors }
  } = useFormContext();

  if (!name) return null;

  const error = errors[name];
  if (!error) return null;

  return (
    <FieldError className={`text-red-500 ${className}`}>
      {error.message as any}
    </FieldError>
  );
}
export default FieldErrorC;
