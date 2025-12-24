"use client";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from '../login/login.module.css';

export default function SetupPage() {
    const router = useRouter();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [initError, setInitError] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();
                if (data.initialized) {
                    router.push('/login');
                } else {
                    setChecking(false);
                }
            } catch (err) {
                setInitError('Failed to connect to server. Please ensure the backend is running.');
                setChecking(false);
            }
        };
        checkStatus();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 10) {
            setError('Password must be at least 10 characters long');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/login');
            } else {
                setError(data.error || 'Setup failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checking) return null;

    if (initError) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title} style={{ color: '#ef4444' }}>System Error</h1>
                        <p className={styles.subtitle}>{initError}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>System Setup</h1>
                    <p className={styles.subtitle}>Create your initial administrator account</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <Input
                        label="Admin Username"
                        type="text"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        label="Admin Password"
                        type="password"
                        placeholder="Min 10 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                    <Button variant="primary" type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Initializing...' : 'Create Admin Account'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
