import type { Metric, Region, TimePeriod } from "./types";

export const generateRandomId = function (max: number) {
    return Math.floor(Math.random() * max) + 1;
};

export function getRegionName(
    regions: Region[],
    target_region_id: number
): string {
    const target_region = regions.find(region => region.region_id === target_region_id);

    return target_region ? target_region.region_name : "Unknown region.";
}

export function getMetricName(
    metrics: Metric[],
    metric_id: number
): string {
    const metric = metrics.find(metric => metric.metric_id === metric_id);

    return metric ? metric.metric_name : "Unknown metric.";
}

export function getTimePeriodName(
    timePeriods: TimePeriod[],
    tp_id: number
): string {
    const tp = timePeriods.find(tp => tp.period_id === tp_id);

    return tp ? tp.period_name : "Unknown time period.";
}

export function formatSourceDate(dateString: string): string {
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}