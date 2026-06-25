import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Crown, Plus, X, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import {
  useGetKingsAuditQuery,
  useCreateKingsAuditItemMutation,
  useDeleteKingsAuditItemMutation,
  useSeedKingsAuditMutation,
} from '@/services/billionaireApi';

export default function KingsAudit() {
  const { toast } = useToast();
  const { data, isLoading } = useGetKingsAuditQuery();
  const [createItem] = useCreateKingsAuditItemMutation();
  const [deleteItem] = useDeleteKingsAuditItemMutation();
  const [seed, { isLoading: seeding }] = useSeedKingsAuditMutation();

  const low = data?.low ?? [];
  const high = data?.high ?? [];
  const empty = !isLoading && low.length === 0 && high.length === 0;

  const handleSeed = async () => {
    try {
      await seed().unwrap();
    } catch (e: any) {
      toast({ title: 'Could not load list', description: e?.data?.detail ?? 'Try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" /> King's Audit — the 80/20 Worksheet
          </CardTitle>
          <CardDescription>
            Move every low-yield activity off your plate. Protect and expand your high-yield 4%.
          </CardDescription>
        </CardHeader>
        {empty && (
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Start with a proven template, then make it yours.</p>
              <Button onClick={handleSeed} disabled={seeding} variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" /> Load starter list
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <AuditColumn
          bucket="low"
          title="80% Activities → 20% Revenue"
          subtitle="Your not-to-do list — delegate, automate or delete"
          items={low}
          icon={<TrendingDown className="w-5 h-5 text-red-500" />}
          accent="red"
          onAdd={(text) => createItem({ bucket: 'low', text })}
          onDelete={(id) => deleteItem(id)}
        />
        <AuditColumn
          bucket="high"
          title="20% Activities → 80% Revenue"
          subtitle="Your protected revenue zone — do more of this"
          items={high}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          accent="emerald"
          onAdd={(text) => createItem({ bucket: 'high', text })}
          onDelete={(id) => deleteItem(id)}
        />
      </div>
    </div>
  );
}

function AuditColumn({
  title, subtitle, items, icon, accent, onAdd, onDelete,
}: {
  bucket: 'low' | 'high';
  title: string;
  subtitle: string;
  items: { id: string; text: string }[];
  icon: React.ReactNode;
  accent: 'red' | 'emerald';
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState('');
  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  };
  const border = accent === 'red' ? 'border-t-red-400' : 'border-t-emerald-400';

  return (
    <Card className={`border-t-4 ${border}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 group">
              <span className="flex-1 text-sm">{item.text}</span>
              <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground py-2">No activities yet.</p>}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add activity…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button onClick={add} size="icon" variant="outline"><Plus className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
