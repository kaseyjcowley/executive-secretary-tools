import { type ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

export function Table({
  children,
  className = "",
  striped = false,
  hoverable = false,
  bordered = false,
  compact = false,
}: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={`table ${striped ? "table-striped" : ""} ${
          hoverable ? "table-hover" : ""
        } ${bordered ? "table-bordered" : ""} ${compact ? "table-xs" : ""} ${className}`}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = "" }: TableHeadProps) {
  return <thead className={className}>{children}</thead>;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  selected?: boolean;
}

export function TableRow({
  children,
  className = "",
  selected = false,
}: TableRowProps) {
  return (
    <tr className={`${selected ? "active" : ""} ${className}`}>{children}</tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={className}>{children}</td>;
}
