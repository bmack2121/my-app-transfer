import bankData from '../data/banks.json';

// Sort alphabetically once at runtime
export const BANKS = bankData.sort((a, b) => a.name.localeCompare(b.name));

// Helper for finding a specific bank by ID
export const getBankById = (id) => BANKS.find(bank => bank.id === id);