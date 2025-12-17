import { PlusIcon, SearchIcon } from "@/assets/icons";
import Link from "next/link";
import ButtonLoader from "./button-loader";
import InputComponent from "./Input";

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
    <div className="p-4 md:px-10 md:py-6 h-full w-full">
      <div className="mx-auto  w-full flex flex-col gap-y-8 h-full flex-1">
        {header}
        <div className="flex gap-y-4 h-full flex-col">
          {search}
          {children}
        </div>
        {pagination}
      </div>
    </div>
  );
};

interface EntitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const EntitySearch = ({
  value,
  onChange,
  placeholder = "Search",
  error,
}: EntitySearchProps) => {
  return (
    <div className="left-3 top-1/2 -translate-y-1/2 text-muted-foreground ml-auto">
      <InputComponent
        className="max-w-[200px]"
        rightIcon={{
          Icon: <SearchIcon />,
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rounded={"xs"}
        error={error}
      />
    </div>
  );

  return null;
};
interface EntityPaginationProps {
  page: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  isNext?: boolean;
}

export const EntityPaination = ({
  page,
  totalPages = 0,
  onPageChange,
  disabled,
  isNext,
}: EntityPaginationProps) => {
  return (
    <div className="gap-x-2 flex items-center justify-between w-full">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page}
        {totalPages > 0 ? `of ${totalPages}` : ""}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <ButtonLoader
          disabled={disabled || page <= 1}
          variant={"outline"}
          size={"sm"}
          onClick={() => {
            if (page > 1) {
              onPageChange(Math.max(1, page - 1));
            }
          }}
        >
          Previous
        </ButtonLoader>
        <ButtonLoader
          disabled={disabled || !isNext}
          variant={"outline"}
          size={"sm"}
          onClick={() => {
            if (isNext) {
              onPageChange(page + 1);
            }
          }}
        >
          Next
        </ButtonLoader>
      </div>
    </div>
  );

  return null;
};
