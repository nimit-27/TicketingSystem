
import { useCallback, useState, useTransition } from "react";
import { useSnackbar } from "../context/SnackbarContext";

interface UseApiResponse<R> {
    data: R | null;
    pending: boolean;
    error: string | null;
    success: boolean;
    apiHandler: (apiCall: () => Promise<any>) => Promise<R>;
}

export const useApi = <R,>(): UseApiResponse<R> => {
    const [data, setData] = useState<R | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const [success, setSuccess] = useState<boolean>(false);

    const { showMessage } = useSnackbar();

    const apiHandler = useCallback((apiCall: () => Promise<any>): Promise<R> => {
        return new Promise((resolve) => {
            startTransition(() => {
                apiCall()
                    .then((response: any) => {
                        const rawPayload = response?.data ?? response;
                        const resp: any = rawPayload?.body ?? rawPayload;
                        const successFlag = typeof resp?.success === 'boolean' ? resp.success : true;

                        if (successFlag) {
                            const payload = resp && typeof resp === 'object' && 'data' in resp
                                ? (resp.data ?? null)
                                : resp ?? null;
                            setError(null);
                            setData(payload as R | null);
                            setSuccess(true);
                            resolve((payload ?? null) as R);
                        } else {
                            const message = resp?.error?.message || 'Something went wrong';
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

    return { data, pending, error, success, apiHandler };
};
