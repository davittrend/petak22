import { auth } from './firebase';
import { saveAccount, saveBoards } from './database';
import type { PinterestBoard, PinterestToken, PinterestUser, ScheduledPin } from '@/types/pinterest';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';
const CLIENT_ID = '1507772';
const REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/callback`
  : '';

export async function getPinterestAuthUrl() {
  const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
  const state = crypto.randomUUID();
  const redirectUri = encodeURIComponent(REDIRECT_URI);
  return `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
}

export async function exchangePinterestCode(code: string): Promise<{ token: PinterestToken; user: PinterestUser }> {
  const response = await fetch('/.netlify/functions/pinterest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to exchange Pinterest code');
  }

  return response.json();
}

export async function refreshPinterestToken(refreshToken: string): Promise<PinterestToken> {
  const response = await fetch('/.netlify/functions/pinterest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to refresh token');
  }

  return response.json();
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  const response = await fetch(`${PINTEREST_API_URL}/boards`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch boards');
  }

  return response.json();
}

export async function connectPinterestAccount(code: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  // Exchange code for token and user data
  const { token, user } = await exchangePinterestCode(code);
  
  // Create new account object
  const newAccount = {
    id: user.username,
    user,
    token,
    lastRefreshed: Date.now(),
  };

  // Save account
  await saveAccount(userId, newAccount);
  
  // Fetch and save boards
  const boards = await fetchPinterestBoards(token.access_token);
  await saveBoards(userId, newAccount.id, boards);
}

export async function schedulePin(pin: ScheduledPin): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const response = await fetch('/.netlify/functions/pin-scheduler', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`,
    },
    body: JSON.stringify([pin]),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to schedule pin');
  }
}
