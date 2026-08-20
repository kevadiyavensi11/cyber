import React, { useState } from 'react';
import { Upload, File, X, CheckCircle2 } from 'lucide-react';

const FileUpload = ({ onFileSelect, label = "Upload Evidence" }) => {
    const [file, setFile] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            onFileSelect(droppedFile);
        }
    };

    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            onFileSelect(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        onFileSelect(null);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">{label}</label>

            {!file ? (
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative group cursor-pointer"
                >
                    <input
                        type="file"
                        onChange={handleChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-primary-500 group-hover:bg-primary-50/50 transition-all">
                        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary-100 group-hover:text-primary-600 text-gray-400 transition-colors">
                            <Upload size={24} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">Images or PDFs (Max. 10MB)</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-2xl animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-600 text-white rounded-lg">
                            <File size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        onClick={removeFile}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-red-500"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
