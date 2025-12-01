'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Eye, Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SendTemplateModal({ contacts, onClose }) {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContact, setPreviewContact] = useState(contacts[0] || null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const previewRef = useRef(null);

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

    const generatePDF = async (contact) => {
        if (!selectedTemplate?.htmlContent) {
            return null;
        }

        try {
            const element = previewRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Return blob for WhatsApp sharing
            return pdf.output('blob');
        } catch (error) {
            console.error('Error generating PDF:', error);
            return null;
        }
    };

    const handleSend = async () => {
        if (!selectedTemplate) {
            alert('Please select a template');
            return;
        }

        // Warning about popups
        if (contacts.length > 1) {
            alert(`Opening ${contacts.length} WhatsApp windows. Please allow popups for this site if they are blocked.`);
        }

        // Send to each contact
        for (const contact of contacts) {
            const message = replaceVariables(selectedTemplate.message, contact);
            const cleanPhone = contact.phone.replace(/\D/g, '');
            const encodedMessage = encodeURIComponent(message);

            // Open WhatsApp with message
            window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');

            // Small delay between opening windows
            if (contacts.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        onClose();
    };

    const handleDownloadPDF = async () => {
        if (!selectedTemplate?.htmlContent || !previewContact) {
            alert('No HTML content to generate PDF');
            return;
        }

        setGeneratingPdf(true);
        try {
            const element = previewRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.querySelector('[data-html-preview]');
                    if (clonedElement) {
                        clonedElement.style.color = '#000000';
                        clonedElement.style.backgroundColor = '#ffffff';
                    }
                },
                ignoreElements: (element) => {
                    return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${selectedTemplate.name}-${previewContact.name}.pdf`);

            alert('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try simplifying your HTML content or check the console for details.');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const previewMessage = selectedTemplate && previewContact
        ? replaceVariables(selectedTemplate.message, previewContact)
        : '';

    const previewHtml = selectedTemplate && previewContact && selectedTemplate.htmlContent
        ? replaceVariables(selectedTemplate.htmlContent, previewContact)
        : '';

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
                                    Select Template
                                </label>
                                <select
                                    value={selectedTemplate?.id || ''}
                                    onChange={(e) => {
                                        const template = templates.find(t => t.id === e.target.value);
                                        setSelectedTemplate(template);
                                        setShowPreview(false);
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                >
                                    <option value="">-- Select a template --</option>
                                    {templates.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Preview Contact Selection (for multi-contact) */}
                            {contacts.length > 1 && selectedTemplate && (
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
                            {selectedTemplate && (
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
                            {showPreview && selectedTemplate && (
                                <div className="mb-6 space-y-4">
                                    {/* Text Message Preview */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Message Preview:</h3>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{previewMessage}</p>
                                        </div>
                                    </div>

                                    {/* HTML/PDF Preview */}
                                    {previewHtml && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-semibold text-gray-700">PDF Preview:</h3>
                                                <button
                                                    onClick={handleDownloadPDF}
                                                    disabled={generatingPdf}
                                                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <Download size={14} />
                                                    {generatingPdf ? 'Generating...' : 'Download PDF'}
                                                </button>
                                            </div>
                                            <div className="border border-gray-300 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                                                <div
                                                    ref={previewRef}
                                                    data-html-preview="true"
                                                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Note: PDF will be generated when sending. You can download it manually using the button above.
                                            </p>
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
                        disabled={!selectedTemplate}
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
