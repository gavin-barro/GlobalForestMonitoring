import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";

export default function StaticAddUserPage() {
    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Sign Up</h1>
                <Formik
                    initialValues={{}}
                    onSubmit={() => {}}
                >
                    <Form>
                        <TextInput label="Username" name="username" />
                        <TextInput label="Email" name="email" />
                        <TextInput label="Password" name="password" type="password" />
                        <TextInput label="Retype Password" name="passwordmatch" type="password" />

                        <button type="submit" className="button">
                            {'Submit'}
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}