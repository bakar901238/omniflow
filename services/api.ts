
import { API_BASE_URLS } from '../constants';
import { UserListItem, UserData } from '../types';

export const encryptPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const fetchUserList = async (): Promise<UserListItem[]> => {
  const response = await fetch(API_BASE_URLS.LIST);
  if (!response.ok) throw new Error('Failed to fetch user list');
  return response.json();
};

export const fetchUserData = async (username: string): Promise<UserData> => {
  const response = await fetch(`${API_BASE_URLS.DATA}?user=${username}`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  const data = await response.json();
  // n8n usually returns an array for these webhooks
  return Array.isArray(data) ? data[0] : data;
};

export const saveUserData = async (userData: UserData): Promise<void> => {
  const encryptedPass = userData.pass ? await encryptPassword(userData.pass) : '';
  
  const params = new URLSearchParams({
    user: userData.user,
    pass: encryptedPass,
    textprompt: userData.textprompt,
    imageprompt: userData.imageprompt,
    type: userData.type || '1'
  });

  const url = `${API_BASE_URLS.UPDATE}?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Update failed with status ' + response.status);
  }
};
