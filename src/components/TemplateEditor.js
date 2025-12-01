'use client';

import React, { useState, useRef } from 'react';
import { Save, X, Eye, Code, FileText, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function TemplateEditor({ template, onSave, onCancel }) {
    const [name, setName] = useState(template?.name || '');
    const [message, setMessage] = useState(template?.message || '');
    const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
    const [showPreview, setShowPreview] = useState(false);
    const [showHtmlEditor, setShowHtmlEditor] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const previewRef = useRef(null);

    const handleSave = () => {
        if (!name.trim() || !message.trim()) {
            alert('Please fill in template name and message');
            return;
        }

        onSave({
            name: name.trim(),
            message: message.trim(),
            htmlContent: htmlContent.trim(),
        });
    };

    const insertVariable = (variable) => {
        const textarea = document.getElementById('message-textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.substring(0, start) + variable + message.substring(end);
        setMessage(newMessage);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length, start + variable.length);
        }, 0);
    };

    const generatePDF = async () => {
        if (!htmlContent) {
            alert('No HTML content to generate PDF');
            return;
        }

        setGeneratingPdf(true);
        try {
            const element = previewRef.current;

            if (!element) {
                throw new Error('Preview element not found');
            }

            // Create PDF directly from HTML using jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Add title
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text(name || 'Template', 20, 20);

            // Add content as text (simple fallback)
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            const textContent = element.textContent || htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const lines = pdf.splitTextToSize(textContent, 170);
            pdf.text(lines, 20, 35);

            pdf.save(`${name || 'template'}.pdf`);
            alert('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Failed to generate PDF: ${error.message}\n\nPlease check the console for details.`);
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {template ? 'Edit Template' : 'Create New Template'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Template Name */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Welcome Message, Follow-up, Brochure Request"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
            </div>

            {/* Message Content */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Message Content *
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => insertVariable('{{name}}')}
                            className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100"
                        >
                            + {'{{name}}'}
                        </button>
                        <button
                            onClick={() => insertVariable('{{phone}}')}
                            className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100"
                        >
                            + {'{{phone}}'}
                        </button>
                    </div>
                </div>
                <textarea
                    id="message-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your WhatsApp message here. Use {{name}} and {{phone}} as placeholders."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Use {'{{name}}'} and {'{{phone}}'} to insert dynamic values
                </p>
            </div>

            {/* HTML Content Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        HTML Content (Optional - for PDF generation)
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowHtmlEditor(!showHtmlEditor)}
                            className={`text-xs px-3 py-1 rounded flex items-center gap-1 ${showHtmlEditor
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Code size={14} />
                            {showHtmlEditor ? 'Hide' : 'Show'} HTML Editor
                        </button>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`text-xs px-3 py-1 rounded flex items-center gap-1 ${showPreview
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Eye size={14} />
                            {showPreview ? 'Hide' : 'Show'} Preview
                        </button>
                    </div>
                </div>

                {showHtmlEditor && (
                    <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="Enter HTML code here (e.g., <h1>Hello {{name}}</h1><p>Your details...</p>)"
                        rows={10}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm bg-gray-50 mb-3"
                    />
                )}

                {showPreview && htmlContent && (
                    <div className="border border-gray-300 rounded-lg p-4 bg-white mb-3">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                <FileText size={16} />
                                PDF Preview
                            </h3>
                            <button
                                onClick={generatePDF}
                                disabled={generatingPdf}
                                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Download size={14} />
                                {generatingPdf ? 'Generating...' : 'Download PDF'}
                            </button>
                        </div>
                        <div
                            ref={previewRef}
                            data-html-preview="true"
                            className="border border-gray-200 rounded p-4 bg-white"
                            style={{ color: '#000000', backgroundColor: '#ffffff' }}
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                    <Save size={20} />
                    Save Template
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"
                >
                    <X size={20} />
                    Cancel
                </button>
            </div>
        </div>
    );
}
