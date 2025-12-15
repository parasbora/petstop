// routes/ProtectedRoutes.tsx
import { Navigate } from "react-router";
import { useGetMeQuery } from "@/api/authApi";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useGetMeQuery();
  
  if (isLoading) {
   
    return  (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;