import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, TrendingUp, Users, BarChart3 } from 'lucide-react';

const Header = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">FintechPulse</h1>
                                <p className="text-sm text-gray-600">AI LinkedIn Content Generator</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/analytics"
                            className={`flex items-center space-x-2 transition-colors ${isActive('/analytics')
                                    ? 'text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>Analytics</span>
                        </Link>
                        <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <Users className="w-4 h-4" />
                            <span>Connections</span>
                        </a>
                        <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <BarChart3 className="w-4 h-4" />
                            <span>Reports</span>
                        </a>
                    </nav>

                    <div className="flex items-center space-x-3">
                        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Connected</span>
                        </div>
                        <button className="btn-secondary text-sm">
                            Settings
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 