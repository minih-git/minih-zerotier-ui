"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';
import { Icons } from '@/components/icons/Icons';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getStats().then(data => {
            setStats(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // Helper to calculate percentages or defaults (mock logic for demo if data missing)
    const onlinePercentage = stats?.totalMembers ? Math.round((stats.onlineMembers / stats.totalMembers) * 100) : 0;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.welcome}>
                    <h1>你好, Admin 👋</h1>
                    <p>欢迎回到 ZeroTier 控制台</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/dashboard/networks/create">
                        <button className={styles.actionBtn}><Icons.Plus size={18} /> 添加网络</button>
                    </Link>
                    <button className={styles.actionBtnPrimary} onClick={() => window.location.reload()}>
                        <Icons.Refresh size={18} /> 刷新数据
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <Link href="/dashboard/networks" className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.blue}`}>
                        <Icons.Network size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{stats?.networksCount || '0'}</div>
                        <div className={styles.statLabel}>网络总数</div>
                    </div>
                </Link>

                <Link href="/dashboard/networks" className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.green}`}>
                        <Icons.CheckCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{onlinePercentage}%</div>
                        <div className={styles.statLabel}>节点在线率</div>
                        <span className={styles.tagSuccess}>运行正常</span>
                    </div>
                </Link>

                <Link href="/dashboard/users" className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.purple}`}>
                        <Icons.Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{stats?.totalUsers || '0'}</div>
                        <div className={styles.statLabel}>系统用户</div>
                    </div>
                </Link>

                <Link href="/dashboard/networks" className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.orange}`}>
                        <Icons.AlertTriangle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>0</div>
                        <div className={styles.statLabel}>异常节点</div>
                        <span className={styles.tagWarning}>&lt; 1%</span>
                    </div>
                </Link>
            </div>

            {/* Content Sections */}
            <div className={styles.contentGrid}>
                {/* Current Account / Network Info */}
                <div className={styles.sectionCard}>
                    <div className={styles.cardHeader}>
                        <Icons.CheckCircle size={20} className={styles.cIcon} />
                        <h3>当前控制器状态</h3>
                    </div>
                    <div className={styles.accountInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>控制器版本</span>
                            <span className={styles.value}>v{stats?.version || '1.10.1'}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressLabel}>
                                <span>系统负载</span>
                                <span className={styles.colorGreen}>3%</span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div className={styles.progressFill} style={{ width: '3%' }}></div>
                            </div>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressLabel}>
                                <span>API 响应</span>
                                <span className={styles.colorBlue}>24ms</span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div className={`${styles.progressFill} ${styles.bgBlue}`} style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.cardFooter}>
                        <button className={styles.cardBtn}>切换控制器</button>
                    </div>
                </div>

                {/* Recommendations */}
                <div className={styles.sectionCard}>
                    <div className={styles.cardHeader}>
                        <Icons.Sparkles size={20} className={styles.cIconPrimary} />
                        <h3>快捷操作</h3>
                    </div>

                    <div className={styles.recommendList}>
                        <Link href="/dashboard/networks" className={styles.recommendItem}>
                            <span className={styles.recTag}>管理</span>
                            <div className={styles.recContent}>
                                <div className={styles.recTitle}>网络列表</div>
                                <div className={styles.recDesc}>查看和配置虚拟网络</div>
                            </div>
                            <div className={styles.recAction}><span className={styles.badge}>Go</span></div>
                        </Link>

                        <Link href="/dashboard/users" className={`${styles.recommendItem} ${styles.blueItem}`}>
                            <span className={`${styles.recTag} ${styles.blueTag}`}>用户</span>
                            <div className={styles.recContent}>
                                <div className={styles.recTitle}>用户管理</div>
                                <div className={styles.recDesc}>添加或移除管理员</div>
                            </div>
                            <div className={styles.recAction}><span className={`${styles.badge} ${styles.blueBadge}`}>Go</span></div>
                        </Link>
                    </div>

                    <div className={styles.cardFooter}>
                        <button className={styles.mainBtn}>查看所有功能</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
