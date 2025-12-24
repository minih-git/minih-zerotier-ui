"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '../../../components/ui/Button';
import { api } from '../../../lib/api';
import styles from './networks.module.css';

export default function NetworksPage() {
    const [networks, setNetworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadNetworks();
    }, []);

    const loadNetworks = async () => {
        try {
            const data = await api.getNetworks();
            if (data && data.error) {
                setError(data.error);
                setNetworks([]);
            } else if (Array.isArray(data)) {
                setNetworks(data);
                setError(null);
            } else {
                // Fallback for unexpected format
                setNetworks([]);
                setError("Unexpected response format");
            }
        } catch (err) {
            setError(err.message || "Failed to load networks");
            setNetworks([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>网络列表</h1>
                    <p className={styles.subtitle}>管理您的虚拟网络</p>
                </div>
                <Link href="/dashboard/networks/create">
                    <Button variant="primary">创建新网络</Button>
                </Link>
            </header>

            {loading ? (
                <div className={styles.loading}>正在加载网络...</div>
            ) : error ? (
                <div style={{ color: 'red', padding: '20px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
                    <h3>Error Loading Networks</h3>
                    <p>{error}</p>
                    <Link href="/dashboard/settings" style={{ textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                        Go to Settings to configure API
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {networks.map((network) => (
                        <Link key={network.nwid} href={`/dashboard/networks/${network.nwid}`} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.statusIndicator} data-status={network.status}></div>
                                <h3 className={styles.networkName}>{network.name}</h3>
                                {network.accessIndex === 'PRIVATE' && <span className={styles.badge}>私有</span>}
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>网络 ID</span>
                                    <span className={styles.value}>{network.nwid}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>子网网段</span>
                                    <span className={styles.value}>{network.subnet}</span>
                                </div>
                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statNum}>{network.onlineCount || 0}</span>
                                        <span className={styles.statLabel}>在线</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statNum}>{network.memberCount || 0}</span>
                                        <span className={styles.statLabel}>总节点</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
