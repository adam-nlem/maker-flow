export interface ChartDataPoint {
    date: Date;
    value: number;
}

function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function fillDailyDataPoints(dataPoints: ChartDataPoint[]): ChartDataPoint[] {
    if (dataPoints.length === 0) {
        return [];
    }

    const sorted = [...dataPoints].sort((a, b) => a.date.getDate() - b.date.getDate());

    const dataByDate = new Map<string, number>();
    for (const point of sorted) {
        dataByDate.set(toDateKey(point.date), point.value);
    }

    const startDate = new Date(sorted[0].date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(sorted[sorted.length - 1].date);
    endDate.setHours(0, 0, 0, 0);

    const result: ChartDataPoint[] = [];
    let lastValue = sorted[0].value;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateKey = toDateKey(currentDate);

        if (dataByDate.has(dateKey)) {
            lastValue = dataByDate.get(dateKey)!;
        }

        result.push({ date: new Date(currentDate), value: lastValue });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
}
