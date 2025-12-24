"use client";

import { useState, useEffect } from 'react';
import styles from './settings.module.css';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
    const [config, setConfig] = useState({ ztAddr: '', ztToken: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
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
                body: JSON.stringify(config)
            });

            if (res.ok) {
                setMessage('Settings saved successfully. Restart may be required for some changes.');
            } else {
                setMessage('Failed to save settings.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>设置</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.card}>
                <h2 className={styles.sectionTitle}>ZeroTier 控制器配置</h2>
                <div className={styles.formGroup}>
                    <Input
                        label="控制器 API 地址"
                        value={config.ztAddr}
                        onChange={e => setConfig({ ...config, ztAddr: e.target.value })}
                        placeholder="http://localhost:9993"
                    />
                    <Input
                        label="API Token (留空保持不变)"
                        type="password"
                        value={config.ztToken}
                        onChange={e => setConfig({ ...config, ztToken: e.target.value })}
                        placeholder="Enter new token to update"
                    />
                </div>

                {message && <div className={styles.message}>{message}</div>}

                <div className={styles.actions}>
                    <Button type="submit" disabled={saving}>
                        {saving ? '保存中...' : '保存配置'}
                    </Button>
                </div>
            </form>

            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>应用信息</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>版本</span>
                        <span className={styles.value}>1.0.0 (Next.js UI)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
