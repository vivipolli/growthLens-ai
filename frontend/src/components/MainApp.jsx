import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ProgressPage from './ProgressPage';
import ChatPage from './ChatPage';
import Header from './Header';

const MainApp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/progress') {
            setCurrentPage('progress');
        } else if (path === '/chat') {
            setCurrentPage('chat');
        } else {
            setCurrentPage('dashboard');
        }
    }, [location.pathname]);

    const renderPage = () => {
        switch (currentPage) {
            case 'progress':
                return <ProgressPage />;
            case 'chat':
                return <ChatPage />;
            default:
                return (
                    <Dashboard
                        onEditPersonal={() => navigate('/onboarding/personal')}
                        onEditBusiness={() => navigate('/onboarding/business')}
                    />
                );
        }
    };

    return (
        <div>
            <Header />
            {renderPage()}
        </div>
    );
};

export default MainApp; 