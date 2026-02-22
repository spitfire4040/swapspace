import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { JwtPayload } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

function signAccess(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
  });
}

function signRefresh(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d') as jwt.SignOptions['expiresIn'],
  });
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function storeRefreshToken(userId: string, rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

async function issueTokens(userId: string, email: string): Promise<TokenPair> {
  const payload: JwtPayload = { userId, email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);
  await storeRefreshToken(userId, refreshToken);
  return { accessToken, refreshToken };
}

export async function register(
  email: string,
  username: string,
  password: string
): Promise<{ user: UserRecord; tokens: TokenPair }> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query<UserRecord>(
    'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
    [email.toLowerCase(), username.trim(), passwordHash]
  );

  const user = result.rows[0];
  const tokens = await issueTokens(user.id, user.email);
  return { user, tokens };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: UserRecord; tokens: TokenPair }> {
  const result = await pool.query<UserRecord & { password_hash: string }>(
    'SELECT id, email, username, password_hash, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  const user = result.rows[0];
  if (!user) throw createError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw createError(401, 'Invalid email or password');

  const tokens = await issueTokens(user.id, user.email);
  const { password_hash: _pw, ...safeUser } = user;
  return { user: safeUser as UserRecord, tokens };
}

export async function refresh(rawRefreshToken: string): Promise<TokenPair> {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw createError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const result = await pool.query(
    'SELECT id, revoked FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );

  const storedToken = result.rows[0];
  if (!storedToken || storedToken.revoked) {
    throw createError(401, 'Refresh token not found or revoked');
  }

  // Rotate: revoke old, issue new
  await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [storedToken.id]);

  return issueTokens(payload.userId, payload.email);
}

export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken);
  await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);
}
