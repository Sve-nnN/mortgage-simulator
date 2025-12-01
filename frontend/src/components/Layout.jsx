import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Home, Calculator, LogOut, Menu } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Sheet, SheetContent, SheetTrigger } from './ui/Sheet';
import { Button } from './ui/Button';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
        { path: '/clients', label: t('nav.clients'), icon: Users },
        { path: '/properties', label: t('nav.properties'), icon: Home },
        { path: '/simulator', label: t('nav.simulator'), icon: Calculator },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold text-blue-600">MortgageSim</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center space-x-3 p-3 rounded-lg transition-colors',
                                location.pathname === item.path
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                            )}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                    </div>
                </div>
                <LanguageSwitcher />
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-500 hover:text-red-700 w-full p-2 rounded hover:bg-red-50"
                >
                    <LogOut size={18} />
                    <span>{t('nav.logout')}</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-white shadow-md flex-col">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8 pt-16 md:pt-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
