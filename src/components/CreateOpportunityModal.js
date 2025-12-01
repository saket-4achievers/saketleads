import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateOpportunityModal({ onClose, onCreate, prefilledData = {} }) {
    const [formData, setFormData] = useState({
        name: prefilledData.name || '',
        contactName: prefilledData.contactName || '',
        contactPhone: prefilledData.contactPhone || '',
        amount: prefilledData.amount || '',
        stage: prefilledData.stage || 'Lead',
        expectedCloseDate: prefilledData.expectedCloseDate || '',
        notes: prefilledData.notes || '',
        source: prefilledData.source || 'Manual Entry'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.contactName) {
            alert('Please fill in opportunity name and contact name');
            return;
        }
        onCreate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Create Opportunity</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Opportunity Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opportunity Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Software Development Project"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>

                    {/* Contact Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            placeholder="Contact person name"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            placeholder="+91 1234567890"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (₹)
                        </label>
                        <input
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="50000"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Stage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stage
                        </label>
                        <select
                            name="stage"
                            value={formData.stage}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="Lead">Lead</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Closed Won">Closed Won</option>
                            <option value="Closed Lost">Closed Lost</option>
                        </select>
                    </div>

                    {/* Expected Close Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Close Date
                        </label>
                        <input
                            type="date"
                            name="expectedCloseDate"
                            value={formData.expectedCloseDate}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional information about this opportunity..."
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Create Opportunity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
