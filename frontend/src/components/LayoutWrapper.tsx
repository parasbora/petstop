export default function LayoutWrapper({ children  }:any) {
  return (
    <div className="min-h-screen bg-top bg-no-repeat flex flex-col justify-between items-center px-4 md:px-10 pt-20 md:pt-24 pb-10">
      {/* Increased pt-4 → pt-20, pt-8 → pt-24 to account for navbar */}
      {children}
    </div>
  );
}