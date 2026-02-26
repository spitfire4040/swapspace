import { supabaseAdmin } from '../config/supabase';
import { createError } from '../middleware/errorHandler';

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

export async function register(
  email: string,
  username: string,
  password: string
): Promise<{ user: UserRecord; tokens: TokenPair }> {
  const normalizedUsername = username.trim().toLowerCase();

  // Pre-check username uniqueness (UX convenience — also caught by DB constraint)
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', normalizedUsername)
    .single();

  if (existing) {
    throw createError(409, 'Email or username already in use');
  }

  // Create user in Supabase Auth (trigger auto-creates profile)
  // email_confirm: true skips email verification — intentional for current dev stage
  const { data: authData, error: createError_ } = await supabaseAdmin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { username: normalizedUsername },
  });

  if (createError_) {
    if (
      createError_.message.includes('already been registered') ||
      createError_.message.includes('23505') ||
      createError_.message.includes('unique')
    ) {
      throw createError(409, 'Email or username already in use');
    }
    console.error('Registration error:', createError_.message);
    throw createError(400, 'Registration failed');
  }

  // Sign in to get session tokens
  // Note: signInWithPassword on the admin client works but is unconventional;
  // it's used here to obtain a session after admin-created user signup.
  const { data: session, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (signInError || !session.session) {
    // Clean up orphaned auth user if sign-in fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch((err) => {
      console.error('Failed to clean up orphaned user:', err);
    });
    throw createError(500, 'Failed to create session after registration');
  }

  const user: UserRecord = {
    id: authData.user.id,
    email: authData.user.email!,
    username: normalizedUsername,
    created_at: authData.user.created_at,
  };

  const tokens: TokenPair = {
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
  };

  return { user, tokens };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: UserRecord; tokens: TokenPair }> {
  const { data: session, error } = await supabaseAdmin.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error || !session.session) {
    throw createError(401, 'Invalid email or password');
  }

  const username =
    session.user.user_metadata?.username ??
    (
      await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()
    ).data?.username ??
    '';

  const user: UserRecord = {
    id: session.user.id,
    email: session.user.email!,
    username,
    created_at: session.user.created_at,
  };

  const tokens: TokenPair = {
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
  };

  return { user, tokens };
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  const { data, error } = await supabaseAdmin.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    throw createError(401, 'Invalid or expired refresh token');
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

// Accepts the user's access token (JWT) to sign out the current session.
// supabaseAdmin.auth.admin.signOut() expects a JWT string, not a userId.
export async function logout(accessToken: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, 'local');
  if (error) {
    throw createError(500, 'Failed to log out');
  }
}
