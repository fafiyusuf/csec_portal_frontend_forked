import { cn } from "@/lib/utils"
import React from "react"

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-800">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden">
          <table ref={ref} className={cn("w-full divide-y divide-gray-200 dark:divide-gray-800", className)} {...props} />
        </div>
      </div>
    </div>
  ),
)
Table.displayName = "Table"

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("bg-gray-50 dark:bg-gray-800/50", className)} {...props} />
  ),
)
TableHeader.displayName = "TableHeader"

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900", className)} {...props} />
  ),
)
TableBody.displayName = "TableBody"

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors", className)} {...props} />
  ),
)
TableRow.displayName = "TableRow"

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap",
        className
      )}
      {...props}
    />
  ),
)
TableHead.displayName = "TableHead"

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap",
        className
      )}
      {...props}
    />
  ),
)
TableCell.displayName = "TableCell"