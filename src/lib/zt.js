import got from 'got';
import { getItem } from './db/storage';

const ENV_ZT_ADDR = process.env.ZT_ADDR || 'http://localhost:9333';

// Mock Data Store
let mockNetworks = [
    { nwid: 'mock_nwid_123456', name: 'Mock Network 1', status: 'OK' }
];

async function getZtConfig() {
    const config = await getItem('zt_config') || {};

    // Support for new multi-backend structure
    if (config.backends && Array.isArray(config.backends) && config.backends.length > 0) {
        const active = config.backends.find(b => b.id === config.activeId) || config.backends[0];
        return {
            addr: active.ztAddr || ENV_ZT_ADDR,
            token: active.ztToken
        };
    }

    // Fallback/Legacy support
    return {
        addr: config.ztAddr || ENV_ZT_ADDR,
        token: config.ztToken
    };
}

async function initOptions() {
    try {
        const { addr, token } = await getZtConfig();
        const tok = token || await getToken(); // Use DB token or fallback to file/env

        return {
            options: {
                // Removed to avoid conflict with absolute URLs used below
                responseType: 'json',
                headers: { 'X-ZT1-Auth': tok },
                timeout: {
                    lookup: 1000,
                    connect: 5000,
                    secureConnect: 5000,
                    socket: 10000,
                    send: 10000,
                    response: 30000
                },
                retry: {
                    limit: 2,
                    methods: ['GET', 'POST', 'DELETE'],
                    statusCodes: [408, 413, 429, 500, 502, 503, 504]
                },
                // Allow self-signed certs (common for localhost/internal ZT controllers)
                https: { rejectUnauthorized: false },
                hooks: {
                    beforeRequest: [
                        options => {
                            console.log(`[ZT-API] Request: ${options.method} ${options.url}`);
                        }
                    ],
                    afterResponse: [
                        response => {
                            console.log(`[ZT-API] Response: ${response.statusCode} ${response.url}`);
                            if (response.body) {
                                try {
                                    console.log(`[ZT-API] Body:`, JSON.stringify(response.body).substring(0, 1000));
                                } catch (e) { /* ignore */ }
                            }
                            return response;
                        }
                    ],
                    beforeError: [
                        error => {
                            console.log(`[ZT-API] Error: ${error.message} ${error.request?.requestUrl || ''}`);
                            return error;
                        }
                    ]
                }
            },
            isMock: false,
            // Pass addr back if needed specifically, but prefixUrl handles requests
            baseUrl: addr
        };
    } catch (e) {
        console.error("ZeroTier Init Error:", e.message);
        // Reseting mock data to default but with error message
        mockNetworks = [
            {
                nwid: 'mock_error',
                name: `MOCK MODE - Error: ${e.message}`,
                status: 'ERROR'
            }
        ];

        return {
            options: { responseType: 'json' },
            isMock: true,
            baseUrl: ''
        };
    }
}

// Re-export getNetworks properly
export async function getNetworks() {
    try {
        const { options, isMock, baseUrl } = await initOptions();
        if (isMock) {
            return mockNetworks;
        }

        // Note: got options has prefixUrl set if we entered initOptions successfully
        // But to be consistent with existing code structure which used template literal with global var:
        // We will use the baseUrl returned from initOptions

        const response = await got(`${baseUrl}/controller/network`, options);
        const nwids = response.body;

        const networks = [];
        for (const nwid of nwids) {
            try {
                const netRes = await got(`${baseUrl}/controller/network/${nwid}`, options);
                networks.push(netRes.body);
            } catch (innerErr) {
                console.error(`Failed to fetch details for network ${nwid}:`, innerErr);
            }
        }
        return networks;
    } catch (err) {
        if (err.response && (err.response.statusCode === 401 || err.response.statusCode === 403)) {
            console.error(`ZeroTier API Unauthorized: ${err.message}`);
            throw new Error("Invalid ZeroTier API Token");
        }
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND') {
            console.error(`ZeroTier Controller Unreachable: ${err.message}`);
            throw new Error("ZeroTier Controller Unreachable");
        }
        console.error("Error in getNetworks:", err);
        throw err;
    }
}

export async function getNetwork(nwid) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) {
        return mockNetworks.find(n => n.nwid === nwid) || { nwid, name: 'Unknown Mock' };
    }
    try {
        const response = await got(`${baseUrl}/controller/network/${nwid}`, options);
        return response.body;
    } catch (err) {
        if (err.response && err.response.statusCode === 404) {
            return null;
        }
        throw err;
    }
}

export async function updateNetwork(nwid, data) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) {
        const idx = mockNetworks.findIndex(n => n.nwid === nwid);
        if (idx !== -1) mockNetworks[idx] = { ...mockNetworks[idx], ...data };
        return mockNetworks[idx];
    }
    options.method = 'POST';
    options.json = data;
    const response = await got(`${baseUrl}/controller/network/${nwid}`, options);
    return response.body;
}

export async function createNetwork(name) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) {
        const newNet = { nwid: 'mock_' + Date.now(), name, status: 'OK' };
        mockNetworks.push(newNet);
        return newNet;
    }
    const address = await getAddress();

    options.method = 'POST';
    options.json = { name };

    const response = await got(`${baseUrl}/controller/network/${address}______`, options);
    return response.body;
}

export async function deleteNetwork(nwid) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) {
        mockNetworks = mockNetworks.filter(n => n.nwid !== nwid);
        return { deleted: true };
    }
    options.method = 'DELETE';
    const response = await got(`${baseUrl}/controller/network/${nwid}`, options);
    return { ...response.body, deleted: true };
}

export async function getMembers(nwid) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) return {};
    const response = await got(`${baseUrl}/controller/network/${nwid}/member`, options);
    let member_ids = response.body;
    // Fix weird data returned by some ZT versions
    if (Array.isArray(member_ids)) {
        let obj = {};
        for (let id of member_ids) {
            if (typeof id === 'object') {
                let key = Object.keys(id)[0];
                let value = Object.values(id)[0];
                obj[key] = value;
            } else {
                obj[id] = 1;
            }
        }
        member_ids = obj;
    }
    return member_ids;
}

export async function getMember(nwid, memberId) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) return { id: memberId, name: 'Mock Member' };
    const response = await got(`${baseUrl}/controller/network/${nwid}/member/${memberId}`, options);
    return response.body;
}

export async function updateMember(nwid, memberId, data) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) return { ...data, id: memberId };
    options.method = 'POST';
    options.json = data;
    const response = await got(`${baseUrl}/controller/network/${nwid}/member/${memberId}`, options);
    return response.body;
}

export async function deleteMember(nwid, memberId) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) return { deleted: true };
    options.method = 'DELETE';
    const response = await got(`${baseUrl}/controller/network/${nwid}/member/${memberId}`, options);
    return { ...response.body, deleted: true };
}

export async function getPeers() {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) return [];
    const response = await got(`${baseUrl}/peer`, options);
    return response.body;
}

export async function getPeer(id) {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) return null;
    try {
        const response = await got(`${baseUrl}/peer/${id}`, options);
        return response.body;
    } catch (error) {
        return null;
    }
}

export async function getStatus() {
    const { options, isMock, baseUrl } = await initOptions();
    if (isMock) return { address: 'mock_addr', version: '1.0.0 MOCK' };
    const response = await got(`${baseUrl}/status`, options);
    return response.body;
}

export async function getAddress() {
    const status = await getStatus();
    return status.address;
}

export async function addMemberIP(nwid, memberId, ip) {
    const { options, isMock } = await initOptions();
    if (isMock) return { success: true };
    const member = await getMember(nwid, memberId);
    const ips = member.ipAssignments || [];
    if (!ips.includes(ip)) {
        ips.push(ip);
        return await updateMember(nwid, memberId, { ipAssignments: ips });
    }
    return member;
}

export async function deleteMemberIP(nwid, memberId, ip) {
    const { options, isMock } = await initOptions();
    if (isMock) return { success: true };
    const member = await getMember(nwid, memberId);
    const ips = (member.ipAssignments || []).filter(i => i !== ip);
    return await updateMember(nwid, memberId, { ipAssignments: ips });
}

export async function getDetailedNetworks() {
    const networks = await getNetworks();
    const peers = await getPeers();

    const detailed = await Promise.all(networks.map(async (net) => {
        const memberIds = await getMembers(net.nwid);
        const ids = Object.keys(memberIds);

        let onlineCount = 0;
        for (const id of ids) {
            if (peers.find(p => p.address === id && p.paths && p.paths.length > 0)) {
                onlineCount++;
            }
        }

        return {
            ...net,
            memberCount: ids.length,
            onlineCount
        };
    }));
    return detailed;
}


function canonicalTarget(target) {
    const parts = target.split('/');
    try {
        const target6 = new Address6(parts[0]);
        if (target6.isValid()) {
            return target6.canonicalForm() + '/' + (parts[1] || '128');
        }
    } catch (e) { }
    return target;
}

export async function updateIPAssignmentPools(nwid, ipAssignmentPool, action) {
    const network = await getNetwork(nwid);
    let pools = network.ipAssignmentPools || [];

    if (action === 'add') {
        pools.push(ipAssignmentPool);
    } else if (action === 'delete') {
        pools = pools.filter(p =>
            p.ipRangeStart !== ipAssignmentPool.ipRangeStart ||
            p.ipRangeEnd !== ipAssignmentPool.ipRangeEnd
        );
    }

    return await updateNetwork(nwid, { ipAssignmentPools: pools });
}

export async function updateRoutes(nwid, route, action) {
    const network = await getNetwork(nwid);
    let routes = network.routes || [];
    const target = canonicalTarget(route.target);

    if (action === 'add') {
        if (!routes.some(r => canonicalTarget(r.target) === target)) {
            routes.push(route);
        }
    } else if (action === 'delete') {
        routes = routes.filter(r => canonicalTarget(r.target) !== target);
    }

    return await updateNetwork(nwid, { routes });
}

export async function easySetup(nwid, routes, ipAssignmentPools, v4AssignMode) {
    return await updateNetwork(nwid, {
        routes,
        ipAssignmentPools,
        v4AssignMode
    });
}
