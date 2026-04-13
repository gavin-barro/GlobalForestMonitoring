import { useEffect, useState } from "react";
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods, getSubscriptionByUser, requestDeleteSubscription } from "../services";
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

    var userSubscriptions = getSubscribedObservations(orderedForestObservations, subscriptions, 0); // TODO: Get user ID from context

    const handleUnsubscribe = async(user_id: number, metric_id: number, region_id: number) => {
        const success = await requestDeleteSubscription(user_id, metric_id, region_id)

        if (success) {
            setSubscriptions((prev) => prev.filter((sub) =>
                sub.user_id === user_id &&
                sub.metric_id !== metric_id &&
                sub.region_id !== region_id
            ))
            // Reacquire subscriptions
            userSubscriptions = getSubscribedObservations(orderedForestObservations, subscriptions, 0); // TODO: Get user ID from context
        } else {
            console.log(`Failed to delete subscription with user_id: ${user_id}, metric_id: ${metric_id}, region_id: ${region_id}`);
        }
    }

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Subscription Feed</h1>
                <div className="list-container">
                {userSubscriptions.map((fo) => (
                    <div className="list-entry" key={fo.observation_id}>
                        <div className="fo-detail">
                            {getRegionName(regions, fo.region_id)}: {getMetricName(metrics, fo.metric_id)} of <strong>{fo.value}</strong>
                        </div>
                        <div className="fo-detail">
                            {formatSourceDate(fo.source_date)} ({getTimePeriodName(timePeriods, fo.period_id)})
                        </div>
                        <button onClick={() => handleUnsubscribe(0, fo.metric_id, fo.region_id)}> {/*TODO: Provide user ID from context*/}
                            Unsubscribe
                        </button>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
