import React, { useState } from 'react';
import { Phone, MessageCircle, Save } from 'lucide-react';

export default function ContactCard({ contact, onStatusChange, onCommentChange, tabName, isSelected, onToggleSelect }) {
    const { name, phone, status, rowNumber, comment: initialComment } = contact;
    const [comment, setComment] = useState(initialComment || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleStatusChange = (e) => {
        onStatusChange(rowNumber, e.target.value);
    };

    const handleCommentBlur = () => {
        if (comment !== initialComment) {
            onCommentChange(rowNumber, comment);
        }
    };

    // Clean phone number for links (remove spaces, etc.)
    const cleanPhone = phone.replace(/\D/g, '');

    const whatsappMessage = encodeURIComponent(
        "Please fill this form to get a complete details brochure on your email.\n" +
        "Please check spam mail also.\n" +
        "https://saket4achievers.app.n8n.cloud/form/32ae5cd8-3ca2-497e-9ad4-1f79f1b0e76f"
    );

    return (
        <div className={`bg-white p-4 rounded-lg shadow-md mb-4 border transition-colors ${isSelected ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(rowNumber)}
                        className="mt-1.5 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                        <p className="text-gray-600">{phone}</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${status === 'Interested' ? 'bg-green-100 text-green-800' :
                    status === 'Not Interested' ? 'bg-red-100 text-red-800' :
                        status === 'Callback' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {status}
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <a
                    href={`tel:${phone}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <Phone size={18} />
                    Call
                </a>
                <a
                    href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <MessageCircle size={18} />
                    WhatsApp
                </a>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                    <option value="New">New</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Callback">Callback</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onBlur={handleCommentBlur}
                    placeholder="Add a comment..."
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                />
            </div>
        </div>
    );
}
