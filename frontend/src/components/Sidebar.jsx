import DevTalkLogo from './DevTalkLogo';

const Sidebar = ({ userChannels = [] }) => {
    return (
    <div className="w-64 bg-gray-900 text-white p-4 border-r border-gray-700">
        <DevTalkLogo />
        <h2 className="mt-6 text-lg font-bold">Your Channels</h2>
        <ul className="mt-4">
        {userChannels?.map((channel) => (
            <li key={channel.id} className="my-2">
            {channel.name}
            </li>
        ))}
        </ul>
    </div>
    );
};

export default Sidebar;
