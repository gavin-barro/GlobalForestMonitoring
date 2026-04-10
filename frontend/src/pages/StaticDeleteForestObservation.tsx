import { useEffect, useState } from "react";
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods, requestDeleteForestObservation } from "../services";
import type { ForestObservationGet, Metric, Region, TimePeriod } from "../types";
import "./common.css"

export default function StaticDeleteRegionPage() {
    const [forestObservations, setForestObservations] = useState<ForestObservationGet[]>([]);
    const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);

    function getRegionName(target_region_id: number): string {
        const target_region = regions.find(region => region.region_id === target_region_id);
        if (target_region) {
            return target_region.region_name
        } else {
            return "Unknown region."
        }
    }

    function getMetricName(metric_id: number): string {
        const metric = metrics.find(metric => metric.metric_id === metric_id);
        if (metric) {
            return metric.metric_name
        } else {
            return "Unknown metric."
        }
    }

    function getTimePeriodName(tp_id: number): string {
        const tp = timePeriods.find(tp => tp.period_id === tp_id);
        if (tp) {
            return tp.period_name
        } else {
            return "Unknown time period."
        }
    }

    useEffect(() => {
        getAllForestObservations()
            .then((result) => setForestObservations(result));
        getAllTimePeriods()
            .then((result) => setTimePeriods(result))
        getAllMetrics()
            .then((result) => setMetrics(result))
        getAllRegions()
            .then((result) => setRegions(result))
    }, []);

    const handleDelete = async (id: number) => {
        const success = await requestDeleteForestObservation(id);

        if (success) {
            setForestObservations((prev) => prev.filter((fo) => fo.observation_id !== id));
        } else {
            console.log("Failed to delete region with id: " + id);
        }
    };

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Manage Forest Observations</h1>
                <div className="list-container">
                {forestObservations.map((fo) => {
                    return (
                        <div className="list-entry" key={fo.observation_id}>
                            <div className="fo-detail">
                                Observation on: {getRegionName(fo.region_id)}
                            </div>
                            <div className="fo-detail">
                                For: {getMetricName(fo.metric_id)}
                            </div>
                            <div className="fo-detail">
                                During: {getTimePeriodName(fo.period_id)}
                            </div>
                            <div className="fo-detail">
                                With value: {fo.value}
                            </div>
                            <button onClick={() => handleDelete(fo.observation_id)}>
                                Delete
                            </button>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}