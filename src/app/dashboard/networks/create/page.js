"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { api } from '../../../../lib/api';
import styles from './create.module.css';

export default function CreateNetworkPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await api.createNetwork(name);
        setLoading(false);
        router.push('/dashboard/networks');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Create Network</h1>
                <p className={styles.subtitle}>Initialize a new secure virtual network</p>
            </header>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Network Name"
                        placeholder="e.g. Office VPN"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <div className={styles.actions}>
                        <Button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Network'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
