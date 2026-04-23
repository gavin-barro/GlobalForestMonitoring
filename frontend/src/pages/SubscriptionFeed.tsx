import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods, getSubscriptionByUser, requestDeleteSubscription } from "../services";
import { type Subscription, type ForestObservationGet, type Metric, type Region, type TimePeriod } from "../types";
import { formatSourceDate, getMetricName, getRegionName, getTimePeriodName } from "../utils";
import "./dashboards/dashboard.css";

export default function SubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [forestObservations, setForestObservations] = useState<ForestObservationGet[]>([]);
    const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const navigate = useNavigate();

    const userIdStr = localStorage.getItem('user_id');
    const userId = userIdStr ? parseInt(userIdStr) : 0;

    useEffect(() => {
        if (userId !== 0) {
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

    function getSubscribedObservations(
        observations: ForestObservationGet[],
        subscriptions: Subscription[],
        user_id: number
    ): ForestObservationGet[] {
        return observations.filter(fo =>
            subscriptions.some(sub =>
                sub.active === true &&
                sub.user_id === user_id &&
                sub.metric_id === fo.metric_id &&
                sub.region_id === fo.region_id &&
                (sub.threshold_value === undefined || fo.value >= sub.threshold_value)
            )
        )
    }

    const userSubscribedObs = getSubscribedObservations(orderedForestObservations, subscriptions, userId);

    const handleUnsubscribe = async(user_id: number, metric_id: number, region_id: number) => {
        const success = await requestDeleteSubscription(user_id, metric_id, region_id)
        if (success) {
            setSubscriptions((prev) => prev.filter((sub) =>
                !(sub.user_id === user_id && sub.metric_id === metric_id && sub.region_id === region_id)
            ));
        }
    }

    return (
        <div className="page home-page" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
                <Link to="/dashboard/viewer" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
            </div>

            <div style={{ flex: 1, padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
                <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Updates Feed</h1>
                <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Recent changes in the regions you're watching.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {userSubscribedObs.length > 0 ? (
                    userSubscribedObs.map((fo) => (
                        <div key={fo.observation_id} style={{ 
                            background: "rgba(255,255,255,0.7)", 
                            backdropFilter: "blur(10px)", 
                            padding: "1.5rem", 
                            borderRadius: "16px", 
                            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div>
                                <div style={{ fontWeight: "800", color: "#1b4332", fontSize: "1.2rem", marginBottom: "4px" }}>
                                    {getRegionName(regions, fo.region_id)}
                                </div>
                                <div style={{ color: "#2D6A4F", fontWeight: "600", fontSize: "1rem" }}>
                                    {getMetricName(metrics, fo.metric_id)}: <span style={{ color: "#1b4332" }}>{fo.value}</span>
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#5C6E61", marginTop: "8px" }}>
                                    {formatSourceDate(fo.source_date)} • {getTimePeriodName(timePeriods, fo.period_id)}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleUnsubscribe(userId, fo.metric_id, fo.region_id)}
                                style={{ background: "rgba(0,0,0,0.05)", color: "#1b4332", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "bold" }}
                            >
                                Unsubscribe
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,0.4)", borderRadius: "16px" }}>
                        <p style={{ color: "#5C6E61", fontSize: "1.2rem" }}>Your feed is quiet. Save some regions to see updates here!</p>
                        <button onClick={() => navigate('/dashboard/viewer/search')} style={{ marginTop: "1rem", padding: "12px 24px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                            Explore Regions
                        </button>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
