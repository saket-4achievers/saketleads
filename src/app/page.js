'use client';

import React, { useState, useEffect } from 'react';
import ContactCard from '@/components/ContactCard';
import SendTemplateModal from '@/components/SendTemplateModal';
import { Upload, RefreshCw, FileSpreadsheet, Plus, Trash2, MessageSquare, Share2, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const [contacts, setContacts] = useState([]);
    const [sheets, setSheets] = useState([]);
    const [currentSheet, setCurrentSheet] = useState('Sheet1');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [statusFilter, setStatusFilter] = useState('All');
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    useEffect(() => {
        fetchSheets();
    }, []);

    useEffect(() => {
        if (currentSheet) {
            fetchContacts(currentSheet);
            setSelectedRows(new Set()); // Clear selection on sheet change
        }
    }, [currentSheet]);

    const fetchSheets = async () => {
        try {
            const res = await fetch('/api/sheets');
            const data = await res.json();
            if (data.sheets) {
                setSheets(data.sheets);
                // If current sheet is not in list (and list not empty), set to first
                if (data.sheets.length > 0 && !data.sheets.includes(currentSheet)) {
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
            } else {
                setContacts([]);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (rowNumber, newStatus) => {
        // Optimistic update
        setContacts(prev => prev.map(c =>
            c.rowNumber === rowNumber ? { ...c, status: newStatus } : c
        ));

        try {
            await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tabName: currentSheet,
                    rowNumber,
                    status: newStatus
                })
            });
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert on error (optional, but good practice)
            fetchContacts(currentSheet);
        }
    };

    const handleCommentChange = async (rowNumber, newComment) => {
        // Optimistic update
        setContacts(prev => prev.map(c =>
            c.rowNumber === rowNumber ? { ...c, comment: newComment } : c
        ));

        try {
            await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tabName: currentSheet,
                    rowNumber,
                    comment: newComment
                })
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            // Revert on error
            fetchContacts(currentSheet);
        }
    };

    const handleNameChange = async (rowNumber, newName) => {
        // Optimistic update
        setContacts(prev => prev.map(c =>
            c.rowNumber === rowNumber ? { ...c, name: newName } : c
        ));

        try {
            await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tabName: currentSheet,
                    rowNumber,
                    name: newName
                })
            });
        } catch (error) {
            console.error('Error updating name:', error);
            // Revert on error
            fetchContacts(currentSheet);
        }
    };

    const handlePhoneChange = async (rowNumber, newPhone) => {
        // Optimistic update
        setContacts(prev => prev.map(c =>
            c.rowNumber === rowNumber ? { ...c, phone: newPhone } : c
        ));

        try {
            await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tabName: currentSheet,
                    rowNumber,
                    phone: newPhone
                })
            });
        } catch (error) {
            console.error('Error updating phone:', error);
            // Revert on error
            fetchContacts(currentSheet);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                await fetchSheets();
                setCurrentSheet(data.sheetName);
                setShowUpload(false);
                alert('Upload successful! Created new sheet: ' + data.sheetName);
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteSheet = async () => {
        if (!confirm(`Are you sure you want to delete sheet "${currentSheet}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/sheets?title=${encodeURIComponent(currentSheet)}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                const newSheets = sheets.filter(s => s !== currentSheet);
                setSheets(newSheets);
                if (newSheets.length > 0) {
                    setCurrentSheet(newSheets[0]);
                } else {
                    setCurrentSheet('');
                    setContacts([]);
                }
                alert('Sheet deleted successfully');
            } else {
                alert('Failed to delete sheet: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting sheet:', error);
            alert('Failed to delete sheet');
        }
    };

    const toggleSelect = (rowNumber) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowNumber)) {
            newSelected.delete(rowNumber);
        } else {
            newSelected.add(rowNumber);
        }
        setSelectedRows(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedRows.size === 0) return;
        if (!confirm(`Delete ${selectedRows.size} contacts?`)) return;

        try {
            const res = await fetch('/api/contacts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tabName: currentSheet,
                    rowNumbers: Array.from(selectedRows)
                })
            });
            const data = await res.json();

            if (data.success) {
                fetchContacts(currentSheet);
                setSelectedRows(new Set());
            } else {
                alert('Failed to delete contacts: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting contacts:', error);
            alert('Failed to delete contacts');
        }
    };

    const handleBulkWhatsApp = () => {
        if (selectedRows.size === 0) return;

        const selectedContacts = contacts.filter(c => selectedRows.has(c.rowNumber));

        // Warning about popups
        if (selectedContacts.length > 1) {
            alert("Opening multiple WhatsApp windows. Please allow popups for this site if they are blocked.");
        }

        selectedContacts.forEach(contact => {
            const cleanPhone = contact.phone.replace(/\D/g, '');
            const whatsappMessage = encodeURIComponent(
                "Please fill this form to get a complete details brochure on your email.\n" +
                "Please check spam mail also.\n" +
                "https://saket4achievers.app.n8n.cloud/form/32ae5cd8-3ca2-497e-9ad4-1f79f1b0e76f"
            );
            window.open(`https://wa.me/${cleanPhone}?text=${whatsappMessage}`, '_blank');
        });
    };

    const handleBulkShare = () => {
        if (selectedRows.size === 0) return;

        const selectedContacts = contacts.filter(c => selectedRows.has(c.rowNumber));

        const message = selectedContacts.map(c =>
            `*Name:* ${c.name}\n*Phone:* ${c.phone}\n*Status:* ${c.status}\n*Comment:* ${c.comment || '-'}`
        ).join('\n\n----------------\n\n');

        const encodedMessage = encodeURIComponent(`*Selected Contacts Details:*\n\n${message}`);

        // Open WhatsApp with the text (user selects recipient)
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    const handleSelectAll = () => {
        const visibleContacts = filteredContacts;
        const allRowNumbers = new Set(visibleContacts.map(c => c.rowNumber));
        setSelectedRows(allRowNumbers);
    };

    const handleDeselectAll = () => {
        setSelectedRows(new Set());
    };

    // Filter contacts by status
    const filteredContacts = statusFilter === 'All'
        ? contacts
        : contacts.filter(c => c.status === statusFilter);

    return (
        <main className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" />
                        Contact Manager
                    </h1>
                    <div className="flex gap-2">
                        <Link href="/templates">
                            <button
                                className="p-2 text-purple-500 hover:text-purple-700 rounded-full hover:bg-purple-50"
                                title="Manage Templates"
                            >
                                <FileText size={20} />
                            </button>
                        </Link>
                        <Link href="/opportunities">
                            <button
                                className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50"
                                title="View Opportunities"
                            >
                                <TrendingUp size={20} />
                            </button>
                        </Link>
                        {currentSheet && (
                            <button
                                onClick={handleDeleteSheet}
                                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                title="Delete current sheet"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => fetchContacts(currentSheet)}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Sheet Selector */}
                <div className="max-w-md mx-auto px-4 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex gap-2">
                        {sheets.map(sheet => (
                            <button
                                key={sheet}
                                onClick={() => setCurrentSheet(sheet)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${currentSheet === sheet
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {sheet}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="max-w-md mx-auto px-4 pb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Filter:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        >
                            <option value="All">All Statuses</option>
                            <option value="New">New</option>
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Callback">Callback</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        {statusFilter === 'All' ? 'No contacts found in this sheet.' : `No contacts with status "${statusFilter}".`}
                    </div>
                ) : (
                    <>
                        {/* Select All/Deselect All */}
                        <div className="mb-4 flex gap-2">
                            <button
                                onClick={handleSelectAll}
                                className="flex-1 py-2 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                            >
                                Select All ({filteredContacts.length})
                            </button>
                            <button
                                onClick={handleDeselectAll}
                                className="flex-1 py-2 px-4 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                            >
                                Deselect All
                            </button>
                        </div>
                        {filteredContacts.map((contact) => (
                            <ContactCard
                                key={contact.rowNumber}
                                contact={contact}
                                onStatusChange={handleStatusChange}
                                onCommentChange={handleCommentChange}
                                onNameChange={handleNameChange}
                                onPhoneChange={handlePhoneChange}
                                tabName={currentSheet}
                                isSelected={selectedRows.has(contact.rowNumber)}
                                onToggleSelect={toggleSelect}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Bulk Actions Bar */}
            {selectedRows.size > 0 && (
                <div className="fixed bottom-24 left-0 right-0 px-4 z-20">
                    <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
                        <span className="font-semibold text-gray-700">{selectedRows.size} selected</span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkDelete}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex flex-col items-center text-xs gap-1"
                            >
                                <Trash2 size={20} />
                                Delete
                            </button>
                            <button
                                onClick={handleBulkWhatsApp}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex flex-col items-center text-xs gap-1"
                            >
                                <MessageSquare size={20} />
                                Brochure
                            </button>
                            <button
                                onClick={handleBulkShare}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex flex-col items-center text-xs gap-1"
                            >
                                <Share2 size={20} />
                                Share
                            </button>
                            <button
                                onClick={() => setShowTemplateModal(true)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg flex flex-col items-center text-xs gap-1"
                            >
                                <FileText size={20} />
                                Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button for Upload */}
            <div className="fixed bottom-6 right-6 z-10">
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                    {showUpload ? <Plus className="rotate-45 transition-transform" /> : <Upload />}
                </button>
            </div>

            {/* Upload Modal/Drawer */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
                        <h2 className="text-xl font-bold mb-4">Upload New Contacts</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            Upload a CSV file with "Name" and "Phone Number" columns. A new sheet will be created.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleUpload}
                                disabled={uploading}
                                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100
                "
                            />

                            {uploading && (
                                <div className="text-center text-sm text-green-600 font-medium animate-pulse">
                                    Uploading and processing...
                                </div>
                            )}

                            <button
                                onClick={() => setShowUpload(false)}
                                className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Template Modal */}
            {showTemplateModal && selectedRows.size > 0 && (
                <SendTemplateModal
                    contacts={contacts.filter(c => selectedRows.has(c.rowNumber))}
                    onClose={() => setShowTemplateModal(false)}
                />
            )}
        </main>
    );
}
