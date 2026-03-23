import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import SelectInput from "../components/form/SelectInput";
import type { ForestObservationFormBackend, ForestObservationResponse, Metric, Region, ServerErrorResponse } from "../types";
import { getAllMetrics, getAllRegions, requestNewForestObservation } from "../services";
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
    const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([])

    useEffect(() => {
        getAllRegions()
            .then((result) => setAvailableRegions(result))
        getAllMetrics()
            .then((result) => setAvailableMetrics(result))
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

    const timeperiods = [
        {value: 1, label: '2024-2025'},
        {value: 2, label: '2023-2024'},
        {value: 3, label: '2020-2022'},
        {value: 4, label: 'Period 4'},
        {value: 5, label: 'Period 5'},
        {value: 6, label: 'Period 6'}
    ]

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
                            <SelectInput label="" name="period_id" options={timeperiods} />
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