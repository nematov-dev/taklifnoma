import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { DEFAULT_SETTINGS } from '@/config/invitationConfig';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_DIR = path.join(process.cwd(), 'src/data/settings');

// Helper to load settings from filesystem
async function getLocalSettings(id: string) {
  try {
    await fs.mkdir(SETTINGS_DIR, { recursive: true });
    const filePath = path.join(SETTINGS_DIR, `${id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (e) {
    return null;
  }
}

// Helper to save settings to filesystem
async function saveLocalSettings(id: string, settings: any) {
  try {
    await fs.mkdir(SETTINGS_DIR, { recursive: true });
    const filePath = path.join(SETTINGS_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error("Local filesystem write error:", e);
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || 'default';

  if (!supabase) {
    const localSettings = await getLocalSettings(id);
    return NextResponse.json({ 
      id, 
      settings: localSettings || DEFAULT_SETTINGS, 
      source: localSettings ? 'filesystem' : 'default' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('invitation_settings')
      .select('settings')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const localSettings = await getLocalSettings(id);
        return NextResponse.json({ 
          id, 
          settings: localSettings || DEFAULT_SETTINGS, 
          source: localSettings ? 'filesystem' : 'default' 
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id, settings: data.settings, source: 'database' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, settings } = body;

    if (!id || !settings) {
      return NextResponse.json({ error: 'Missing id or settings' }, { status: 400 });
    }

    // Always save to filesystem as server-side backup
    await saveLocalSettings(id, settings);

    if (!supabase) {
      return NextResponse.json({ success: true, source: 'filesystem', settings });
    }

    const { error } = await supabase
      .from('invitation_settings')
      .upsert({ 
        id, 
        settings, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'id' });

    if (error) {
      console.warn("Could not save to Supabase, fallback to filesystem:", error.message);
      return NextResponse.json({ success: true, source: 'filesystem', settings, dbError: error.message });
    }

    return NextResponse.json({ success: true, source: 'database', settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
