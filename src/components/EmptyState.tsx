// components/EmptyState.tsx
export default function EmptyState({ 
    title, 
    description, 
    action 
  }: {
    title: string;
    description: string;
    action?: React.ReactNode;
  }) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }