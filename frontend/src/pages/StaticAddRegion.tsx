import { Form, Formik, type FormikHelpers } from "formik";
import TextInput from "../components/form/TextInput";
import SelectInput from "../components/form/SelectInput";
import "./common.css"
import type { Region, RegionResponse, ServerErrorResponse } from "../types";
import { getAllRegions, requestNewRegion } from "../services";
import { useEffect, useState } from "react";

const initialValues: Region = {
    region_id: 0,
    region_name: "",
    region_type: "Country",
    geo_boundary: "",
    parent_region_id: 1
}

export default function StaticAddRegionPage() {
    const [parentRegions, setParentRegions] = useState<Region[]>([]);

    useEffect(() => {
        getAllRegions()
            .then((result) => setParentRegions(result))
    }, []);

    const handleSubmit = async (values: Region, { resetForm }: FormikHelpers<Region>) => {
        console.log("Received region as the following from frontend: " + JSON.stringify(values, null, 2));

        const newRegion: Region = {
            region_id: values.region_id, // TODO: Since db creates this ideally we wouldn't provide anything here
            region_name: values.region_name,
            region_type: "Country", // TODO: Pull from get request of valid types or add field for region type
            geo_boundary: values.geo_boundary,
            parent_region_id: values.parent_region_id
        }

        console.log("Passing user as the following to backend: " + JSON.stringify(newRegion, null, 2));
        const requestRegionResponse: RegionResponse | ServerErrorResponse =
            await requestNewRegion(newRegion);
        if ("error" in requestRegionResponse) {
            console.log("Error creating new user account", requestRegionResponse);
        } else {
            // Don't know which id db will assign region, so refetch region list
            const updatedRegions = await getAllRegions();
            setParentRegions(updatedRegions);
            resetForm()
        }
    }

    const regions = parentRegions.map(region => ({
        value: region.region_id,
        label: region.region_name
    }));

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