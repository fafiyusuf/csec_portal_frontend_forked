export const RuleCard = ({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: number;
}) => {
  return (
    <div className="border rounded-lg p-4 flex justify-between">
      <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-muted-foreground text-sm mb-2">{description}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{value}</span>
      </div>
      
    </div>
  );
};