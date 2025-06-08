import { useEffect, useState } from "react"

export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebaouncedValue] = useState<T>(value);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebaouncedValue(value);
        }, delay)

        return () => clearTimeout(timeoutId)
    }, [value, delay])

    return debouncedValue;
}