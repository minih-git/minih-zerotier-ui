"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { Icons } from '@/components/icons/Icons';

const menuItems = [
    { label: '概览', path: '/dashboard', icon: Icons.Dashboard },
    { label: '网络管理', path: '/dashboard/networks', icon: Icons.Network },
    { label: '用户管理', path: '/dashboard/users', icon: Icons.Users },
    { label: '系统设置', path: '/dashboard/settings', icon: Icons.Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>
                        <Icons.Sparkles size={20} />
                    </div>
                    <span className={styles.brandName}>ZT Controller</span>
                </div>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <Icon size={20} className={styles.icon} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="avatar" className={styles.avatar} />
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>Admin</span>
                        <span className={styles.userRole}>管理员</span>
                    </div>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout} title="退出登录">
                    <Icons.Logout size={20} />
                </button>
            </div>
        </aside>
    );
}
