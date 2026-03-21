import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import SelectInput from "../components/form/SelectInput";

export default function StaticAddForestObservationPage() {
    const measurements = [
        {value: 1, label: 'Tree Coverage'},
        {value: 2, label: 'Emission Total'}
    ]

    const regions = [
        {value: 1, label: 'Virginia, USA'},
        {value: 2, label: 'North Carolina, USA'},
        {value: 3, label: 'USA'},
        {value: 4, label: 'Russia'}
    ]

    const timeperiods = [
        {value: 1, label: '2024-2025'},
        {value: 2, label: '2023-2024'},
        {value: 3, label: '2020-2022'}
    ]

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Add New Forest Observation</h1>
                <Formik
                    initialValues={{}}
                    onSubmit={() => {}}
                >
                    <Form>
                        <label htmlFor="measures">Measures:</label>
                        <div className="input-option">
                            <SelectInput label="" name="measures" options={measurements} />
                        </div>
                        <label htmlFor="region">For Region:</label>
                        <div className="input-option">
                            <SelectInput label="" name="region" options={regions} />
                        </div>
                        <label htmlFor="timeperiod">During:</label>
                        <div className="input-option">
                            <SelectInput label="" name="timeperiod" options={timeperiods} />
                        </div>
                        <TextInput label="With Value" name="inputvalue" />
                        <TextInput label="On Date" name="inputdate" />

                        <button type="submit" className="button">
                            {'Submit'}
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}