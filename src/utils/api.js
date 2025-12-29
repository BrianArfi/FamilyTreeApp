const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxkWLLM2hXOJeF1Du0-swlZFLXdvbDHhlF680Tgfkcp7uqaheKECVemJtv6gz0zUKpO5A/exec';

/**
 * Fetch all family members
 */
export async function fetchFamilyData() {
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
