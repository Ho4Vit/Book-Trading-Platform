import { useEffect, useState, useCallback } from "react";

export default function useFetch(apiCall, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiCall();
            setData(res);
            setError(null);
        } catch (err) {
            const message = err?.response?.data?.message || err.message || "Lỗi không xác định";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}
