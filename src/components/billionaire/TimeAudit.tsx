import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CalendarClock, Plus, Trash2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import {
  useListTimeBlocksQuery,
  useCreateTimeBlockMutation,
  useDeleteTimeBlockMutation,
  useSeedTimeBlocksMutation,
} from '@/services/billionaireApi';
import type { BlockType } from '@/services/billionaireApi';
import { localDate, prettyDate, BLOCK_TYPES, BLOCK_STYLES } from './constants';

export default function TimeAudit() {
  const { toast } = useToast();
  const [day, setDay] = useState(localDate());
  const { data, isLoading } = useListTimeBlocksQuery({ day });
  const [createBlock, { isLoading: creating }] = useCreateTimeBlockMutation();
  const [deleteBlock] = useDeleteTimeBlockMutation();
  const [seedBlocks, { isLoading: seeding }] = useSeedTimeBlocksMutation();

  const [timeLabel, setTimeLabel] = useState('');
  const [activity, setActivity] = useState('');
  const [blockType, setBlockType] = useState<BlockType>('signal');

  const blocks = data?.data ?? [];
  const counts = {
    signal: blocks.filter((b) => b.blockType === 'signal').length,
    noise: blocks.filter((b) => b.blockType === 'noise').length,
    reminder: blocks.filter((b) => b.blockType === 'reminder').length,
  };
  const tagged = counts.signal + counts.noise;
  const snr = tagged ? Math.round((counts.signal / tagged) * 100) : 0;

  const shiftDay = (delta: number) => {
    const d = new Date(day + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setDay(localDate(d));
  };

  const add = async () => {
    if (!timeLabel.trim() || !activity.trim()) {
      toast({ title: 'Missing info', description: 'Enter both a time and an activity.', variant: 'destructive' });
      return;
    }
    try {
      await createBlock({ blockDate: day, timeLabel: timeLabel.trim(), activity: activity.trim(), blockType }).unwrap();
      setTimeLabel('');
      setActivity('');
    } catch (e: any) {
      toast({ title: 'Could not add block', description: e?.data?.detail ?? 'Try again.', variant: 'destructive' });
    }
  };

  const seed = async () => {
    try {
      await seedBlocks({ blockDate: day }).unwrap();
      toast({ title: 'Default schedule loaded', description: 'Your 18-hour template is ready to customise.' });
    } catch (e: any) {
      toast({ title: 'Could not load template', description: e?.data?.detail ?? 'Try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Date nav + stats */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-600" /> Time Audit
              </CardTitle>
              <CardDescription>Block your 18-hour window (4 AM – 10 PM). Tag every slot.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => shiftDay(-1)}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm font-medium w-28 text-center">{prettyDate(day)}</span>
              <Button variant="outline" size="icon" onClick={() => shiftDay(1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Signal blocks" value={counts.signal} color="text-emerald-600" />
            <Stat label="Noise blocks" value={counts.noise} color="text-red-600" />
            <Stat label="Reminders" value={counts.reminder} color="text-blue-600" />
            <Stat label="SNR score" value={`${snr}%`} color="text-slate-900" />
          </div>
        </CardContent>
      </Card>

      {/* Add block */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-2">
            <Input placeholder="Time (e.g. 4:30 AM)" value={timeLabel} onChange={(e) => setTimeLabel(e.target.value)} className="md:w-40" />
            <Input placeholder="Activity" value={activity} onChange={(e) => setActivity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} className="flex-1" />
            <Select value={blockType} onValueChange={(v) => setBlockType(v as BlockType)}>
              <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{BLOCK_STYLES[t].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={add} disabled={creating} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocks */}
      <Card>
        <CardContent className="p-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && blocks.length === 0 && (
            <div className="text-center py-10">
              <CalendarClock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-muted-foreground mb-4">No blocks for this day yet.</p>
              <Button onClick={seed} disabled={seeding} variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" /> Load default 18-hour schedule
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {blocks.map((b) => {
              const s = BLOCK_STYLES[b.blockType];
              return (
                <div key={b.id} className={`flex items-center gap-3 p-3 rounded-lg border border-l-4 ${s.row} bg-card`}>
                  <span className="text-sm font-semibold text-slate-600 w-20 shrink-0">{b.timeLabel}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{b.activity}</p>
                    {b.note && <p className="text-xs text-muted-foreground truncate">{b.note}</p>}
                  </div>
                  <Badge variant="outline" className={s.chip}>{s.label}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteBlock(b.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
