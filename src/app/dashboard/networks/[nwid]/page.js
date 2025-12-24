"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import styles from './details.module.css';

export default function NetworkDetailsPage({ params }) {
    const { nwid } = use(params);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('settings');
    const [saving, setSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [nwid]);

    const loadData = async () => {
        try {
            const res = await api.getNetwork(nwid);
            setData(res);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const handleUpdateNetwork = async (update) => {
        setSaving(true);
        await api.updateNetwork(nwid, update);
        await loadData();
        setSaving(false);
    };

    const handleUpdateMember = async (memberId, update) => {
        // Optimistic update
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                members: prev.members.map(m =>
                    m.id === memberId ? { ...m, ...update } : m
                )
            };
        });

        try {
            await api.updateMember(nwid, memberId, update);
            // Refresh to ensure sync with server
            await loadData();
        } catch (e) {
            console.error(e);
            alert('Failed to update member');
            await loadData(); // Revert on failure
        }
    };

    const handleDeleteMember = async (memberId) => {
        if (confirm('Are you sure you want to delete this member?')) {
            await api.deleteMember(nwid, memberId);
            await loadData();
        }
    };

    const handleDeleteNetwork = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteNetwork = async () => {
        await api.deleteNetwork(nwid);
        window.location.href = '/dashboard/networks';
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const route = {
            target: formData.get('target'),
            via: formData.get('via') || null
        };
        await api.updateRoutes(nwid, route, 'add');
        e.target.reset();
        await loadData();
    };

    const handleAddPool = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const pool = {
            ipRangeStart: formData.get('start'),
            ipRangeEnd: formData.get('end')
        };
        await api.updateIPPools(nwid, pool, 'add');
        e.target.reset();
        await loadData();
    };

    if (loading) return <div className={styles.loading}>Loading network details...</div>;
    if (!data || !data.network) return <div className={styles.error}>Network not found</div>;

    const { network, members } = data;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.breadcrumbs}>
                    <Link href="/dashboard/networks" className={styles.breadcrumbLink}>网络列表</Link>
                    <span className={styles.separator}>/</span>
                    <span className={styles.current}>{network.name}</span>
                </div>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>{network.name}</h1>
                    <div className={styles.meta}>
                        <code className={styles.id}>{network.nwid}</code>
                    </div>
                </div>
            </header>

            <div className={styles.tabs}>
                {['settings', 'members', 'routes', 'ip_pools', 'dns', 'easy_setup'].map(tab => (

                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''} `}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'settings' && '基础设置'}
                        {tab === 'members' && '成员管理'}
                        {tab === 'routes' && '路由管理'}
                        {tab === 'ip_pools' && 'IP池'}
                        {tab === 'dns' && 'DNS设置'}
                        {tab === 'easy_setup' && '简易配置'}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {activeTab === 'settings' && (
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>基础设置</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label className={styles.label}>网络名称</label>
                                <Input
                                    defaultValue={network.name}
                                    onBlur={(e) => handleUpdateNetwork({ name: e.target.value })}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>访问控制</label>
                                <div className={styles.radioGroup}>
                                    <label className={styles.radio}>
                                        <input
                                            type="radio"
                                            name="private"
                                            checked={network.private === true}
                                            onChange={() => handleUpdateNetwork({ private: true })}
                                        />
                                        <span>私有 (需授权)</span>
                                    </label>
                                    <label className={styles.radio}>
                                        <input
                                            type="radio"
                                            name="private"
                                            checked={network.private === false}
                                            onChange={() => handleUpdateNetwork({ private: false })}
                                        />
                                        <span>公开 (无限制)</span>
                                    </label>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>IPv4 自动分配</label>
                                <input
                                    type="checkbox"
                                    checked={network.v4AssignMode?.zt}
                                    onChange={(e) => handleUpdateNetwork({ v4AssignMode: { zt: e.target.checked } })}
                                />
                            </div>
                        </div>


                        <div className={styles.dangerZone}>
                            <h3 className={styles.dangerTitle}>危险区域 (Danger Zone)</h3>
                            <div className={styles.dangerActions}>
                                <div className={styles.dangerInfo}>
                                    <span className={styles.dangerLabel}>删除网络</span>
                                    <p className={styles.dangerDesc}>删除网络将永久移除所有配置和成员，此操作无法撤销。</p>
                                </div>
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteNetwork}
                                >
                                    删除网络
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className={styles.card}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>成员列表 ({members.length})</h2>
                            <Button variant="secondary" onClick={loadData}>刷新</Button>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>名称 / ID</th>
                                        <th className={styles.th}>授权</th>
                                        <th className={styles.th}>桥接</th>
                                        <th className={styles.th}>IP 分配</th>
                                        <th className={styles.th}>节点状态</th>
                                        <th className={styles.th}>延迟/版本</th>
                                        <th className={styles.th}>物理地址</th>
                                        <th className={styles.th}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map(member => (
                                        <tr key={member.id} className={styles.tr}>
                                            <td className={styles.td}>
                                                <input
                                                    className={styles.inlineInput}
                                                    defaultValue={member.name}
                                                    onBlur={(e) => handleUpdateMember(member.id, { name: e.target.value })}
                                                    placeholder="设置名称..."
                                                />
                                                <code className={styles.memberId}>{member.id}</code>
                                            </td>
                                            <td className={styles.centerAlign}>
                                                <Switch
                                                    checked={member.authorized === true}
                                                    onChange={(e) => handleUpdateMember(member.id, { authorized: e.target.checked })}
                                                />
                                            </td>
                                            <td className={styles.centerAlign}>
                                                <Switch
                                                    checked={member.activeBridge === true}
                                                    onChange={(e) => handleUpdateMember(member.id, { activeBridge: e.target.checked })}
                                                />
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.ipList}>
                                                    {member.ipAssignments?.map(ip => (
                                                        <div key={ip} className={styles.ipBadge}>
                                                            {ip}
                                                            <button
                                                                className={styles.miniDelete}
                                                                onClick={() => api.removeMemberIP(nwid, member.id, ip).then(loadData)}
                                                                title="删除 IP"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        className={styles.addIpBtn}
                                                        onClick={() => {
                                                            const ip = prompt('输入 IPv4 或 IPv6 地址:');
                                                            if (ip) api.addMemberIP(nwid, member.id, ip).then(loadData);
                                                        }}
                                                    >
                                                        + IP
                                                    </button>
                                                </div>
                                            </td>
                                            <td className={styles.td}>
                                                <span
                                                    className={styles.statusBadge}
                                                    data-online={member.online}
                                                >
                                                    {member.online ? '在线' : '离线'}
                                                </span>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.peerInfo}>
                                                    <span className={styles.peerValue}>{member.latency}</span>
                                                    <br />
                                                    <span className={styles.peerLabel}>v{member.version}</span>
                                                </div>
                                            </td>
                                            <td className={styles.td}>
                                                <code className={styles.peerValue}>{member.physicalAddress}</code>
                                            </td>
                                            <td className={styles.td}>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                                                >
                                                    移除
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'routes' && (
                    <div className={styles.card}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>管理路由 (Managed Routes)</h2>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>目标网段 (Target)</th>
                                        <th className={styles.th}>网关 (Via)</th>
                                        <th className={styles.th} style={{ width: '100px' }}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {network.routes?.map((route, i) => (
                                        <tr key={i} className={styles.tr}>
                                            <td className={styles.td}>
                                                <code className={styles.codeValue}>{route.target}</code>
                                            </td>
                                            <td className={styles.td}>
                                                {route.via ? <code className={styles.codeValue}>{route.via}</code> : <span className={styles.dimText}>Local (直连)</span>}
                                            </td>
                                            <td className={styles.td}>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => api.updateRoutes(nwid, route, 'delete').then(loadData)}
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                >
                                                    删除
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!network.routes || network.routes.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className={styles.emptyState}>暂无已配置的路由</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.formDivider}></div>

                        <h3 className={styles.subTitle}>添加新路由</h3>
                        <form className={styles.inlineForm} onSubmit={handleAddRoute}>
                            <div className={styles.inlineField} style={{ flex: 2 }}>
                                <Input name="target" placeholder="例如: 10.0.0.0/24" required />
                            </div>
                            <div className={styles.inlineField} style={{ flex: 1.5 }}>
                                <Input name="via" placeholder="网关 (选填)" />
                            </div>
                            <Button type="submit" variant="secondary" style={{ height: '42px' }}>添加</Button>
                        </form>
                    </div>
                )}

                {activeTab === 'ip_pools' && (
                    <div className={styles.card}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>IP 分配池 (Assignment Pools)</h2>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>起始 IP (Start)</th>
                                        <th className={styles.th}>结束 IP (End)</th>
                                        <th className={styles.th} style={{ width: '100px' }}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {network.ipAssignmentPools?.map((pool, i) => (
                                        <tr key={i} className={styles.tr}>
                                            <td className={styles.td}>
                                                <code className={styles.codeValue}>{pool.ipRangeStart}</code>
                                            </td>
                                            <td className={styles.td}>
                                                <code className={styles.codeValue}>{pool.ipRangeEnd}</code>
                                            </td>
                                            <td className={styles.td}>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => api.updateIPPools(nwid, pool, 'delete').then(loadData)}
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                >
                                                    删除
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!network.ipAssignmentPools || network.ipAssignmentPools.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className={styles.emptyState}>暂无 IP 分配池</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.formDivider}></div>

                        <h3 className={styles.subTitle}>添加 IP 池</h3>
                        <form className={styles.inlineForm} onSubmit={handleAddPool}>
                            <div className={styles.inlineField} style={{ flex: 1 }}>
                                <Input name="start" placeholder="起始 IP" required />
                            </div>
                            <div className={styles.inlineField} style={{ flex: 1 }}>
                                <Input name="end" placeholder="结束 IP" required />
                            </div>
                            <Button type="submit" variant="secondary" style={{ height: '42px' }}>添加</Button>
                        </form>
                    </div>
                )}

                {activeTab === 'dns' && (
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>DNS 设置</h2>
                        <div className={styles.formGrid}>
                            <Input
                                label="搜索域名 (Search Domain)"
                                defaultValue={network.dns?.domain}
                                onBlur={(e) => handleUpdateNetwork({ dns: { ...network.dns, domain: e.target.value } })}
                            />
                            {/* In a real app, this would be a textarea for multiple IPs */}
                        </div>
                    </div>
                )}
                {activeTab === 'easy_setup' && (
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>简易配置 (Easy Setup)</h2>
                        <p className={styles.helpText}>自动为特定子网配置路由与 IP 分配池。</p>
                        <form className={styles.wizardForm} onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const subnet = formData.get('subnet');
                            const start = formData.get('start');
                            const end = formData.get('end');
                            await api.easySetup(nwid, {
                                routes: [{ target: subnet, via: null }],
                                ipAssignmentPools: [{ ipRangeStart: start, ipRangeEnd: end }],
                                v4AssignMode: { zt: true }
                            });
                            alert('网络配置成功！');
                            loadData();
                        }}>
                            <div className={styles.wizardGrid}>
                                <div className={styles.wizardFullRow}>
                                    <Input label="子网 (CIDR)" name="subnet" placeholder="10.147.17.0/24" required />
                                </div>
                                <Input label="IP 池起始" name="start" placeholder="10.147.17.1" required />
                                <Input label="IP 池结束" name="end" placeholder="10.147.17.254" required />
                            </div>
                            <div className={styles.wizardActions}>
                                <Button type="submit" variant="primary">应用配置</Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>


            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="删除网络确认"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>取消</Button>
                        <Button variant="danger" onClick={confirmDeleteNetwork}>确认删除</Button>
                    </>
                }
            >
                <p>确定要删除这个网络吗？此操作将永久移除所有配置和成员，且不可恢复。</p>
            </Modal>
        </div >
    );
}
