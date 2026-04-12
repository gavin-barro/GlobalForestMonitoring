import { useEffect, useState } from "react";
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods } from "../services";
import type { ForestObservationGet, Metric, Region, TimePeriod } from "../types";
import { formatSourceDate, getMetricName, getRegionName, getTimePeriodName } from "../utils";
import "./common.css"

// Represents the home page of updates users can view and subscribe to
export default function UpdateFeedPage() {
    const [forestObservations, setForestObservations] = useState<ForestObservationGet[]>([]);
    const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);

    useEffect(() => {
        getAllForestObservations()
                    .then((result) => setForestObservations(result));
                getAllTimePeriods()
                    .then((result) => setTimePeriods(result));
                getAllMetrics()
                    .then((result) => setMetrics(result));
                getAllRegions()
                    .then((result) => setRegions(result));
    }, []);

    const orderedForestObservations = [...forestObservations].sort(
        (a, b) =>
            new Date(a.source_date).getTime() -
            new Date(b.source_date).getTime()
    )

    const handleSubscribe = async() => {}

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Update Feed</h1>
                <div className="list-container">
                {orderedForestObservations.map((fo) => (
                    <div className="list-entry" key={fo.observation_id}>
                        <div className="fo-detail">
                            {getRegionName(regions, fo.region_id)}: {formatSourceDate(fo.source_date)} ({getTimePeriodName(timePeriods, fo.period_id)})
                        </div>
                        <div className="fo-detail">
                            {getMetricName(metrics, fo.metric_id)}: {fo.value}
                        </div>
                        <button onClick={() => handleSubscribe()}>
                            🔔
                        </button>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
