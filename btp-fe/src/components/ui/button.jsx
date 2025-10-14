import React from 'react';
import clsx from 'clsx';

export const Button = ({ children, variant = 'default', className = '', ...props }) => {
    const baseStyle = 'rounded-full px-4 py-2 font-medium transition-all duration-200';
    const variants = {
        default: 'bg-[#4A6FA5] text-white hover:bg-[#3B5B86]',
        outline: 'border border-[#4A6FA5] text-[#4A6FA5] hover:bg-[#4A6FA5] hover:text-white',
        ghost: 'text-gray-700 hover:text-[#4A6FA5] hover:bg-gray-100',
    };

    return (
        <button className={clsx(baseStyle, variants[variant], className)} {...props}>
            {children}
        </button>
    );
};