import React, { useState } from 'react';

interface AdminConsoleProps {
    show: boolean;
    onClose: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ show, onClose }) => {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        if (!password) {
            setStatus('请输入密码');
            return;
        }

        setIsUpdating(true);
        setStatus('正在同步中，请稍候...');

        try {
            // 注意：需要根据实际部署环境修改 API 地址
            const apiUrl = 'http://110.40.129.184:5000/api/update';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setStatus('✅ 更新成功！网页将在3秒后刷新...');
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                setStatus(`❌ 失败：${result.message || '未知错误'}`);
            }
        } catch (error) {
            setStatus('❌ 请求失败，请检查后端 API 是否运行');
            console.error('Update error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">管理员控制台</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            更新密码
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="输入管理员密码"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-boc-red"
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                        />
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${isUpdating
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-boc-red hover:bg-red-700'
                            }`}
                    >
                        {isUpdating ? '更新中...' : '同步 GitHub 数据并刷新'}
                    </button>

                    {status && (
                        <div
                            className={`p-3 rounded-md text-sm ${status.startsWith('✅')
                                ? 'bg-green-50 text-green-800'
                                : status.startsWith('❌')
                                    ? 'bg-red-50 text-red-800'
                                    : 'bg-blue-50 text-blue-800'
                                }`}
                        >
                            {status}
                        </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                        <p>功能说明：</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                            <li>从 GitHub 拉取最新代码</li>
                            <li>重新生成静态数据快照</li>
                            <li>自动刷新网页显示最新数据</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
