import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from "@heroui/react";
import { useAuth } from "../context/AuthContext";

export default function App() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    // Real-time password validation
    const passwordErrors = [];
    if (password.length < 4) {
        passwordErrors.push("Password must be 4 characters or more.");
    }
    if ((password.match(/[A-Z]/g) || []).length < 1) {
        passwordErrors.push("Password must include at least 1 upper case letter.");
    }
    if ((password.match(/[^a-z]/gi) || []).length < 1) {
        passwordErrors.push("Password must include at least 1 symbol.");
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));

        // Custom validation checks
        const newErrors = {};

         // If the password does not meet the criteria, add an error (this is optional since the password field shows errors on its own)
        if (passwordErrors.length > 0) {
            newErrors.password = passwordErrors.join(" ");
        }

        // Username validation
        if (data.name === "admin") {
            newErrors.name = "Nice try! Choose a different username";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear errors and submit
        setErrors({});

        // POST request to the server
        try {
            const response = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: data.name,
                    password: data.password,
                })
            });

            if (!response.ok) {
                if (response.status === 409) {
                    setErrors({ name: "Username already exists. Please choose a different username." });
                } else {
                    setErrors({ global: "Registration failed. Please try again." });
                }
                return;
            }

            const { token } = await response.json();
            login(token); // Store the token and update auth state
            navigate('/channels');
        } catch (error) {
            setErrors({ global: "An error occurred. Please try again." });
        }

    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50">
                <Form
                    validationErrors={errors}
                    onReset={() => { setErrors({}); setPassword(""); }}
                    onSubmit={onSubmit}
                >
                    <div className="flex flex-col gap-8">
                        <Input
                            isRequired
                            size="lg" 
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
                            className="w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] text-lg py-3 h-14"
                        />

                        <Input
                            isRequired
                            size="lg" 
                            errorMessage={() => (
                                <ul>
                                    {passwordErrors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            )}
                            isInvalid={passwordErrors.length > 0}
                            label="Password"
                            labelPlacement="outside"
                            name="password"
                            placeholder="Enter your password"
                            type="password"
                            value={password}
                            onValueChange={setPassword}
                            className="w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] text-lg py-3 h-14"
                        />

                        <div className="flex justify-center gap-4 mt-14">
                            <Button 
                                size="lg" 
                                color="primary" 
                                type="submit" 
                                variant="shadow"
                            >
                                Sign Up
                            </Button>

                            <Button 
                                type="reset" 
                                size="lg" 
                                variant="ghost" 
                                onPress={() => navigate("/")}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}