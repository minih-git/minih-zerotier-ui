import styles from './Switch.module.css';

export default function Switch({ checked, onChange, disabled = false, className = '' }) {
    return (
        <label className={`${styles.switch} ${disabled ? styles.disabled : ''} ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={styles.input}
            />
            <span className={styles.slider}></span>
        </label>
    );
}
