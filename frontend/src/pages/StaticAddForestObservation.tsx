import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import SelectInput from "../components/form/SelectInput";
import type { ForestObservationFormBackend, ForestObservationResponse, Metric, Region, ServerErrorResponse, TimePeriod } from "../types";
import { getAllMetrics, getAllRegions, getAllTimePeriods, requestNewForestObservation } from "../services";
import { useEffect, useState } from "react";

const initialValues: ForestObservationFormBackend = {
    value: 0,
    source_date: "",
    period_id: 0,
    metric_id: 0,
    region_id: 0,
}

export default function StaticAddForestObservationPage() {
    const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
    const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([]);
    const [availableTimePeriods, setAvailableTimePeriods] = useState<TimePeriod[]>([]);

    useEffect(() => {
        getAllRegions()
            .then((result) => setAvailableRegions(result))
        getAllMetrics()
            .then((result) => setAvailableMetrics(result))
        getAllTimePeriods()
            .then((result) => setAvailableTimePeriods(result))
    }, []);

    const handleSubmit = async (values: ForestObservationFormBackend) => {
        console.log("Received forest observation as the following from frontend: " + JSON.stringify(values, null, 2));

        const newForestObservation: ForestObservationFormBackend = {
            value: values.value,
            source_date: values.source_date,
            period_id: values.period_id,
            metric_id: values.metric_id,
            region_id: values.region_id
        }

        console.log("Passing forest observation as the following to backend: " + JSON.stringify(newForestObservation, null, 2));
        const requestForestObservationResponse: ForestObservationResponse | ServerErrorResponse =
            await requestNewForestObservation(newForestObservation);
        if ("error" in requestForestObservationResponse) {
            console.log("Error creating new user account", requestForestObservationResponse);
        }
    }
    const metrics = availableMetrics.map(metric => ({
        value: metric.metric_id,
        label: metric.metric_name
    }));

    const regions = availableRegions.map(region => ({
        value: region.region_id,
        label: region.region_name
    }));

    const timePeriods = availableTimePeriods.map(timePeriod => ({
        value: timePeriod.period_id,
        label: timePeriod.period_name
    }))

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Add New Forest Observation</h1>
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    <Form>
                        <label htmlFor="measures">Measures:</label>
                        <div className="input-option">
                            <SelectInput label="" name="metric_id" options={metrics} />
                        </div>
                        <label htmlFor="region">For Region:</label>
                        <div className="input-option">
                            <SelectInput label="" name="region_id" options={regions} />
                        </div>
                        <label htmlFor="timeperiod">During:</label>
                        <div className="input-option">
                            <SelectInput label="" name="period_id" options={timePeriods} />
                        </div>
                        <TextInput label="With Value" name="value" type="number"/>
                        <TextInput label="On Date" name="source_date" type="date"/>

                        <button type="submit" className="button">
                            {'Submit'}
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}