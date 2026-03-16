import { formatToIso8601Tz } from "./dateFormatters";

export interface ChartDataPoint {
    date: Date;
    value: number;
}

export function filterDataPointsByDays(dataPoints: ChartDataPoint[], days: number): ChartDataPoint[] {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    return dataPoints.filter((point) => point.date >= cutoff);
}

export function fillDailyDataPoints(dataPoints: ChartDataPoint[]): ChartDataPoint[] {


    if (dataPoints.length === 0) {
        return [];
    }

    const dataByDate = new Map<string, number>();
    for (const point of dataPoints) {
        dataByDate.set(formatToIso8601Tz(point.date), point.value);
    }

    const startDate = new Date(dataPoints[0].date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dataPoints[dataPoints.length - 1].date);
    endDate.setHours(0, 0, 0, 0);

    const result: ChartDataPoint[] = [];
    let lastValue = dataPoints[0].value;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateKey = formatToIso8601Tz(currentDate);

        if (dataByDate.has(dateKey)) {
            lastValue = dataByDate.get(dateKey)!;
        }

        result.push({ date: new Date(currentDate), value: lastValue });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
}
