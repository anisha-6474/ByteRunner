import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserManagement from "./UserManagement";
import DashboardOverview from "./DashboardOverview";
import ProblemManagement from './ProblemManagement';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Code, BarChart, Settings, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalProblems: 0,
    userGrowth: [],
    problemGrowth: [],
    users: [],
    topPerformers: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user statistics
        const statsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-stats`, { headers });
        const statsData = statsResponse.data;

        // Fetch problem statistics
        const problemStatsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/problem-stats`, { headers });
        const problemStatsData = problemStatsResponse.data;

        // Fetch all users
        const usersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, { headers });
        const usersData = usersResponse.data;

        // Fetch top performers
        const topPerformersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/top-performers`, { headers });
        const topPerformersData = topPerformersResponse.data;

        // Fetch recent activity
        const recentActivityResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/recent-activity`, { headers });
        const recentActivityData = recentActivityResponse.data;

        setAdminData({
          totalUsers: statsData?.data?.totalUsers || 0,
          totalProblems: problemStatsData?.data?.totalProblems || 0,
          userGrowth: statsData?.data?.userGrowth || [],
          problemGrowth: problemStatsData?.data?.problemGrowth || [],
          users: usersData?.data || [],
          topPerformers: topPerformersData?.data || [],
          recentActivity: recentActivityData?.data || [],
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response && error.response.status === 401) {
          window.location.href = '/admin/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const renderActiveComponent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardOverview
            data={adminData}
          />
        );
      case 'users':
        return <UserManagement users={adminData.users} />;
      case 'problems':
        return <ProblemManagement />
      default:
        return <DashboardOverview data={adminData} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'dashboard' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('dashboard')}
          >
            <BarChart className="mr-2" /> Dashboard
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'users' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('users')}
          >
            <Users className="mr-2" /> User Management
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-2 text-white hover:bg-green-700 ${
              activeSection === 'problems' ? 'bg-green-700' : ''
            }`}
            onClick={() => setActiveSection('problems')}
          >
            <Code className="mr-2" /> Problem Management
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start mt-4 bg-red-600 hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" /> Logout
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-white overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
        </div>

        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
