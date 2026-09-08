import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeSlots(table: 'schedules' | 'events', recordId: string, initialCount: number) {
  const [currentCount, setCurrentCount] = useState(initialCount);
  const [synced, setSynced] = useState({ recordId, initialCount });

  // Cached supabase client instance
  const supabase = useMemo(() => createClient(), []);

  // Re-sync local state whenever the server gives us a fresh
  // initialCount for this record (e.g. after a revalidation), without
  // needing an effect that runs setState on every render.
  if (recordId !== synced.recordId || initialCount !== synced.initialCount) {
    setSynced({ recordId, initialCount });
    setCurrentCount(initialCount);
  }

  useEffect(() => {
    // Deterministic channel name, no Math.random() spam
    const channelName = `realtime_${table}_${recordId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `id=eq.${recordId}`,
        },
        (payload) => {
          if (table === 'schedules') {
            const newPlayers = payload.new.current_players;
            if (typeof newPlayers === 'number') {
              setCurrentCount(newPlayers);
            }
          } else if (table === 'events') {
            const newParticipants = payload.new.current_participants;
            if (typeof newParticipants === 'number') {
              setCurrentCount(newParticipants);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, recordId]);

  return currentCount;
}
