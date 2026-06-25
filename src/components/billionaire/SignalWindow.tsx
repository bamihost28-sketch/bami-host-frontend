import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Target, Plus, Trash2, Check, Clock, AlertTriangle } from 'lucide-react';
import {
  useGetSummaryQuery,
  useCreateMissionMutation,
  useUpdateMissionMutation,
  useDeleteMissionMutation,
} from '@/services/billionaireApi';
import { localDate, to12h } from './constants';

export default function SignalWindow() {
  const today = localDate();
  const { toast } = useToast();
  const { data, isLoading } = useGetSummaryQuery({ day: today });
  const [createMission, { isLoading: creating }] = useCreateMissionMutation();
  const [updateMission] = useUpdateMissionMutation();
  const [deleteMission] = useDeleteMissionMutation();

  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  const missions = data?.missions ?? [];
  const total = missions.length;
  const done = missions.filter((m) => m.completed).length;
  const snr = data?.snrScore ?? 96;

  const add = async () => {
    if (!title.trim()) return;
    if (total >= 5) {
      toast({ title: 'Focus limit reached', description: 'Max 5 signal missions per day. Remove one first.', variant: 'destructive' });
      return;
    }
    try {
      await createMission({ title: title.trim(), deadline: deadline.trim() || undefined, missionDate: today }).unwrap();
      setTitle('');
      setDeadline('');
    } catch (e: any) {
      toast({ title: 'Could not add mission', description: e?.data?.detail ?? 'Try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* SNR header */}
      <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-300">Signal-to-Noise Ratio</p>
              <p className="text-4xl font-bold">{snr}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300">Missions Complete</p>
              <p className="text-3xl font-bold">{done}<span className="text-slate-400 text-xl">/{total || 0}</span></p>
            </div>
          </div>
          <Progress value={snr} className="h-2 bg-slate-700" />
          <p className="text-xs text-slate-400 mt-2">
            Starts at 96% — complete all your missions to drive it to 100%.
          </p>
        </CardContent>
      </Card>

      {/* Add mission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" /> Today's Signal Missions
          </CardTitle>
          <CardDescription>
            Set your 3–5 mission-critical tasks. They are non-negotiable — everything else is noise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="What must get done today?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              className="flex-1"
            />
            <Input
              type="time"
              aria-label="Deadline"
              title="Deadline (optional)"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              className="sm:w-36"
            />
            <Button onClick={add} disabled={creating || total >= 5} className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {total >= 5 && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" /> You've hit the 5-mission limit. Protect your focus.
            </div>
          )}

          {/* Mission list */}
          <div className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && total === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No missions set yet. Add your first signal mission for today.</p>
              </div>
            )}
            {missions.map((m, i) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  m.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-card'
                }`}
              >
                <button
                  onClick={() => updateMission({ id: m.id, body: { completed: !m.completed } })}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'
                  }`}
                >
                  {m.completed && <Check className="w-4 h-4" />}
                </button>
                <span className="text-xs font-bold text-slate-400 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${m.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {m.title}
                  </p>
                  {m.deadline && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {to12h(m.deadline)}
                    </p>
                  )}
                </div>
                {m.completed && <Badge className="bg-emerald-500">Done</Badge>}
                <Button variant="ghost" size="icon" onClick={() => deleteMission(m.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
