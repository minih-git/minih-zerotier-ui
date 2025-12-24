"use client";

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import styles from './users.module.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPassOpen, setIsPassOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Form selection
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setLoading(true);
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setIsAddOpen(false);
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const password = formData.get('password');

        try {
            const res = await fetch(`/api/users/${selectedUser}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setIsPassOpen(false);
            setSelectedUser(null);
            alert('密码修改成功');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async () => {
        try {
            const res = await fetch(`/api/users/${selectedUser}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setIsDeleteOpen(false);
            setSelectedUser(null);
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className={styles.loading}>正在加载用户...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>用户管理</h1>
                <Button variant="primary" onClick={() => setIsAddOpen(true)}>+ 添加用户</Button>
            </header>

            <div className={styles.userList}>
                {users.map(user => (
                    <div key={user.name} className={styles.userCard}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userRole}>管理员</span>
                        </div>
                        <div className={styles.actions}>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSelectedUser(user.name);
                                    setIsPassOpen(true);
                                }}
                            >
                                修改密码
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    setSelectedUser(user.name);
                                    setIsDeleteOpen(true);
                                }}
                            >
                                删除
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add User Modal */}
            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="添加新用户"
            >
                <form onSubmit={handleAddUser}>
                    <div className={styles.formGroup}>
                        <Input name="username" label="用户名 (Username)" required placeholder="输入用户名" />
                        <Input name="password" label="密码 (Password)" required type="password" placeholder="设置初始密码" />
                    </div>
                    <div className={styles.modalActions}>
                        <Button type="submit" variant="primary" style={{ width: '100%' }}>创建用户</Button>
                    </div>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                isOpen={isPassOpen}
                onClose={() => { setIsPassOpen(false); setSelectedUser(null); }}
                title={`修改密码: ${selectedUser}`}
            >
                <form onSubmit={handleChangePassword}>
                    <div className={styles.formGroup}>
                        <Input name="password" label="新密码 (New Password)" required type="password" placeholder="输入新密码" />
                    </div>
                    <div className={styles.modalActions}>
                        <Button type="submit" variant="primary" style={{ width: '100%' }}>确认修改</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => { setIsDeleteOpen(false); setSelectedUser(null); }}
                title="删除用户确认"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>取消</Button>
                        <Button variant="danger" onClick={handleDeleteUser}>确认删除</Button>
                    </>
                }
            >
                <p>确定要删除用户 <strong>{selectedUser}</strong> 吗？此操作不可撤销。</p>
            </Modal>
        </div>
    );
}
