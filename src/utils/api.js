const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxkWLLM2hXOJeF1Du0-swlZFLXdvbDHhlF680Tgfkcp7uqaheKECVemJtv6gz0zUKpO5A/exec';

/**
 * Opt-in sample mode for local demos: `VITE_SAMPLE_DATA=true npm run dev`.
 * Loads a fictional family from src/sample/sample-family.json and keeps edits in memory
 * (admin password "demo"). Nothing is fetched or sent. Off unless the variable is set,
 * so normal builds talk to the Apps Script backend exactly as before.
 */
const SAMPLE_MODE = import.meta.env.VITE_SAMPLE_DATA === 'true';
const SAMPLE_PASSWORD = 'demo';
let sampleMembers = null;

async function sampleData() {
    if (!sampleMembers) {
        const { default: data } = await import('../sample/sample-family.json');
        sampleMembers = data.map(m => ({ ...m }));
    }
    return sampleMembers;
}

async function sampleAction(action, password, data) {
    if (password !== SAMPLE_PASSWORD) return { success: false, error: 'Wrong password (sample mode uses "demo")' };
    const members = await sampleData();
    if (action === 'ADD') {
        const id = String(Math.max(0, ...members.map(m => Number(m.id) || 0)) + 1);
        members.push({ ...data, id });
    } else if (action === 'EDIT') {
        const i = members.findIndex(m => String(m.id) === String(data.id));
        if (i < 0) return { success: false, error: 'Member not found' };
        members[i] = { ...members[i], ...data };
    } else if (action === 'DELETE') {
        sampleMembers = members.filter(m => String(m.id) !== String(data.id));
    } else {
        return { success: false, error: `Unknown action ${action}` };
    }
    return { success: true };
}

/**
 * Fetch all family members
 */
export async function fetchFamilyData() {
    if (SAMPLE_MODE) return (await sampleData()).map(m => ({ ...m }));
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching family data:', error);
        return [];
    }
}

/**
 * Send a CRUD action to the Apps Script
 */
export async function sendAction(action, password, data) {
    if (SAMPLE_MODE) return sampleAction(action, password, data);
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action, password, data }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`Error performing ${action}:`, error);
        return { success: false, error: 'Connection error' };
    }
}
