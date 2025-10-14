import React from 'react';
import clsx from 'clsx';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={clsx(
                'w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent',
                className
            )}
            {...props}
        />
    );
});

Input.displayName = 'Input';