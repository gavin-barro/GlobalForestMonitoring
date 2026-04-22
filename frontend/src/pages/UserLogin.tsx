import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type LoginFormValues = {
    username: string;
    password: string;
};

const initialValues: LoginFormValues = {
    username: "",
    password: ""
}

export default function UserLoginPage() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (values: LoginFormValues) => {
        console.log("Logging in with:", values);

        await loginUser(values.username, values.password);
    }

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Login</h1>
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    <Form>
                        <TextInput label="Username" name="username" />
                        <TextInput label="Password" name="password" type="password" />

                        <button type="submit" className="button">
                            {'Submit'}
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}