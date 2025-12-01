'use client';

import React, { useState, useEffect } from 'react';
import CreateOpportunityModal from '@/components/CreateOpportunityModal';
import { RefreshCw, Plus, ArrowLeft, DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import Link from 'next/link';

export default function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);

    const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/opportunities');
            const data = await res.json();
            if (data.opportunities) {
                setOpportunities(data.opportunities);
            } else {
                setOpportunities([]);
            }
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (rowNumber, newStage) => {
        // Optimistic update
        setOpportunities(prev => prev.map(o =>
            o.rowNumber === rowNumber ? { ...o, stage: newStage } : o
        ));

        try {
            await fetch('/api/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rowNumber,
                    stage: newStage
                })
            });
        } catch (error) {
            console.error('Error updating stage:', error);
            fetchOpportunities();
        }
    };

    const handleCreateOpportunity = async (opportunityData) => {
        try {
            const res = await fetch('/api/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(opportunityData)
            });
            const data = await res.json();

            if (data.success) {
                setShowCreateModal(false);
                fetchOpportunities();
            } else {
                alert('Failed to create opportunity: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating opportunity:', error);
            alert('Failed to create opportunity');
        }
    };

    // Drag and Drop handlers
    const handleDragStart = (e, opportunity) => {
        setDraggedItem(opportunity);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        setDraggedItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, newStage) => {
        e.preventDefault();
        if (draggedItem && draggedItem.stage !== newStage) {
            handleStageChange(draggedItem.rowNumber, newStage);
        }
    };

    // Calculate stats
    const getStageOpportunities = (stage) => {
        return opportunities.filter(o => o.stage === stage);
    };

    const getStageValue = (stage) => {
        return getStageOpportunities(stage).reduce((sum, opp) => {
            return sum + (parseFloat(opp.amount) || 0);
        }, 0);
    };

    const totalValue = opportunities.reduce((sum, opp) => {
        return sum + (parseFloat(opp.amount) || 0);
    }, 0);

    const totalCount = opportunities.length;
    const wonCount = getStageOpportunities('Closed Won').length;
    const wonValue = getStageValue('Closed Won');

    // Stage colors
    const getStageColor = (stage) => {
        switch (stage) {
            case 'Lead':
                return 'bg-gray-50 border-gray-200';
            case 'Qualified':
                return 'bg-blue-50 border-blue-200';
            case 'Proposal':
                return 'bg-yellow-50 border-yellow-200';
            case 'Negotiation':
                return 'bg-orange-50 border-orange-200';
            case 'Closed Won':
                return 'bg-green-50 border-green-200';
            case 'Closed Lost':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getStageHeaderColor = (stage) => {
        switch (stage) {
            case 'Lead':
                return 'bg-gray-600';
            case 'Qualified':
                return 'bg-blue-600';
            case 'Proposal':
                return 'bg-yellow-600';
            case 'Negotiation':
                return 'bg-orange-600';
            case 'Closed Won':
                return 'bg-green-600';
            case 'Closed Lost':
                return 'bg-red-600';
            default:
                return 'bg-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* CRM Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="text-blue-600" size={28} />
                                    Sales Pipeline
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">Manage your opportunities and track deals</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
                            >
                                <Plus size={18} />
                                New Opportunity
                            </button>
                            <button
                                onClick={() => fetchOpportunities()}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-100 text-sm font-medium">Total Pipeline</span>
                                <DollarSign size={20} className="text-blue-200" />
                            </div>
                            <p className="text-3xl font-bold">₹{totalValue.toLocaleString()}</p>
                            <p className="text-blue-100 text-xs mt-1">{totalCount} opportunities</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-green-100 text-sm font-medium">Closed Won</span>
                                <Target size={20} className="text-green-200" />
                            </div>
                            <p className="text-3xl font-bold">₹{wonValue.toLocaleString()}</p>
                            <p className="text-green-100 text-xs mt-1">{wonCount} deals</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-purple-100 text-sm font-medium">Win Rate</span>
                                <TrendingUp size={20} className="text-purple-200" />
                            </div>
                            <p className="text-3xl font-bold">{totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0}%</p>
                            <p className="text-purple-100 text-xs mt-1">Success ratio</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-orange-100 text-sm font-medium">Active Deals</span>
                                <Users size={20} className="text-orange-200" />
                            </div>
                            <p className="text-3xl font-bold">{totalCount - wonCount - getStageOpportunities('Closed Lost').length}</p>
                            <p className="text-orange-100 text-xs mt-1">In progress</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="p-6 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                    {stages.map((stage) => {
                        const stageOpps = getStageOpportunities(stage);
                        const stageValue = getStageValue(stage);

                        return (
                            <div
                                key={stage}
                                className="flex-shrink-0 w-80"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage)}
                            >
                                {/* Column Header */}
                                <div className={`${getStageHeaderColor(stage)} rounded-t-xl p-4 text-white shadow-md`}>
                                    <h3 className="font-bold text-lg mb-1">{stage}</h3>
                                    <div className="flex justify-between items-center text-sm opacity-90">
                                        <span>{stageOpps.length} deals</span>
                                        <span className="font-semibold">₹{stageValue.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Column Content */}
                                <div className={`${getStageColor(stage)} border-2 rounded-b-xl min-h-[600px] p-3 space-y-3`}>
                                    {loading && stage === 'Lead' ? (
                                        <div className="flex justify-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : stageOpps.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400 text-sm">
                                            No opportunities
                                        </div>
                                    ) : (
                                        stageOpps.map((opportunity) => (
                                            <OpportunityKanbanCard
                                                key={opportunity.rowNumber}
                                                opportunity={opportunity}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Opportunity Modal */}
            {showCreateModal && (
                <CreateOpportunityModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateOpportunity}
                />
            )}
        </div>
    );
}

// Kanban Card Component
function OpportunityKanbanCard({ opportunity, onDragStart, onDragEnd }) {
    const { name, contactName, contactPhone, amount, notes, expectedCloseDate, rowNumber } = opportunity;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, opportunity)}
            onDragEnd={onDragEnd}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-move border border-gray-200 hover:border-blue-300"
        >
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{name}</h4>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} />
                    <span className="truncate">{contactName}</span>
                </div>

                {amount && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <DollarSign size={14} />
                        <span>₹{parseFloat(amount).toLocaleString()}</span>
                    </div>
                )}

                {expectedCloseDate && (
                    <div className="text-xs text-gray-500">
                        Close: {new Date(expectedCloseDate).toLocaleDateString()}
                    </div>
                )}

                {notes && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 pt-2 border-t border-gray-100">
                        {notes}
                    </p>
                )}
            </div>

            {contactPhone && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <a
                        href={`tel:${contactPhone}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        📞 {contactPhone}
                    </a>
                </div>
            )}
        </div>
    );
}
