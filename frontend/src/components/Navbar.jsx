import { useState, useRef, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import DevTalkLogo from './DevTalkLogo';
import { Modal, ModalContent, ModalHeader, ModalBody, Chip, Card, Avatar, Button, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/apiUtils';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('content');
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const filtersRef = useRef(null);
    const { user } = useAuth();

    // States for users modal
    const [showUsers, setShowUsers] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isDeleting, setIsDeleting] = useState({});

    // Check user role on mount
    useEffect(() => {
        console.log('Current user in Navbar:', user);
        // Check admin status from server when user data is available
        if (user) {
            checkAdminStatus();
        }
    }, [user]);

    // Function to check admin status from server
    const checkAdminStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/auth/check-admin', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Admin status check:', data);
            } else {
                console.error('Error checking admin status:', response.status);
            }
        } catch (error) {
            console.error('Error during admin check:', error);
        }
    };

    // Close filters dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (filtersRef.current && !filtersRef.current.contains(event.target) &&
                searchRef.current && !searchRef.current.contains(event.target)) {
                setShowFilters(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length >= 1) {
            setShowFilters(true);
        } else {
            setShowFilters(false);
        }
    };

    const handleFilterClick = (filter) => {
        setSelectedFilter(filter);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        setShowResults(true);
        
        try {
            let searchUrl = 'http://localhost:3000/api/posts/search?';
            
            if (selectedFilter === 'content') {
                searchUrl += `query=${encodeURIComponent(searchQuery)}`;
            } else if (selectedFilter === 'author') {
                searchUrl += `author=${encodeURIComponent(searchQuery)}`;
            }
            
            const token = localStorage.getItem('token');
            const response = await fetch(searchUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                console.error('Error searching:', response.statusText);
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error during search:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
            setShowFilters(false);
        }
    };

    const closeModal = () => {
        setShowResults(false);
        setSearchResults([]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const highlightSearchTerm = (text, term) => {
        if (!term || selectedFilter !== 'content') return text;
        
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="bg-blue-500/30 px-1 rounded">$1</span>');
    };

    // Function to fetch all users
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        
        try {
            console.log('Fetching users...');
            const response = await apiRequest('http://localhost:3000/api/auth/users');
            
            if (response.ok) {
                const data = await response.json();
                console.log('Users data received:', data);
                setUsers(data);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error fetching users:', response.status, response.statusText, errorData);
                
                // Set a meaningful error message
                setUsers([]);
                alert(`Error fetching users: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error during user fetch:', error);
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Open Users Modal
    const openUsersModal = () => {
        setShowUsers(true);
        fetchUsers();
    };
    
    // Close Users Modal
    const closeUsersModal = () => {
        setShowUsers(false);
        setUsers([]);
    };

    // Handle user deletion
    const handleDeleteUser = async (userId, username) => {
        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete user "${username}" and ALL their content? This action cannot be undone.`)) {
            return;
        }
        
        setIsDeleting(prev => ({ ...prev, [userId]: true }));
        
        try {
            const response = await apiRequest(`http://localhost:3000/api/auth/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove user from the list
                setUsers(prev => prev.filter(user => user.id !== userId));
                alert(`User "${username}" deleted successfully.`);
                
                // Dispatch a custom event to notify other components (like Dashboard) to refresh
                const refreshEvent = new CustomEvent('userDeleted', { 
                    detail: { userId, username } 
                });
                window.dispatchEvent(refreshEvent);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error deleting user:', response.status, response.statusText, errorData);
                alert(`Error deleting user: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error during user deletion:', error);
            alert(`Failed to delete user: ${error.message}`);
        } finally {
            setIsDeleting(prev => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 flex justify-between items-center bg-[#0f172a] px-10
        py-5 border-b border-gray-700 z-10">
            <DevTalkLogo />
            <div className="relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
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
                
                {/* Search filters dropdown */}
                {showFilters && (
                    <div 
                        ref={filtersRef} 
                        className="absolute mt-2 w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 z-20"
                    >
                        <p className="text-gray-400 mb-3">Search by:</p>
                        <div className="flex gap-2">
                            <Chip 
                                color={selectedFilter === 'content' ? 'primary' : 'default'}
                                variant={selectedFilter === 'content' ? 'solid' : 'flat'}
                                onClick={() => handleFilterClick('content')}
                            >
                                Content
                            </Chip>
                            <Chip 
                                color={selectedFilter === 'author' ? 'primary' : 'default'}
                                variant={selectedFilter === 'author' ? 'solid' : 'flat'}
                                onClick={() => handleFilterClick('author')}
                            >
                                Author
                            </Chip>
                        </div>
                        <div className="mt-4 text-right">
                            <Button 
                                color="primary" 
                                size="sm" 
                                onClick={handleSearchSubmit}
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center">
                {/* Admin-only View All Users button */}
                {user && user.role === 'admin' && (
                    <Button 
                        color="primary"
                        className="mr-4"
                        onClick={openUsersModal}
                    >
                        View All Users
                    </Button>
                )}
                <AccountCircleSharpIcon className="text-gray-400 size-20 cursor-pointer hover:text-blue-500 transform hover:scale-150 transition-all" />
            </div>
            
            {/* Search Results Modal */}
            <Modal isOpen={showResults} onClose={closeModal} size="5xl" backdrop="blur">
                <ModalContent className="bg-[#0f172a] border border-gray-700 text-white">
                    <ModalHeader className="border-b border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl mr-5 font-semibold text-white">Search Results:</h3>
                            <div className="text-sm text-gray-400">
                                {selectedFilter === 'content' 
                                    ? `Showing results for "${searchQuery}"` 
                                    : `Showing content by "${searchQuery}"`}
                            </div>
                        </div>
                    </ModalHeader>
                    <ModalBody className="max-h-[70vh] overflow-y-auto">
                        {isSearching ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No results found
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {searchResults.map(post => (
                                    <Card key={`post-${post.id}`} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar name={post.author_name} className="shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <div className="text-blue-400 font-semibold">{post.author_name}</div>
                                                    <div className="text-xs text-gray-400">{formatDate(post.created_at)}</div>
                                                </div>
                                                
                                                <div className={`my-2 ${post.matches ? 'bg-blue-900/20 p-2 rounded-lg border border-blue-700/30' : ''}`}>
                                                    <div 
                                                        dangerouslySetInnerHTML={{
                                                            __html: highlightSearchTerm(post.content, searchQuery)
                                                        }}
                                                    />
                                                </div>
                                                
                                                <div className="mt-2 text-xs">
                                                    <Chip size="sm" variant="flat" color="default">
                                                        #{post.channel_name}
                                                    </Chip>
                                                    <span className="ml-2 text-gray-400">
                                                        {post.upvotes} upvotes • {post.downvotes} downvotes
                                                    </span>
                                                </div>
                                                
                                                {/* Replies section */}
                                                {post.replies && post.replies.length > 0 && (
                                                    <div className="mt-4 border-t border-gray-700 pt-3">
                                                        <div className="text-sm text-gray-400 mb-2">
                                                            Replies:
                                                        </div>
                                                        <div className="space-y-3 pl-6 border-l-2 border-gray-700">
                                                            {post.replies.map(reply => (
                                                                <RenderReply 
                                                                    key={`reply-${reply.id}`} 
                                                                    reply={reply} 
                                                                    searchQuery={searchQuery} 
                                                                    highlightFn={highlightSearchTerm}
                                                                    formatDateFn={formatDate}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
            
            {/* Users Modal */}
            <Modal isOpen={showUsers} onClose={closeUsersModal} size="3xl" backdrop="blur">
                <ModalContent className="bg-[#0f172a] border border-gray-700 text-white">
                    <ModalHeader className="border-b border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl mr-5 font-semibold text-white">All Registered Users</h3>
                        </div>
                    </ModalHeader>
                    <ModalBody className="max-h-[70vh] overflow-y-auto">
                        {isLoadingUsers ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No users found
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {users.map(user => (
                                    <Card key={user.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-gray-400 text-sm">{user.id}</div>
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={user.username} size="sm" />
                                                    <span className="text-blue-400 font-medium">{user.username}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Chip 
                                                    color={user.role === 'admin' ? 'primary' : 'default'} 
                                                    size="sm"
                                                >
                                                    {user.role || 'user'}
                                                </Chip>
                                                {user.role !== 'admin' && (
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        isLoading={isDeleting[user.id]}
                                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                                    >
                                                        Delete User
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}

// Helper component to render replies recursively
function RenderReply({ reply, searchQuery, highlightFn, formatDateFn }) {
    return (
        <div className={`${reply.matches ? 'bg-blue-900/20 p-2 rounded-lg border border-blue-700/30' : ''}`}>
            <div className="flex items-start gap-2">
                <Avatar name={reply.author_name} size="sm" className="shrink-0" />
                <div className="flex-1">
                    <div className="flex justify-between">
                        <div className="text-blue-400 text-sm font-medium">{reply.author_name}</div>
                        <div className="text-xs text-gray-400">{formatDateFn(reply.created_at)}</div>
                    </div>
                    
                    <div className="my-1 text-sm">
                        <div 
                            dangerouslySetInnerHTML={{
                                __html: highlightFn(reply.content, searchQuery)
                            }}
                        />
                    </div>
                    
                    <div className="text-xs text-gray-400">
                        {reply.upvotes} upvotes • {reply.downvotes} downvotes
                    </div>
                    
                    {/* Nested replies */}
                    {reply.replies && reply.replies.length > 0 && (
                        <div className="mt-2 pl-4 border-l border-gray-700 space-y-2">
                            {reply.replies.map(nestedReply => (
                                <RenderReply 
                                    key={`reply-${nestedReply.id}`} 
                                    reply={nestedReply} 
                                    searchQuery={searchQuery}
                                    highlightFn={highlightFn}
                                    formatDateFn={formatDateFn}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}