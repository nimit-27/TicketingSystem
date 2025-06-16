import { useCallback, useState, useTransition } from "react";
import { useSnackbar } from "../context/SnackbarContext";

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

    const apiHandler = useCallback((apiCall: () => Promise<R>): Promise<R> => {

        // Do NOT add 'reject' parameter in the Promise. We are handling the errors here only.
        return new Promise((resolve) => {
            startTransition(() => {
                apiCall()
                    .then((response: any) => {
                        console.log(response)
                        const status = response?.status;
                        const data = response?.data ?? response;

                        if (status && status !== 200) {
                            throw new Error("Something went wrong");
                        }
                        setData(data?.response ?? data);
                        setSuccess(true);
                        resolve(data?.response ?? data);
                    }).catch((err) => {
                        console.error(err)
                        const message = err?.message || 'Something went wrong';
                        setError(err);
                        showMessage(message, 'error');
                        setData(null);
                        setSuccess(false);
                    })
            })
        })
    }, [])

    return { data, pending, error, success, apiHandler }

}