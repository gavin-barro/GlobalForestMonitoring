import { Form, Formik } from "formik";
import SelectInput from "../components/form/SelectInput";
import type { RegionClassificationCreate, LandCoverType, Region } from "../types";
import { getAllLandCoverTypes, getAllRegions, requestCreateRegionClassification } from "../services";
import { useEffect, useState } from "react";
import "./common.css";

const initialValues: RegionClassificationCreate = {
    lct_id: 0,
    region_id: 0,
};

export default function StaticAddRegionClassificationPage() {
    const [landCoverTypes, setLandCoverTypes] = useState<LandCoverType[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);

    useEffect(() => {
        getAllLandCoverTypes().then(setLandCoverTypes);
        getAllRegions().then(setRegions);
    }, []);

    const lctOptions = landCoverTypes.map(lct => ({
        value: lct.lct_id,
        label: lct.type_name
    }));

    const regionOptions = regions.map(region => ({
        value: region.region_id,
        label: region.region_name
    }));

    const handleSubmit = async (values: RegionClassificationCreate) => {
        console.log("Creating Region Classification:", values);
        const success = await requestCreateRegionClassification(values);
        if (!success) {
            console.log("Failed to create region classification");
        } else {
            console.log("Successfully created region classification");
        }
    };

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Add Region Classification</h1>
                <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                    <Form>
                        <label>Land Cover Type:</label>
                        <div className="input-option">
                            <SelectInput label="" name="lct_id" options={lctOptions} />
                        </div>

                        <label>Region:</label>
                        <div className="input-option">
                            <SelectInput label="" name="region_id" options={regionOptions} />
                        </div>

                        <button type="submit" className="button">
                            Submit
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}