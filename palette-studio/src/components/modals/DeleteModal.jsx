import React from 'react';
import { AlertCircle } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm, title = "Delete Palette?", message = "This action cannot be reversed. Your design system will be lost forever." }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[250] p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-neumorphic-bg rounded-[40px] shadow-2xl p-8 md:p-10 max-w-sm w-full animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <AlertCircle size={24} className="text-rose-500" />
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Delete</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Action</p>
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 mb-10 font-bold text-sm leading-relaxed">{message}</p>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-2xl bg-transparent text-slate-400 hover:text-slate-600 hover:shadow-neu-pressed-sm transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-2xl bg-rose-500 text-white shadow-lg hover:bg-rose-600 neu-pressed-rose transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
