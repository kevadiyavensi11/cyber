import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const updateSearchTerm = useCallback((term) => {
        setSearchTerm(term || '');
    }, []);

    const value = useMemo(() => ({
        searchTerm,
        setSearchTerm: updateSearchTerm
    }), [searchTerm, updateSearchTerm]);

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
