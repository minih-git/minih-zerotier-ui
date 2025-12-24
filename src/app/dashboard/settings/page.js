"use client";

import styles from './settings.module.css';

export default function SettingsPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>设置</h1>
            </header>

            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>控制器信息</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>ZeroTier 地址</span>
                        <span className={styles.value}>localhost:9993</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Token 状态</span>
                        <span className={styles.value}>已配置</span>
                    </div>
                </div>
            </div>

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
