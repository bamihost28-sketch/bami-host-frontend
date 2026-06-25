import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Calculator, Plus, X, Save, Users, Building2, Cpu, Trash } from 'lucide-react';
import { useGetTimeValueQuery, useUpdateTimeValueMutation } from '@/services/billionaireApi';

const fmt = (n: number) => `₦${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function TimeValueCalculator() {
  const { toast } = useToast();
  const { data } = useGetTimeValueQuery();
  const [save, { isLoading: saving }] = useUpdateTimeValueMutation();

  const [hours, setHours] = useState('');
  const [income, setIncome] = useState('');
  const [lists, setLists] = useState({ delegate: [] as string[], outsource: [] as string[], automate: [] as string[], delete: [] as string[] });

  useEffect(() => {
    if (data?.data) {
      setHours(data.data.weeklyHours ? String(data.data.weeklyHours) : '');
      setIncome(data.data.weeklyIncome ? String(data.data.weeklyIncome) : '');
      setLists({
        delegate: data.data.delegate ?? [],
        outsource: data.data.outsource ?? [],
        automate: data.data.automate ?? [],
        delete: data.data.delete ?? [],
      });
    }
  }, [data]);

  const h = parseFloat(hours) || 0;
  const inc = parseFloat(income) || 0;
  const rate = h > 0 ? inc / h : 0;
  const threshold = rate / 2;

  const persist = async () => {
    try {
      await save({
        weeklyHours: h,
        weeklyIncome: inc,
        delegate: lists.delegate,
        outsource: lists.outsource,
        automate: lists.automate,
        delete: lists.delete,
      }).unwrap();
      toast({ title: 'Saved', description: 'Your time-value profile is updated.' });
    } catch (e: any) {
      toast({ title: 'Could not save', description: e?.data?.detail ?? 'Try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" /> Time Value Calculator
          </CardTitle>
          <CardDescription>Know your true hourly rate — then stop doing anything cheaper than it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Hours worked per week</Label>
              <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 60" />
            </div>
            <div>
              <Label>Weekly income</Label>
              <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 500000" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <p className="text-sm text-emerald-50">Your true hourly rate</p>
              <p className="text-3xl font-bold">{fmt(rate)}<span className="text-lg font-normal">/hr</span></p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <p className="text-sm text-slate-300">Outsource threshold (50%)</p>
              <p className="text-3xl font-bold">{fmt(threshold)}<span className="text-lg font-normal">/hr</span></p>
              <p className="text-xs text-slate-400 mt-1">Outsource anything available below this rate.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Formula: Weekly income ÷ hours worked = hourly rate. If a task can be handed off for less than your
            threshold, every hour you do it yourself is lost opportunity cost.
          </p>
        </CardContent>
      </Card>

      {/* Four lists */}
      <div className="grid md:grid-cols-2 gap-6">
        <ListCard title="Delegate" subtitle="Hand to a team member" icon={<Users className="w-4 h-4 text-blue-500" />}
          items={lists.delegate} onChange={(v) => setLists((p) => ({ ...p, delegate: v }))} />
        <ListCard title="Outsource" subtitle="Hire externally" icon={<Building2 className="w-4 h-4 text-purple-500" />}
          items={lists.outsource} onChange={(v) => setLists((p) => ({ ...p, outsource: v }))} />
        <ListCard title="Automate" subtitle="Systematise with tools" icon={<Cpu className="w-4 h-4 text-amber-500" />}
          items={lists.automate} onChange={(v) => setLists((p) => ({ ...p, automate: v }))} />
        <ListCard title="Delete" subtitle="Cut entirely" icon={<Trash className="w-4 h-4 text-red-500" />}
          items={lists.delete} onChange={(v) => setLists((p) => ({ ...p, delete: v }))} />
      </div>

      <div className="flex justify-end">
        <Button onClick={persist} disabled={saving} className="gap-2"><Save className="w-4 h-4" /> Save changes</Button>
      </div>
    </div>
  );
}

function ListCard({
  title, subtitle, icon, items, onChange,
}: {
  title: string; subtitle: string; icon: React.ReactNode;
  items: string[]; onChange: (v: string[]) => void;
}) {
  const [text, setText] = useState('');
  const add = () => {
    if (!text.trim()) return;
    onChange([...items, text.trim()]);
    setText('');
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <span className="flex-1 text-sm">{item}</span>
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground py-1">Nothing here yet.</p>}
        </div>
        <div className="flex gap-2">
          <Input placeholder={`Add to ${title.toLowerCase()}…`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button onClick={add} size="icon" variant="outline"><Plus className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
