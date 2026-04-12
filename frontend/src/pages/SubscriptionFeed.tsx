import { useEffect, useState } from "react";
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods, getSubscriptionByUser } from "../services";
import { type Subscription, type ForestObservationGet, type Metric, type Region, type TimePeriod } from "../types";
import { formatSourceDate, getMetricName, getRegionName, getTimePeriodName } from "../utils";
import "./common.css"

// Represents the home page of updates users can view and subscribe to
export default function SubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [forestObservations, setForestObservations] = useState<ForestObservationGet[]>([]);
    const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);

    useEffect(() => {
        getSubscriptionByUser(0) // TODO: Provide user ID from context
            .then((result) => setSubscriptions(result));
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

    function getSubscribedObservations(
        observations: ForestObservationGet[],
        subscriptions: Subscription[],
        user_id: number
    ): ForestObservationGet[] {
        return observations.filter(fo =>
            subscriptions.some(sub =>
                sub.active = true &&
                sub.user_id === user_id &&
                sub.metric_id === fo.metric_id &&
                sub.region_id === fo.region_id &&
                fo.value >= sub.threshold_value
            )
        )
    }

    const userSubscriptions = getSubscribedObservations(forestObservations, subscriptions, 0); // TODO: Get user ID from context

    const handleUnsubscribe = async(user_id: number) => {

    }

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Subscription Feed</h1>
                <div className="list-container">
                {userSubscriptions.map((fo) => (
                    <div className="list-entry" key={fo.observation_id}>
                        <div className="fo-detail">
                            {getRegionName(regions, fo.region_id)}: {formatSourceDate(fo.source_date)} ({getTimePeriodName(timePeriods, fo.period_id)})
                        </div>
                        <div className="fo-detail">
                            {getMetricName(metrics, fo.metric_id)}: {fo.value}
                        </div>
                        <button onClick={() => handleUnsubscribe(0)}> {/*TODO: Provide user ID from context*/}
                            🔔
                        </button>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
