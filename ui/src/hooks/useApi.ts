import { useCallback, useState, useTransition } from "react";

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
    const [pending, startTransition] = useTransition();
    const [success, setSuccess] = useState<boolean>(false);

    const apiHandler = useCallback((apiCall: () => Promise<R>): Promise<R> => {
        return new Promise((resolve, reject) => {
            startTransition(() => {
                apiCall()
                    .then((response: any) => {
                        if(response.status !== 200) throw new Error("Something went wrong")
                        setData(response.data.response || response.data);
                        resolve(response.data.response  || response.data);
                        setSuccess(true);
                    }).catch((err) => {
                        console.error(err)
                        setError(err);
                        reject(err);
                        setSuccess(false);
                    })
            })
        })
    }, [])

    return { data, pending, error, success, apiHandler }

}