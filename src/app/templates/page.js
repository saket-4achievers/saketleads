'use client';

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, FileText, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import TemplateCard from '@/components/TemplateCard';
import TemplateEditor from '@/components/TemplateEditor';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
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

    const handleCreateNew = () => {
        setEditingTemplate(null);
        setShowEditor(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowEditor(true);
    };

    const handleDelete = async (rowNumber) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const res = await fetch(`/api/templates?rowNumber=${rowNumber}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                fetchTemplates();
                alert('Template deleted successfully');
            } else {
                alert('Failed to delete template: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template');
        }
    };

    const handleSave = async (templateData) => {
        try {
            const isEditing = editingTemplate !== null;
            const url = '/api/templates';
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing
                ? { ...templateData, rowNumber: editingTemplate.rowNumber }
                : templateData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (data.success) {
                setShowEditor(false);
                setEditingTemplate(null);
                fetchTemplates();
                alert(isEditing ? 'Template updated successfully' : 'Template created successfully');
            } else {
                alert('Failed to save template: ' + data.error);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                <ArrowLeft size={20} />
                            </button>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="text-green-600" />
                            WhatsApp Templates
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchTemplates}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : showEditor ? (
                    <TemplateEditor
                        template={editingTemplate}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowEditor(false);
                            setEditingTemplate(null);
                        }}
                    />
                ) : (
                    <>
                        {/* Create New Button */}
                        <button
                            onClick={handleCreateNew}
                            className="w-full mb-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl font-medium"
                        >
                            <Plus size={24} />
                            Create New Template
                        </button>

                        {/* Templates List */}
                        {templates.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No templates found. Create your first template!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {templates.map((template) => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
