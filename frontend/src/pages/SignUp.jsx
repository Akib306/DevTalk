import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from "@heroui/react";

export default function App() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [submitted, setSubmitted] = useState(null);
    const [errors, setErrors] = useState({});

    // Real-time password validation
    const getPasswordError = (value) => {
        if (value.length < 4) {
            return "Password must be 4 characters or more";
        }
        if ((value.match(/[A-Z]/g) || []).length < 1) {
            return "Password needs at least 1 uppercase letter";
        }
        if ((value.match(/[^a-z]/gi) || []).length < 1) {
            return "Password needs at least 1 symbol";
        }
        return null;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));

        // Custom validation checks
        const newErrors = {};

        // Password validation
        const passwordError = getPasswordError(data.password);
        if (passwordError) {
            newErrors.password = passwordError;
        }

        // Username validation
        if (data.name === "admin") {
            newErrors.name = "Nice try! Choose a different username";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (data.terms !== "true") {
            setErrors({ terms: "Please accept the terms" });
            return;
        }

        // Clear errors and submit
        setErrors({});
        setSubmitted(data);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
            <Form
                validationErrors={errors}
                onReset={() => setSubmitted(null)}
                onSubmit={onSubmit}
            >
                <div className="flex flex-col gap-4">
                    <Input
                        isRequired
                        errorMessage={({ validationDetails }) => {
                            if (validationDetails.valueMissing) {
                                return "Please enter your name";
                            }
                            return errors.name;
                        }}
                        label="Username"
                        labelPlacement="outside"
                        name="name"
                        placeholder="Enter your name"
                        className="w-full text-lg py-3"
                    />

                    <Input
                        isRequired
                        errorMessage={getPasswordError(password)}
                        isInvalid={getPasswordError(password) !== null}
                        label="Password"
                        labelPlacement="outside"
                        name="password"
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                        onValueChange={setPassword}
                        className="w-full text-lg py-3"
                    />

                    <div className="flex justify-center gap-4">
                        <Button 
                            size="md" 
                            color="primary" 
                            type="submit" 
                            variant="shadow"
                        >
                            Sign Up
                        </Button>

                        <Button 
                            type="reset" 
                            size="md" 
                            variant="ghost" 
                            onPress={() => navigate("/")}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                {submitted && (
                    <div className="text-sm text-gray-300 mt-4">
                        Submitted data: <pre>{JSON.stringify(submitted, null, 2)}</pre>
                    </div>
                )}
            </Form>
        </div>
    );
}
