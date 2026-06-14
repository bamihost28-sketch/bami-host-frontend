# Skeleton Loader Components

This directory contains reusable skeleton loader components for various UI patterns in the application.

## Components

### Basic Components

#### `Skeleton`
The base skeleton component (from shadcn/ui).

#### `TableSkeleton`
Skeleton for table layouts with customizable rows, columns, and headers.

```tsx
import { TableSkeleton } from "@/components/ui/skeletons";

// Basic usage
<TableSkeleton rows={5} columns={4} />

// With predefined headers
<TableSkeleton 
  rows={5} 
  columns={4} 
  headers={["Name", "Email", "Status", "Actions"]} 
/>
```

#### `CardSkeleton`
Skeleton for card layouts with optional header and description.

```tsx
import { CardSkeleton } from "@/components/ui/skeletons";

// Basic card
<CardSkeleton />

// Card with custom content lines
<CardSkeleton contentLines={5} />

// Card without header
<CardSkeleton showHeader={false} />
```

### Dashboard Components

#### `EstateManagementSkeleton`
Specific skeleton for the Estate Management page.

```tsx
import { EstateManagementSkeleton } from "@/components/ui/skeletons";

// In your component
if (isLoading) {
  return <EstateManagementSkeleton />;
}
```

#### `DashboardPageSkeleton`
Generic skeleton for dashboard pages with header, cards, and table.

```tsx
import { DashboardPageSkeleton } from "@/components/ui/skeletons";

// Generic dashboard loading state
if (isLoading) {
  return <DashboardPageSkeleton />;
}
```

#### `ListItemSkeleton`
Skeleton for list items with avatar, content, and actions.

```tsx
import { ListItemSkeleton } from "@/components/ui/skeletons";

// Show 5 skeleton items
<ListItemSkeleton count={5} />
```

#### `FormSkeleton`
Skeleton for forms with labels, inputs, and buttons.

```tsx
import { FormSkeleton } from "@/components/ui/skeletons";

// Form with 4 fields
<FormSkeleton fields={4} />
```

## Usage Examples

### In a query-based component:

```tsx
import { useGetUsersQuery } from "@/services/api";
import { TableSkeleton } from "@/components/ui/skeletons";

export const UsersList = () => {
  const { data: users, isLoading } = useGetUsersQuery();

  if (isLoading) {
    return (
      <TableSkeleton 
        rows={10} 
        columns={5} 
        headers={["Name", "Email", "Role", "Status", "Actions"]}
      />
    );
  }

  return (
    // Your actual content
  );
};
```

### In a dashboard component:

```tsx
import { DashboardPageSkeleton } from "@/components/ui/skeletons";

export const MyDashboard = () => {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    // Your dashboard content
  );
};
```

## Customization

All skeleton components accept className props and can be customized using Tailwind CSS classes:

```tsx
<CardSkeleton className="bg-slate-100" />
<TableSkeleton rows={3} className="border-2" />
```