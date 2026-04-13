import { useEffect, useState } from "react";
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods, requestCreateSubscription } from "../services";
import type { ForestObservationGet, Metric, Region, Subscription, TimePeriod } from "../types";
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
            new Date(b.source_date).getTime() -
            new Date(a.source_date).getTime()
    )

    const handleSubscribe = async(user_id: number, metric_id: number, region_id: number) => {
        const sub: Subscription = {
            user_id: user_id,
            metric_id: metric_id,
            region_id: region_id,
            active: true,
            threshold_value: 0 // TODO: Consult with team about how best to input this
        }
        console.log("Passing subscription as the following to backend: " + JSON.stringify(sub, null, 2));
        const requestSuccess: Boolean = await requestCreateSubscription(sub);
        if (!requestSuccess) {
            console.log("Error adding new subscription");
        }
    }

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
                        <button onClick={() => handleSubscribe(0, fo.metric_id, fo.region_id)}> {/*TODO: Provide user ID from context*/}
                            🔔
                        </button>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
