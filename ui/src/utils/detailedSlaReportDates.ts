import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";

export type DetailedSlaInterval = "DAILY" | "MONTHLY" | "QUARTERLY";

const pad = (value: number) => String(value).padStart(2, "0");

export const createMonthOptions = (currentDate = new Date()): DropdownOption[] => {
    const options: DropdownOption[] = [];
    for (let year = currentDate.getFullYear(); year >= 1970; year -= 1) {
        const lastMonth = year === currentDate.getFullYear() ? currentDate.getMonth() : 11;
        for (let month = lastMonth; month >= 0; month -= 1) {
            const value = `${year}-${pad(month + 1)}`;
            const label = new Date(year, month, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            options.push({ value, label });
        }
    }
    return options;
};

export const createQuarterOptions = (currentDate = new Date()): DropdownOption[] => {
    const options: DropdownOption[] = [];
    for (let year = currentDate.getFullYear(); year >= 1970; year -= 1) {
        const lastQuarter = year === currentDate.getFullYear() ? Math.floor(currentDate.getMonth() / 3) + 1 : 4;
        for (let quarter = lastQuarter; quarter >= 1; quarter -= 1) {
            options.push({ value: `${year}-Q${quarter}`, label: `Q${quarter} ${year}` });
        }
    }
    return options;
};

export const getPeriodDateRange = (interval: Exclude<DetailedSlaInterval, "DAILY">, fromPeriod: string, toPeriod?: string) => {
    const effectiveTo = toPeriod || fromPeriod;
    const periodBounds = (period: string) => {
        if (interval === "MONTHLY") {
            const [year, month] = period.split("-").map(Number);
            return {
                start: `${year}-${pad(month)}-01`,
                end: `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`,
            };
        }
        const [yearText, quarterText] = period.split("-Q");
        const year = Number(yearText);
        const quarter = Number(quarterText);
        const startMonth = (quarter - 1) * 3 + 1;
        const endMonth = startMonth + 2;
        return {
            start: `${year}-${pad(startMonth)}-01`,
            end: `${year}-${pad(endMonth)}-${pad(new Date(year, endMonth, 0).getDate())}`,
        };
    };

    return { fromDate: periodBounds(fromPeriod).start, toDate: periodBounds(effectiveTo).end };
};
