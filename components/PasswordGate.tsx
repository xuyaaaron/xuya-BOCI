
import React, { useState, useEffect } from 'react';

interface PasswordGateProps {
    children: React.ReactNode;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        setIsChecking(false);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '888') {
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPassword('');
            // Shake effect or simple feedback
            setTimeout(() => setError(false), 500);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boc-red"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="bg-boc-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">太平桥策略</h1>
                    <p className="text-gray-500 mt-2">请输入访问密码以继续</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="访问密码"
                            className={`w-full px-4 py-3 bg-gray-100 border-2 rounded-xl outline-none transition-all duration-200 text-center text-xl tracking-widest ${error ? 'border-red-500 animate-shake' : 'border-transparent focus:border-boc-red focus:bg-white'
                                }`}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-boc-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        进入系统
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    © 2026 太平桥策略 · 版权所有
                </div>
            </div>

            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
        </div>
    );
};
