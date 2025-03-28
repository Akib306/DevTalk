import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white text-center px-4">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Welcome to DevTalk</h1>
            <p className="text-lg mb-8 max-w-xl">
                A channel-based platform for developers to ask questions, share solutions, and support each other in real-time.
            </p>

            <div className="flex gap-4">
                <Button onClick={() => navigate("/register")} variant="primary">
                    Get Started
                </Button>
                <Button onClick={() => navigate("/login")} variant="outline">
                    Login
                </Button>
            </div>

            <footer className="absolute bottom-6 text-sm text-gray-300">
                Created for CMPT 353 – Final Project
            </footer>
        </div>
    );
}