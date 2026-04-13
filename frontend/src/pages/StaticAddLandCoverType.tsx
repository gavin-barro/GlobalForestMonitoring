import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import type { LCTCreate } from "../types";         
import { requestCreateLandCoverType } from "../services";
import "./common.css";

const initialValues: LCTCreate = {
    type_name: "",
    description: "",
    category: "",
};

export default function StaticAddLandCoverTypePage() {
    const handleSubmit = async (values: LCTCreate) => {
        console.log("Received Land Cover Type from frontend: " + JSON.stringify(values, null, 2));

        const requestSuccess: Boolean = await requestCreateLandCoverType(values);
        if (!requestSuccess) {
            console.log("Error creating new Land Cover Type");
        } else {
            console.log("Successfully created Land Cover Type");
        }
    };

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Add New Land Cover Type</h1>
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    <Form>
                        <label htmlFor="type_name">Type Name:</label>
                        <div className="input-option">
                            <TextInput label="" name="type_name" type="text" />
                        </div>

                        <label htmlFor="category">Category:</label>
                        <div className="input-option">
                            <TextInput label="" name="category" type="text" />
                        </div>

                        <label htmlFor="description">Description:</label>
                        <div className="input-option">
                            <TextInput label="" name="description" type="text" />
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