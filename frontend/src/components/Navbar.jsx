import SearchIcon from '@mui/icons-material/Search';
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
export default function Navbar() {
    return (
        <div className="flex justify-between items-center bg-gray-900 shadow px-4 py-2 border-b border-gray-700">
            <form action="" className="relative">
                <div className="relative">
                    <input type="text"
                        placeholder="Search..."
                        className="bg-gray-800 
                            text-white 
                            rounded-full 
                            pl-10
                            pr-4
                            py-2
                            w-[300px] md:w-[600px]
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            focus:border-transparent
                        "
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </form>
            <div className="flex items-center">
                <AccountCircleSharpIcon className="text-gray-400 size-20 cursor-pointer hover:text-blue-500 transform hover:scale-150 transition-all" />
            </div>
        </div>
    );
}