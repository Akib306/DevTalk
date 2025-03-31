import React from 'react';
import logo from "/favicon/favicon.svg";

const DevTalkLogo = () => {
    return (
        <div className="flex items-center">
        <img src={logo} alt="DevTalk Logo" className="h-10 mr-2" />
        <span className="text-2xl font-bold text-blue-500">Dev</span>
        <span className="text-2xl font-bold text-white">Talk</span>
        </div>
    );
};

export default DevTalkLogo;
