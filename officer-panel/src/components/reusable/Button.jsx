import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled = false,
    loading = false
}) => {
    const baseStyles = "px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm";

    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200 hover:shadow-lg hover:shadow-primary-300",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-200 hover:shadow-lg hover:shadow-red-300",
        ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
        glass: "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            {children}
        </button>
    );
};

export default Button;
