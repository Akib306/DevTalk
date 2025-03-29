import React from "react";

export default function Footer() {
    return (
        <footer className="w-full bg-[#0f172a] text-gray-400 py-8 px-4 border-t border-gray-700">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <div className="text-center md:text-left">
                    <p>© {new Date().getFullYear()} DevTalk. All rights reserved.</p>
                </div>

                <div className="flex space-x-4">
                    <a href="#" className="hover:text-white transition">Privacy</a>
                    <a href="#" className="hover:text-white transition">Terms</a>
                    <a href="#" className="hover:text-white transition">Contact</a>
                    <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
                </div>
            </div>
        </footer>
    );
}
