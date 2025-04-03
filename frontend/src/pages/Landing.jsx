import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Button} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import logo from "/favicon/favicon.svg";
import Footer from "../components/Footer";
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import GitHubIcon from '@mui/icons-material/GitHub';

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
                        <Button 
                            onPress={() => navigate("/login")}
                            color="primary" 
                            variant="ghost"
                        >
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
                        Where problems become <br />
                    <span className="text-7xl sm:text-8xl font-extrabold text-blue-400">
                        shared solutions.
                    </span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
                        Ask smarter. Solve faster. Learn together.
                        DevTalk helps developers ask better questions, find trusted answers, and grow their skills — all in one collaborative space.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-6">
                        <Button
                            onPress={() => navigate("/signup")}
                            color="primary" 
                            size="lg" 
                            variant="shadow"
                        >
                            Sign Up
                        </Button>
                        {/* App preview image */}
                        <div className="relative w-[720px] rounded-xl overflow-hidden shadow-2xl border border-blue-700/30">
                            <div className="p-1 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur-sm">
                                <img 
                                    src="/app-preview.png" 
                                    alt="DevTalk App Preview" 
                                    className="w-full h-auto rounded-lg object-cover"
                                />
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

                <div className="flex justify-center gap-8 opacity-80">
                    <AppleIcon className="h-8 w-8 text-gray-300" />
                    <GoogleIcon className="h-8 w-8 text-gray-300" />
                    <MicrosoftIcon className="h-8 w-8 text-gray-300" />
                    <GitHubIcon className="h-8 w-8 text-gray-300" />
                </div>
            </section>
            <Footer />

            

        </>
    );
}