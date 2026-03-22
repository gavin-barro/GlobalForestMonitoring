import { Form, Formik } from "formik";
import { format } from "date-fns"; // NOTE: Might not need long term, but useful rn
import TextInput from "../components/form/TextInput";
import type { ServerErrorResponse, UserFormBackend, UserResponse } from "../types";
import { requestNewUser } from "../services";
import { useNavigate } from "react-router-dom";
import { generateRandomId } from "../utils";

const initialValues: UserFormBackend = {
    user_id: 0,
    username: "",
    email: "",
    acct_type: "Guest",
    pw_hash: "",
    creation_date: "",
}

export default function StaticAddUserPage() {
    const navigate = useNavigate();
    const handleSubmit = async (values: UserFormBackend) => {
        const today = format(new Date(), "yyyy-MM-dd");
        const user_id = generateRandomId(100);

        console.log("Received user as the following from frontend: " + JSON.stringify(values, null, 2));

        const newUser: UserFormBackend = {
            username: values.username,
            email: values.email,
            acct_type: "Guest",
            user_id: user_id,
            pw_hash: values.pw_hash,
            creation_date: today
        }

        console.log("Passing user as the following to backend: " + JSON.stringify(newUser, null, 2));
        const requestUserResponse: UserResponse | ServerErrorResponse =
            await requestNewUser(newUser);
        if ("error" in requestUserResponse) {
            console.log("Error creating new user account", requestUserResponse);
        } else {
            navigate("/");
        }
    }

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Sign Up</h1>
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    <Form>
                        <TextInput label="Username" name="username" />
                        <TextInput label="Email" name="email" />
                        <TextInput label="Password" name="pw_hash" type="password" />
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