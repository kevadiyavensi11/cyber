import React from 'react';

const InputField = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    icon: Icon,
    error,
    required = false,
    className = ""
}) => {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 bg-white border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400`}
                />
            </div>
            {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
        </div>
    );
};

export default InputField;
