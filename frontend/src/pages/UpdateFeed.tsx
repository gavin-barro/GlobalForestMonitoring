import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods, getSubscriptionByUser, requestCreateSubscription, requestDeleteSubscription } from "../services";
import type { ForestObservationGet, Metric, Region, Subscription, TimePeriod } from "../types";
import { formatSourceDate, getMetricName, getRegionName, getTimePeriodName } from "../utils";
import "./dashboards/dashboard.css";

export default function UpdateFeedPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [forestObservations, setForestObservations] = useState<ForestObservationGet[]>([]);
    const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const navigate = useNavigate();

    const userIdStr = localStorage.getItem('user_id');
    const userId = userIdStr ? parseInt(userIdStr) : null;
    const acctType = localStorage.getItem('acct_type');

    useEffect(() => {
        if (userId !== null) {
            getSubscriptionByUser(userId)
                .then((result) => setSubscriptions(result));
        }
        getAllForestObservations()
            .then((result) => setForestObservations(result));
        getAllTimePeriods()
            .then((result) => setTimePeriods(result));
        getAllMetrics()
            .then((result) => setMetrics(result));
        getAllRegions()
            .then((result) => setRegions(result));
    }, [userId]);

    const orderedForestObservations = [...forestObservations].sort(
        (a, b) =>
            new Date(b.source_date).getTime() -
            new Date(a.source_date).getTime()
    )

    function isSubscribed(user_id: number, metric_id: number, region_id: number) {
        return subscriptions.some(sub =>
            sub.active &&
            sub.user_id === user_id &&
            sub.metric_id === metric_id &&
            sub.region_id === region_id
        );
    }

    const handleSubscribe = async (user_id: number, metric_id: number, region_id: number) => {
        const sub: Subscription = {
            user_id: user_id,
            metric_id: metric_id,
            region_id: region_id,
            active: true,
            threshold_value: 0 // TODO: Consult with team about how best to input this
        }
        const requestSuccess: Boolean = await requestCreateSubscription(sub);
        if (requestSuccess) {
            setSubscriptions(prev => [...prev, sub]);
        }
    }

    const handleUnsubscribe = async (user_id: number, metric_id: number, region_id: number) => {
        const success = await requestDeleteSubscription(user_id, metric_id, region_id)
        if (success) {
            setSubscriptions((prev) => prev.filter((sub) =>
                !(sub.user_id === user_id && sub.metric_id === metric_id && sub.region_id === region_id)
            ));
        }
    }

    return (
        <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
                <Link to={acctType === 'Guest' ? "/dashboard/guest" : "/dashboard/viewer"} style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
            </div>

            <div style={{ flex: 1, padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
                <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Global Feed</h1>
                <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Latest observations from our global monitoring network.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {orderedForestObservations.map((fo) => (
                        <div key={fo.observation_id} style={{
                            background: "rgba(255,255,255,0.7)",
                            backdropFilter: "blur(10px)",
                            padding: "1.2rem",
                            borderRadius: "16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
                        }}>
                            <div>
                                <div style={{ fontWeight: "700", color: "#1b4332" }}>{getRegionName(regions, fo.region_id)}</div>
                                <div style={{ fontSize: "0.9rem", color: "#2D6A4F" }}>{getMetricName(metrics, fo.metric_id)}: {fo.value}</div>
                                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px" }}>{formatSourceDate(fo.source_date)}</div>
                            </div>
                            {userId !== null && (
                                <button
                                    onClick={() => {
                                        if (isSubscribed(userId, fo.metric_id, fo.region_id)) {
                                            handleUnsubscribe(userId, fo.metric_id, fo.region_id)
                                        } else {
                                            handleSubscribe(userId, fo.metric_id, fo.region_id)
                                        }
                                    }}
                                    style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
                                >
                                    {isSubscribed(userId, fo.metric_id, fo.region_id) ? "🔕" : "🔔"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
