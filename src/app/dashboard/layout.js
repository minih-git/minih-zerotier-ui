import Sidebar from '../../components/layout/Sidebar';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
