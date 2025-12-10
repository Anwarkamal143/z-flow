import { PlusIcon } from "@/assets/icons";
import Link from "next/link";
import ButtonLoader from "./ButtonLoader";

type EntityHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

export const EntityHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntityHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <ButtonLoader
          disabled={disabled || isCreating}
          isloading={isCreating}
          size={"sm"}
          onClick={onNew}
        >
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </ButtonLoader>
      )}
      {!onNew && newButtonHref && (
        <Link href={newButtonHref} prefetch>
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Link>
      )}
    </div>
  );
};

type EntityContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
};

export const EntityContainer = ({
  children,
  header,
  search,
  pagination,
}: EntityContainerProps) => {
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-xl w-full flex flex-col gap-y-8 h-full">
        {header}
        <div className="flex gap-y-4 h-full flex-col">
          {search}
          {children}
        </div>
      </div>
      {pagination}
    </div>
  );
};
