import { useGetMeQuery } from "@/api/authApi";

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const { isLoading } = useGetMeQuery();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
};
