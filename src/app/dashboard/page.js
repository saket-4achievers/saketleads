'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileSpreadsheet, Activity, Users, Phone, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
    const [sheets, setSheets] = useState([]);
    const [currentSheet, setCurrentSheet] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchSheets();
    }, []);

    useEffect(() => {
        if (currentSheet) {
            fetchContacts(currentSheet);
        }
    }, [currentSheet]);

    const fetchSheets = async () => {
        try {
            const res = await fetch('/api/sheets');
            const data = await res.json();
            if (data.sheets) {
                setSheets(data.sheets);
                if (data.sheets.length > 0 && !currentSheet) {
                    setCurrentSheet(data.sheets[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching sheets:', error);
        }
    };

    const fetchContacts = async (tabName) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/contacts?tab=${encodeURIComponent(tabName)}`);
            const data = await res.json();
            if (data.contacts) {
                setContacts(data.contacts);
                processStats(data.contacts);
                processRecentActivity(data.contacts);
            } else {
                setContacts([]);
                setStats([]);
                setRecentActivity([]);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const processStats = (data) => {
        const statusCounts = {};
        data.forEach(contact => {
            const status = contact.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const chartData = Object.keys(statusCounts).map(status => ({
            name: status,
            value: statusCounts[status]
        }));

        setStats(chartData);
    };

    const processRecentActivity = (data) => {
        // Since we don't have timestamps, we assume the last added contacts are at the bottom.
        // We'll take the last 5 contacts.
        const reversed = [...data].reverse();
        setRecentActivity(reversed.slice(0, 5));
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 mb-6">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-blue-600" />
                            Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={currentSheet}
                            onChange={(e) => setCurrentSheet(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            {sheets.map(sheet => (
                                <option key={sheet} value={sheet}>{sheet}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => fetchContacts(currentSheet)}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Contacts</p>
                            <h3 className="text-2xl font-bold text-gray-900">{contacts.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Phone size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Interested</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {stats.find(s => s.name === 'Interested')?.value || 0}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Sheet</p>
                            <h3 className="text-lg font-bold text-gray-900 truncate max-w-[150px]" title={currentSheet}>
                                {currentSheet}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Distribution Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Status Distribution</h2>
                        <div className="h-[300px] w-full">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : stats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {stats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock size={30} className="text-gray-400" />
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : recentActivity.length > 0 ? (
                                recentActivity.map((contact, index) => (
                                    <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${contact.status === 'Interested' ? 'bg-green-500' :
                                            contact.status === 'New' ? 'bg-blue-500' :
                                                contact.status === 'Not Interested' ? 'bg-red-500' :
                                                    'bg-gray-400'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{contact.name || 'Unknown Name'}</p>
                                            <p className="text-sm font-medium text-gray-900">{contact.phone || 'Unknown Phone'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Status: <span className="font-medium">{contact.status}</span>
                                            </p>
                                            {contact.comment && (
                                                <p className="text-xs text-gray-400 mt-1 italic">"{contact.comment}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-10">
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
