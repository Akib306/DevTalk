import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import logo from "../../public/favicon/favicon.svg";
import Footer from "../components/Footer";

export default function LandingPage() {
    const navigate = useNavigate();
    return (
        <>
        
            <Navbar className="w-full bg-[#0f172a]">
                <NavbarBrand>
                    <img src={logo} alt="DevTalk Logo" className="h-10 mr-2" />
                    <p className="font-bold text-inherit">DevTalk</p>
                </NavbarBrand>
                
                <NavbarContent justify="end">
                    <NavbarItem>
                        <Button as={Link} color="primary" href="#" variant="ghost">
                            Login
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
            
            <section className="relative isolate overflow-hidden text-center text-white">
                {/* BACKGROUND */}
                <div className="absolute inset-0 -z-10 animate-pulse bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1E3A8A]/40 via-[#1E3A8A]/20 to-transparent"></div>

                {/* CONTENT CONTAINER */}
                <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
                    <h1 className="text-5xl font-bold">
                    Where developers <br />
                    <span className="text-7xl sm:text-8xl font-extrabold text-blue-400">
                        collaborate and resolve
                    </span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
                    DevTalk is a channel-based platform built for developers to ask programming questions,
                    share solutions, and grow together — with nested replies, search, and ratings to make help easier to find.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-6">
                        <Button color="primary" size="lg" variant="shadow">
                            Sign Up
                        </Button>
                        {/* Skeleton video card */}
                        <div className="relative w-[720px] h-[480px] bg-neutral-800 rounded-xl overflow-hidden shadow-lg">
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <div className="absolute inset-0">
                                <div className="h-full w-full bg-gradient-to-r from-neutral-700 via-neutral-800 to-neutral-700 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
                
            </section>

            <section
                className="w-full py-16 px-4 text-center text-white
                        bg-gradient-to-r from-[#0f172a] via-[#235b8fa2] to-[#172554]
                        bg-[length:200%_200%] animate-gradient-x"
            >
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                    Trusted by developers who help developers.
                </h2>
                <p className="text-gray-300 text-lg mx-1 mb-10">
                    DevTalk empowers collaboration among thousands of developers, streamlining knowledge sharing and code help.
                </p>

                <div className="flex flex-wrap justify-center items-center gap-8 mb-10">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-blue-400">10,000+</span>
                        <span className="text-sm text-gray-400">Developers</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-blue-400">4.9/5</span>
                        <span className="text-sm text-gray-400">Average Rating</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-blue-400">1M+</span>
                        <span className="text-sm text-gray-400">Questions Answered</span>
                    </div>
                </div>

                <div className="flex justify-center gap-6 opacity-80 grayscale">
                    <img src="/public/favicon/apple-touch-icon.png" alt="Apple" className="h-6" />
                    <img src="/public/favicon/favicon-96x96.png" alt="Google" className="h-6" />
                    <img src="/public/favicon/favicon.svg" alt="Meta" className="h-6" />
                </div>
            </section>

            

        </>
    );
}