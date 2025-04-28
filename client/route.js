import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../frontend/src/app/components/Home';
import Listing from '../client/src/app/listing';
import OAuth from './src/app/components/oauth';
import Login from './src/app/components/Login';
import SomeButtonComponent from '../frontend/src/app/components/SomeButtonComponent';
import Dashboard from './src/app/dashboard/page';

// 修改函数名
function AppRouter() {
    return (
        <Router>
            <div>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="listing" element={<Listing />} />
                    <Route path="api/oauth" element={<OAuth />} />
                    <Route path="login" element={<Login />} />
                    <Route path="dashboard" element={<Dashboard/>} />
                </Routes>
            </div>
        </Router>
    );
}

export default AppRouter;