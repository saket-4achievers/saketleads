'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Eye, FileText, Paperclip, ExternalLink, Copy, Check } from 'lucide-react';

// Available PDF files
const AVAILABLE_PDFS = [
    { name: '4Achievers – Advanced n8n + AI Agents Professional Program 2025.pdf', label: 'n8n + AI Agents Program 2025' },
    { name: '4Achievers – Data Science & GenAI Syllabus.pdf', label: 'Data Science & GenAI' },
    { name: '4Achievers – Detailed QA Automation Syllabus.pdf', label: 'QA Automation' },
    { name: '4Achievers – DevOps & Cloud Syllabus.pdf', label: 'DevOps & Cloud' },
    { name: '4Achievers – UI_UX Design Syllabus.pdf', label: 'UI/UX Design' },
];

export default function SendTemplateModal({ contacts, onClose }) {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContact, setPreviewContact] = useState(contacts[0] || null);
    const [copiedPdfLink, setCopiedPdfLink] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const replaceVariables = (text, contact) => {
        if (!text) return '';
        return text
            .replace(/\{\{name\}\}/g, contact.name || 'Customer')
            .replace(/\{\{phone\}\}/g, contact.phone || '');
    };

    const getPdfUrl = (fileName) => {
        // Get full URL for sharing
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return `${baseUrl}/pdfffiles/${encodeURIComponent(fileName)}`;
    };

    const getPdfLabel = (fileName) => {
        const pdf = AVAILABLE_PDFS.find(p => p.name === fileName);
        return pdf?.label || fileName;
    };

    const copyPdfLink = async () => {
        if (currentTemplate?.pdfFile) {
            const pdfUrl = getPdfUrl(currentTemplate.pdfFile);
            try {
                await navigator.clipboard.writeText(pdfUrl);
                setCopiedPdfLink(true);
                setTimeout(() => setCopiedPdfLink(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    const handleSend = async () => {
        if (selectedTemplates.length === 0) {
            alert('Please select at least one template');
            return;
        }

        // Warning about popups
        if (contacts.length * selectedTemplates.length > 1) {
            alert(`Opening ${contacts.length * selectedTemplates.length} WhatsApp windows. Please allow popups for this site if they are blocked.`);
        }

        // Send to each contact
        for (const contact of contacts) {
            for (const template of selectedTemplates) {
                let message = replaceVariables(template.message, contact);
                
                // If template has PDF attachment, add the PDF link to the message
                if (template.pdfFile) {
                    const pdfUrl = getPdfUrl(template.pdfFile);
                    message += `\n\n📄 *${getPdfLabel(template.pdfFile)}*\n${pdfUrl}`;
                }

                const cleanPhone = contact.phone.replace(/\D/g, '');
                const encodedMessage = encodeURIComponent(message);

                // Open WhatsApp with message
                window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');

                // Small delay between opening windows
                if (contacts.length * selectedTemplates.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
            }
        }

        onClose();
    };

    const previewMessage = currentTemplate && previewContact
        ? replaceVariables(currentTemplate.message, previewContact)
        : '';

    const addTemplate = () => {
        if (currentTemplate && !selectedTemplates.find(t => t.id === currentTemplate.id)) {
            setSelectedTemplates([...selectedTemplates, currentTemplate]);
        }
    };

    const removeTemplate = (templateId) => {
        setSelectedTemplates(selectedTemplates.filter(t => t.id !== templateId));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Send Template Message</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Sending to {contacts.length} contact{contacts.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No templates found. Create a template first!</p>
                        </div>
                    ) : (
                        <>
                            {/* Template Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Templates to Send
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <select
                                        value={currentTemplate?.id || ''}
                                        onChange={(e) => {
                                            const template = templates.find(t => t.id === e.target.value);
                                            setCurrentTemplate(template);
                                            setShowPreview(false);
                                        }}
                                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    >
                                        <option value="">-- Select a template --</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name} {template.pdfFile ? '📄' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={addTemplate}
                                        disabled={!currentTemplate}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Selected Templates List */}
                                {selectedTemplates.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedTemplates.map(template => (
                                            <div key={template.id} className="bg-green-50 border border-green-200 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                <span>{template.name}</span>
                                                {template.pdfFile && <Paperclip size={12} />}
                                                <button
                                                    onClick={() => removeTemplate(template.id)}
                                                    className="hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Preview Contact Selection (for multi-contact) */}
                            {contacts.length > 1 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Preview for Contact
                                    </label>
                                    <select
                                        value={previewContact?.rowNumber || ''}
                                        onChange={(e) => {
                                            const contact = contacts.find(c => c.rowNumber === parseInt(e.target.value));
                                            setPreviewContact(contact);
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    >
                                        {contacts.map((contact) => (
                                            <option key={contact.rowNumber} value={contact.rowNumber}>
                                                {contact.name} - {contact.phone}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Preview Toggle */}
                            {currentTemplate && (
                                <div className="mb-4">
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${showPreview
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Eye size={18} />
                                        {showPreview ? 'Hide' : 'Show'} Preview
                                    </button>
                                </div>
                            )}

                            {/* Message Preview */}
                            {showPreview && currentTemplate && (
                                <div className="mb-6 space-y-4">
                                    {/* Text Message Preview */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Message Preview:</h3>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{previewMessage}</p>
                                        </div>
                                    </div>

                                    {/* PDF Attachment Preview */}
                                    {currentTemplate.pdfFile && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Paperclip size={16} />
                                                    PDF Attachment:
                                                </h3>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={copyPdfLink}
                                                        className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1"
                                                    >
                                                        {copiedPdfLink ? <Check size={14} /> : <Copy size={14} />}
                                                        {copiedPdfLink ? 'Copied!' : 'Copy Link'}
                                                    </button>
                                                    <a
                                                        href={getPdfUrl(currentTemplate.pdfFile)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                                                    >
                                                        <ExternalLink size={14} />
                                                        Open PDF
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <FileText className="text-blue-600" size={24} />
                                                    <div>
                                                        <p className="font-medium text-blue-800">
                                                            {getPdfLabel(currentTemplate.pdfFile)}
                                                        </p>
                                                        <p className="text-xs text-blue-600">
                                                            Will be shared as a link in the WhatsApp message
                                                        </p>
                                                    </div>
                                                </div>
                                                <iframe
                                                    src={`/pdfffiles/${encodeURIComponent(currentTemplate.pdfFile)}`}
                                                    className="w-full h-64 border border-gray-300 rounded-lg bg-white"
                                                    title="PDF Preview"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Final Message Preview with PDF Link */}
                                    {currentTemplate.pdfFile && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Message (with PDF link):</h3>
                                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                    {previewMessage}
                                                    {'\n\n'}📄 *{getPdfLabel(currentTemplate.pdfFile)}*
                                                    {'\n'}{getPdfUrl(currentTemplate.pdfFile)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl">
                    <button
                        onClick={handleSend}
                        disabled={selectedTemplates.length === 0}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg"
                    >
                        <Send size={20} />
                        Send via WhatsApp
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
