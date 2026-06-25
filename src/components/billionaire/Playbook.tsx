import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, ListChecks, CheckCircle2, XCircle } from 'lucide-react';

const FILTERS = [
  { q: 'Does this move one of my 3–5 signal missions forward?', yes: "It's signal. Do it now.", no: "It's noise. Delegate, automate or defer it." },
  { q: 'Can someone else do this for less than my hourly threshold?', yes: 'Outsource or delegate it.', no: "Keep it only if it's in your 4%." },
  { q: 'Does this generate revenue or move toward a revenue event?', yes: "It's likely your 4%. Protect this time.", no: "It's the 96%. Remove it." },
  { q: 'Would a top performer at your level be doing this task?', yes: 'Proceed with intention.', no: 'Stop. Delegate or delete.' },
  { q: 'Is this reactive (responding) or proactive (building)?', yes: 'Reactive → batch it to a scheduled block.', no: 'Proactive → protect and expand it.' },
];

const STEPS = [
  'Set your 3–5 signal missions every morning at 4:00 AM. They are the only things that matter today.',
  'Calculate your hourly rate weekly and populate your delegate / outsource / automate / delete lists.',
  'Block your 18-hour window daily. Tag every slot as Signal, Noise, Reminder or Neutral.',
  "Run the King's Audit weekly. Move every 80%-activity off your plate; expand your 4%.",
  'Every evening at 5:30 PM, set tomorrow\'s missions so you wake already locked in.',
];

export default function Playbook() {
  return (
    <div className="space-y-6">
      {/* Action points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5 text-emerald-600" /> The Daily Protocol</CardTitle>
          <CardDescription>Five steps. Run them every day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-sm pt-1">{s}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Signal-vs-noise reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5 text-blue-600" /> Signal-to-Noise Filter</CardTitle>
          <CardDescription>Before committing time to anything, ask:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {FILTERS.map((f, i) => (
            <div key={i} className="rounded-lg border p-4">
              <p className="font-medium mb-3">{f.q}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{f.yes}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span>{f.no}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold">Only 4% of your activities drive 64% of your revenue.</p>
          <p className="text-slate-300 text-sm mt-1">Your 18-hour window is the only period that matters. Run it every day.</p>
        </CardContent>
      </Card>
    </div>
  );
}
