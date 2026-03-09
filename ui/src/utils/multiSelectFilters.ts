export const ALL_FILTER_VALUE = 'All';

export const toApiMultiFilterParam = (values: string[]): string | undefined => {
    if (!values.length || values.includes(ALL_FILTER_VALUE)) {
        return undefined;
    }

    return values.join(',');
};

export const normalizeMultiFilterValues = (values: string[]): string[] => {
    if (!values.length || values.includes(ALL_FILTER_VALUE)) {
        return [ALL_FILTER_VALUE];
    }

    return Array.from(new Set(values));
};

export const isAllFilterSelected = (values: string[]): boolean => values.includes(ALL_FILTER_VALUE);

export const toggleMultiFilterValue = (currentValues: string[], nextValue: string): string[] => {
    if (nextValue === ALL_FILTER_VALUE) {
        return [ALL_FILTER_VALUE];
    }

    const baseValues = currentValues.filter((value) => value !== ALL_FILTER_VALUE);
    const hasValue = baseValues.includes(nextValue);
    const nextValues = hasValue
        ? baseValues.filter((value) => value !== nextValue)
        : [...baseValues, nextValue];

    return nextValues.length ? nextValues : [ALL_FILTER_VALUE];
};
