import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, TrendingUp } from "lucide-react";

// Import tab components
import { TheFourKindsOfGrowth } from './growth-flywheel-tabs/TheFourKindsOfGrowth';
import { MappingYourGrowthEngine } from './growth-flywheel-tabs/MappingYourGrowthEngine';
import { OptimizingYourGrowthEngine } from './growth-flywheel-tabs/OptimizingYourGrowthEngine';
import { SpinningTheFlywheel } from './growth-flywheel-tabs/SpinningTheFlywheel';
import { ReadyToLevelUpFlywheel } from './growth-flywheel-tabs/ReadyToLevelUp';

export interface GrowthFlywheelData {
  growthPattern: 'spike' | 'chop' | 'flatline' | 'ramp' | '';
  notes?: string;

  // Pre-work inventory
  flagshipOffers: string;
  awarenessChannels: string;
  engageReengage: string;
  leadMagnets: string;
  microCommitments: string;
  ahaMoments: string;

  // Engine mapping
  focusFlagship: string;
  triggeringEvents: string; // awareness used here
  endingEvent: string;
  stepsOutline: string; // "then what happens" outline

  // Optimization
  scorecard?: { stage: string; metric: string; target?: string; current?: string }[];
  bottleneckStage?: string;
  bottleneckNotes?: string;
  projects?: { title: string; impact?: string; owner?: string }[];
  cadenceStart?: string; // ISO date string

  // Level-up readiness (1-10-3)
  month1Revenue?: string;
  month2Revenue?: string;
  month3Revenue?: string;
  believesTo100k?: boolean;

  isCompleted?: boolean;
}

interface Props {
  data: GrowthFlywheelData;
  onDataChange: (data: GrowthFlywheelData) => void;
  onComplete: () => void;
  onSave?: () => void;
}

export const GrowthFlywheelBuilder: React.FC<Props> = ({ data, onDataChange, onComplete, onSave }) => {
  const [activeTab, setActiveTab] = useState('four-kinds');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <TrendingUp className="w-6 h-6 text-primary" />
            Level 2: Build a Growth Flywheel
            <Badge variant="outline" className="bg-background text-muted-foreground">Predictable, repeatable, scalable sales</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <Alert className="border-border bg-card">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription>
              You only need one growth engine to break seven figures. Focus on one path that consistently turns awareness → leads → customers → promoters.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="four-kinds">The Four Kinds</TabsTrigger>
          <TabsTrigger value="mapping">Mapping Engine</TabsTrigger>
          <TabsTrigger value="optimizing">Optimizing</TabsTrigger>
          <TabsTrigger value="spinning">Spinning</TabsTrigger>
          <TabsTrigger value="ready">Ready to Level Up</TabsTrigger>
        </TabsList>

        <TabsContent value="four-kinds" className="mt-6">
          <TheFourKindsOfGrowth />
        </TabsContent>

        <TabsContent value="mapping" className="mt-6">
          <MappingYourGrowthEngine />
        </TabsContent>

        <TabsContent value="optimizing" className="mt-6">
          <OptimizingYourGrowthEngine />
        </TabsContent>

        <TabsContent value="spinning" className="mt-6">
          <SpinningTheFlywheel />
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          <ReadyToLevelUpFlywheel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrowthFlywheelBuilder;
