import React from 'react';
import { Edit2, Trash2, FileText, Calendar } from 'lucide-react';

export default function TemplateCard({ template, onEdit, onDelete }) {
    const { name, message, htmlContent, modifiedDate, rowNumber } = template;

    // Truncate message for preview
    const truncatedMessage = message.length > 100
        ? message.substring(0, 100) + '...'
        : message;

    return (
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-2 flex-1">
                    <FileText className="text-green-600 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{name}</h3>
                        {modifiedDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Calendar size={12} />
                                <span>Modified: {modifiedDate}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Message Preview */}
            <div className="mb-3">
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                    {truncatedMessage}
                </p>
            </div>

            {/* HTML Content Indicator */}
            {htmlContent && (
                <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        <FileText size={12} />
                        Contains HTML/PDF content
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                    onClick={() => onEdit(template)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                >
                    <Edit2 size={16} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(rowNumber)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </div>
    );
}
