// app/(auth)/layout.tsx
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
  
<div className='flex gap-2'>
  <div>      {children}
  </div></div> 
 
    </div>
  );
}