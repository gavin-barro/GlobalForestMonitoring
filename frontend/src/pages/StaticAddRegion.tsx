import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import SelectInput from "../components/form/SelectInput";
import "./common.css"

export default function StaticAddRegionPage() {
    const regions = [
        {value: 1, label: 'Virginia, USA'},
        {value: 2, label: 'North Carolina, USA'},
        {value: 3, label: 'USA'},
        {value: 4, label: 'Russia'}
    ]

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Add New Region</h1>
                <Formik
                    initialValues={{}}
                    onSubmit={() => {}}
                >
                    <Form>
                        <TextInput label="Region Name" name="name" />
                        <label htmlFor="parent">Parent Region:</label>
                        <div className="input-option">
                            <SelectInput label="" name="parent" options={regions} />
                        </div>
                        <TextInput label="GeoJSON Data" name="geodata" />

                        <button type="submit" className="button">
                            {'Submit'}
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}