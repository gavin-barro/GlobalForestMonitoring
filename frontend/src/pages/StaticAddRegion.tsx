import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import SelectInput from "../components/form/SelectInput";
import "./common.css"
import type { Region, RegionResponse, ServerErrorResponse } from "../types";
import { useNavigate } from "react-router-dom";
import { requestNewRegion } from "../services";
import { generateRandomId } from "../utils";

const initialValues: Region = {
    region_id: 0,
    region_name: "",
    region_type: "Country",
    geo_boundary: "",
    parent_region_id: 3
}

export default function StaticAddRegionPage() {
    const navigate = useNavigate();
    const handleSubmit = async (values: Region) => {
        const region_id = generateRandomId(1000);
        console.log("Received region as the following from frontend: " + JSON.stringify(values, null, 2));

        const newRegion: Region = {
            region_id: region_id,
            region_name: values.region_name,
            region_type: "Country", // TODO: Pull from get request of valid types or add field
            geo_boundary: values.geo_boundary,
            parent_region_id: values.parent_region_id // TODO: Pull from get request of valid regions
        }

        console.log("Passing user as the following to backend: " + JSON.stringify(newRegion, null, 2));
        const requestRegionResponse: RegionResponse | ServerErrorResponse =
            await requestNewRegion(newRegion);
        if ("error" in requestRegionResponse) {
            console.log("Error creating new user account", requestRegionResponse);
        } else {
            navigate("/");
        }
    }

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
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    <Form>
                        <TextInput label="Region Name" name="region_name" />
                        <label htmlFor="parent">Parent Region:</label>
                        <div className="input-option">
                            <SelectInput label="" name="parent_region_id" options={regions} />
                        </div>
                        <TextInput label="GeoJSON Data" name="geo_boundary" />

                        <button type="submit" className="button">
                            {'Submit'}
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}