import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical Failure in Sector Segment:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10">
                    <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] border border-red-100 shadow-xl text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-200/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Protocol Exception</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
                            A critical runtime error has occurred in the viewport segment. Logic uplink severed.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95"
                        >
                            Restart Uplink
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
