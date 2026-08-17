import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import fs from 'fs/promises';
import path from 'path';

const RESPONSES_FILE = path.join(process.cwd(), 'src/data/responses.json');

// Helper to load RSVPs from filesystem
async function getLocalResponses() {
  try {
    const fileContent = await fs.readFile(RESPONSES_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (e) {
    return [];
  }
}

// Helper to save RSVP to filesystem
async function saveLocalResponse(newRsvp: any) {
  try {
    const dir = path.dirname(RESPONSES_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    const responses = await getLocalResponses();
    responses.unshift(newRsvp); // Add to the top
    
    await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error("Local responses filesystem write error:", e);
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inviteId = searchParams.get('inviteId');

  if (!supabase) {
    const localResponses = await getLocalResponses();
    const filtered = inviteId && inviteId !== 'all'
      ? localResponses.filter((r: any) => r.invite_id === inviteId)
      : localResponses;
    return NextResponse.json({ responses: filtered, source: 'filesystem' });
  }

  try {
    let query = supabase
      .from('invitation_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (inviteId && inviteId !== 'all') {
      query = query.eq('invite_id', inviteId);
    }

    const { data, error } = await query;

    if (error) {
      const localResponses = await getLocalResponses();
      const filtered = inviteId && inviteId !== 'all'
        ? localResponses.filter((r: any) => r.invite_id === inviteId)
        : localResponses;
      return NextResponse.json({ responses: filtered, source: 'filesystem', dbError: error.message });
    }

    return NextResponse.json({ responses: data || [], source: 'database' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inviteId, location, dateTime } = body;

    if (!inviteId || !location || !dateTime) {
      return NextResponse.json({ error: 'Missing inviteId, location, or dateTime' }, { status: 400 });
    }

    const newRsvp = {
      id: 'local_' + Math.random().toString(36).substring(2, 9),
      invite_id: inviteId,
      location,
      date_time: dateTime,
      created_at: new Date().toISOString()
    };

    // Always log to local filesystem first
    await saveLocalResponse(newRsvp);

    if (!supabase) {
      return NextResponse.json({ success: true, source: 'filesystem', response: newRsvp });
    }

    const { data, error } = await supabase
      .from('invitation_responses')
      .insert({
        invite_id: inviteId,
        location,
        date_time: dateTime
      })
      .select()
      .single();

    if (error) {
      console.warn("Could not save RSVP to Supabase, fallback to filesystem:", error.message);
      return NextResponse.json({ success: true, source: 'filesystem', response: newRsvp, dbError: error.message });
    }

    return NextResponse.json({ success: true, source: 'database', response: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
