
import { useCallback, useState, useTransition } from "react";
import { useSnackbar } from "../context/SnackbarContext";
import { ApiResponse } from "../types";

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

    const { showMessage } = useSnackbar();

    const apiHandler = useCallback((apiCall: () => Promise<any>): Promise<R> => {
        return new Promise((resolve) => {
            startTransition(() => {
                apiCall()
                    .then((response: any) => {
                        console.log(response)
                        const resp: ApiResponse<R> = response?.data?.body ?? response;

                        if (resp.success) {
                            setData(resp.data ?? null);
                            setSuccess(true);
                            resolve(resp.data as R);
                        } else {
                            const message = resp.error?.message || 'Something went wrong';
                            setError(message);
                            showMessage(message, 'error');
                            setData(null);
                            setSuccess(false);
                        }
                    })
                    .catch((err: any) => {
                        const message = err?.response?.data?.apiError?.message
                            || err?.response?.data?.body?.data?.message
                            || err?.response?.data?.message
                            || err?.message
                            || 'Something went wrong';
                        setError(message);
                        showMessage(message, 'error');
                        setData(null);
                        setSuccess(false);
                    });
            });
        });
    }, [showMessage])

    return { data, pending, error, success, apiHandler }

}