import { useEffect } from 'react';
import { useGetHealthQuery } from '@/api/baseApi';
import { toast } from 'sonner';

export function HealthCheck() {
    const { isError } = useGetHealthQuery();

    useEffect(() => {
        if (isError) {
            toast.error('Backend Status: Down', {
                position: 'bottom-left',
                duration: 2000,
            });
        }
    }, [isError]);

    return null;
}
