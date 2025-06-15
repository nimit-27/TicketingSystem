import { useCallback, useState } from "react";

interface UseApiResponse<R> {
    data: R | null;
    pending: boolean;
    error: String | null;
    success: boolean;
    apiHandler: (apiCall: () => Promise<R>) => Promise<R>;
}

export const useApi = <R,>(): UseApiResponse<R> => {
    const [data, setData] = useState<R | null>(null);
    const [error, setError] = useState<String | null>(null);
    const [pending, setPending] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const apiHandler = useCallback((apiCall: () => Promise<R>): Promise<R> => {
        setPending(true);
        setError(null);
        return apiCall()
            .then((response: any) => {
                if (response.status !== 200) throw new Error("Something went wrong");
                const resp = response.data.response || response.data;
                setData(resp);
                setSuccess(true);
                return resp;
            })
            .catch((err) => {
                console.error(err);
                setError(err);
                setSuccess(false);
                throw err;
            })
            .finally(() => setPending(false));
    }, []);

    return { data, pending, error, success, apiHandler }

}