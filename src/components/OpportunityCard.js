import React, { useState } from 'react';
import { Phone, MessageCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export default function OpportunityCard({
    opportunity,
    onStageChange,
    onNotesChange,
    onAmountChange,
    onCloseDateChange
}) {
    const {
        name,
        contactName,
        contactPhone,
        amount: initialAmount,
        stage,
        expectedCloseDate: initialCloseDate,
        notes: initialNotes,
        rowNumber,
        createdDate,
        source
    } = opportunity;

    const [notes, setNotes] = useState(initialNotes || '');
    const [amount, setAmount] = useState(initialAmount || '');
    const [closeDate, setCloseDate] = useState(initialCloseDate || '');

    const handleStageChange = (e) => {
        onStageChange(rowNumber, e.target.value);
    };

    const handleNotesBlur = () => {
        if (notes !== initialNotes) {
            onNotesChange(rowNumber, notes);
        }
    };

    const handleAmountBlur = () => {
        if (amount !== initialAmount) {
            onAmountChange(rowNumber, amount);
        }
    };

    const handleCloseDateBlur = () => {
        if (closeDate !== initialCloseDate) {
            onCloseDateChange(rowNumber, closeDate);
        }
    };

    // Clean phone number for links
    const cleanPhone = contactPhone?.replace(/\D/g, '') || '';

    const whatsappMessage = encodeURIComponent(
        `Hi ${contactName}, I wanted to follow up on our opportunity: ${name}`
    );

    // Stage color mapping
    const getStageColor = (stage) => {
        switch (stage) {
            case 'Lead':
                return 'bg-gray-100 text-gray-800';
            case 'Qualified':
                return 'bg-blue-100 text-blue-800';
            case 'Proposal':
                return 'bg-yellow-100 text-yellow-800';
            case 'Negotiation':
                return 'bg-orange-100 text-orange-800';
            case 'Closed Won':
                return 'bg-green-100 text-green-800';
            case 'Closed Lost':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        {name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{contactName}</span>
                        {contactPhone && <span className="ml-2">• {contactPhone}</span>}
                    </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${getStageColor(stage)}`}>
                    {stage}
                </div>
            </div>

            {/* Amount and Close Date */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <DollarSign size={14} />
                        Amount (₹)
                    </label>
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onBlur={handleAmountBlur}
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar size={14} />
                        Close Date
                    </label>
                    <input
                        type="date"
                        value={closeDate}
                        onChange={(e) => setCloseDate(e.target.value)}
                        onBlur={handleCloseDateBlur}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                </div>
            </div>

            {/* Contact Actions */}
            {contactPhone && (
                <div className="flex gap-2 mb-3">
                    <a
                        href={`tel:${contactPhone}`}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                        <Phone size={16} />
                        Call
                    </a>
                    <a
                        href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                        <MessageCircle size={16} />
                        WhatsApp
                    </a>
                </div>
            )}

            {/* Stage Selector */}
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                    value={stage}
                    onChange={handleStageChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                    <option value="Lead">Lead</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                </select>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Add notes about this opportunity..."
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                />
            </div>

            {/* Metadata */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Created: {createdDate}</span>
                <span className="italic">{source}</span>
            </div>
        </div>
    );
}
