import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 min-h-screen flex flex-col">
                <Navbar />
                <main className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
