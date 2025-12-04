'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, FileText, Paperclip, Eye, ExternalLink } from 'lucide-react';

// Available PDF files
const AVAILABLE_PDFS = [
    { name: '4Achievers – Advanced n8n + AI Agents Professional Program 2025.pdf', label: 'n8n + AI Agents Program 2025' },
    { name: '4Achievers – Data Science & GenAI Syllabus.pdf', label: 'Data Science & GenAI' },
    { name: '4Achievers – Detailed QA Automation Syllabus.pdf', label: 'QA Automation' },
    { name: '4Achievers – DevOps & Cloud Syllabus.pdf', label: 'DevOps & Cloud' },
    { name: '4Achievers – UI_UX Design Syllabus.pdf', label: 'UI/UX Design' },
];

export default function TemplateEditor({ template, onSave, onCancel }) {
    const [name, setName] = useState(template?.name || '');
    const [message, setMessage] = useState(template?.message || '');
    const [pdfFile, setPdfFile] = useState(template?.pdfFile || '');
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const handleSave = () => {
        if (!name.trim() || !message.trim()) {
            alert('Please fill in template name and message');
            return;
        }

        onSave({
            name: name.trim(),
            message: message.trim(),
            pdfFile: pdfFile,
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

    const getPdfUrl = (fileName) => {
        return `/pdfffiles/${encodeURIComponent(fileName)}`;
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

            {/* PDF Attachment Section */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Paperclip size={16} className="inline mr-1" />
                    Attach PDF (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    Select a PDF syllabus to attach with this template
                </p>
                
                <select
                    value={pdfFile}
                    onChange={(e) => {
                        setPdfFile(e.target.value);
                        setShowPdfPreview(false);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                >
                    <option value="">-- No PDF attachment --</option>
                    {AVAILABLE_PDFS.map((pdf) => (
                        <option key={pdf.name} value={pdf.name}>
                            {pdf.label}
                        </option>
                    ))}
                </select>

                {/* PDF Preview/Actions */}
                {pdfFile && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="text-blue-600" size={20} />
                                <span className="text-sm font-medium text-blue-800">
                                    {AVAILABLE_PDFS.find(p => p.name === pdfFile)?.label || pdfFile}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                                >
                                    <Eye size={14} />
                                    {showPdfPreview ? 'Hide' : 'Preview'}
                                </button>
                                <a
                                    href={getPdfUrl(pdfFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1"
                                >
                                    <ExternalLink size={14} />
                                    Open
                                </a>
                            </div>
                        </div>
                        
                        {showPdfPreview && (
                            <div className="mt-3">
                                <iframe
                                    src={getPdfUrl(pdfFile)}
                                    className="w-full h-96 border border-gray-300 rounded-lg bg-white"
                                    title="PDF Preview"
                                />
                            </div>
                        )}
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
