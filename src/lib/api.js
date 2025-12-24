export const api = {
    async getNetworks() {
        const res = await fetch('/api/networks');
        return res.json();
    },

    async createNetwork(name) {
        const res = await fetch('/api/networks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        return res.json();
    },

    async getNetwork(nwid) {
        const res = await fetch(`/api/networks/${nwid}`);
        return res.json();
    },

    async updateNetwork(nwid, data) {
        const res = await fetch(`/api/networks/${nwid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteNetwork(nwid) {
        const res = await fetch(`/api/networks/${nwid}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async updateMember(nwid, memberId, data) {
        const res = await fetch(`/api/networks/${nwid}/members/${memberId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteMember(nwid, memberId) {
        const res = await fetch(`/api/networks/${nwid}/members/${memberId}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async addMemberIP(nwid, memberId, ip) {
        const res = await fetch(`/api/networks/${nwid}/members/${memberId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addIP: ip })
        });
        return res.json();
    },

    async removeMemberIP(nwid, memberId, ip) {
        const res = await fetch(`/api/networks/${nwid}/members/${memberId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeIP: ip })
        });
        return res.json();
    },

    async getStats() {
        const res = await fetch('/api/stats');
        return res.json();
    },

    async updateRoutes(nwid, route, action = 'add') {
        const res = await fetch(`/api/networks/${nwid}/routes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route, action })
        });
        return res.json();
    },

    async updateIPPools(nwid, pool, action = 'add') {
        const res = await fetch(`/api/networks/${nwid}/ip-pools`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pool, action })
        });
        return res.json();
    },

    async easySetup(nwid, data) {
        const res = await fetch(`/api/networks/${nwid}/easy-setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }
};
