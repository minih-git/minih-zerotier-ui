"use client";

import { useState, useEffect } from 'react';
import styles from './settings.module.css';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
    const [backends, setBackends] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.backends) {
                    setBackends(data.backends);
                    setActiveId(data.activeId || (data.backends[0] && data.backends[0].id) || '');
                } else if (data.ztAddr) {
                    // Fallback for very old API cache if any
                    setBackends([{ id: 'default', name: 'Default', ztAddr: data.ztAddr, ztToken: '' }]);
                    setActiveId('default');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeId, backends })
            });

            if (res.ok) {
                setMessage('Settings saved successfully.');
                // Refetch to ensure state is clean (e.g. tokens masked)
                const data = await res.json();
                if (data.config && data.config.backends) {
                    setBackends(data.config.backends.map(b => ({ ...b, ztToken: b.ztToken ? '******' : '' })));
                    setActiveId(data.config.activeId);
                }
            } else {
                setMessage('Failed to save settings.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const addBackend = () => {
        const newId = Date.now().toString();
        const newBackend = {
            id: newId,
            name: `New Backend ${backends.length + 1}`,
            ztAddr: 'http://localhost:9333',
            ztToken: ''
        };
        setBackends([...backends, newBackend]);
        if (!activeId) setActiveId(newId);
    };

    const removeBackend = (id) => {
        if (backends.length <= 1) {
            alert("At least one backend is required.");
            return;
        }
        const newBackends = backends.filter(b => b.id !== id);
        setBackends(newBackends);
        if (activeId === id) {
            setActiveId(newBackends[0].id);
        }
    };

    const updateBackend = (id, field, value) => {
        setBackends(backends.map(b =>
            b.id === id ? { ...b, [field]: value } : b
        ));
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>系统设置</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles.sectionTitle}>ZeroTier 服务端管理</h2>
                    <Button type="button" onClick={addBackend} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        + 添加服务端
                    </Button>
                </div>

                <div className={styles.backendGrid}>
                    {backends.map((backend, index) => {
                        const isActive = activeId === backend.id;
                        return (
                            <div
                                key={backend.id}
                                className={`${styles.backendCard} ${isActive ? styles.backendCardActive : ''}`}
                                onClick={() => setActiveId(backend.id)}
                            >
                                <div className={styles.cardHeader}>
                                    <div>
                                        {isActive ? (
                                            <span className={styles.activeBadge}>
                                                ✓ 当前使用
                                            </span>
                                        ) : (
                                            <span className={styles.label} style={{ fontSize: '0.75rem' }}>点击切换</span>
                                        )}
                                    </div>
                                    {backends.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeBackend(backend.id); }}
                                            className={styles.deleteButton}
                                            title="删除此配置"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6L6 18M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className={styles.formGroup} onClick={e => e.stopPropagation()}>
                                    <Input
                                        label={`服务名称`}
                                        value={backend.name || ''}
                                        onChange={e => updateBackend(backend.id, 'name', e.target.value)}
                                        placeholder="例如: 本地开发环境"
                                    />
                                    <Input
                                        label="API 地址"
                                        value={backend.ztAddr}
                                        onChange={e => updateBackend(backend.id, 'ztAddr', e.target.value)}
                                        placeholder="http://localhost:9333"
                                    />
                                    <Input
                                        label="API Token"
                                        type="password"
                                        value={backend.ztToken}
                                        onChange={e => updateBackend(backend.id, 'ztToken', e.target.value)}
                                        placeholder={backend.ztToken === '******' ? 'Token 已保存' : '请输入 API Token'}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {message && <div className={styles.message} style={{ marginTop: '20px' }}>{message}</div>}

                <div className={styles.actions} style={{ marginTop: '30px' }}>
                    <Button type="submit" disabled={saving}>
                        {saving ? '保存中...' : '保存所有配置'}
                    </Button>
                </div>
            </form>

            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>应用信息</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>版本</span>
                        <span className={styles.value}>1.1.0 (Multi-Backend Support)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
