import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Wallet } from "lucide-react";

// Tabs
import { CorePrinciplesOfProfitableScale } from './double-take-home-tabs/CorePrinciplesOfProfitableScale';
import { PayYourselfFirst } from './double-take-home-tabs/PayYourselfFirst';
import { SettingExpenseRatios } from './double-take-home-tabs/SettingExpenseRatios';
import { BuildingYourEmergencyFund } from './double-take-home-tabs/BuildingYourEmergencyFund';
import { TheCashSweepWaterfall } from './double-take-home-tabs/TheCashSweepWaterfall';
import { FinalTipsAndReminders } from './double-take-home-tabs/FinalTipsAndReminders';
import { ReadyToLevelUp as ReadyToLevelUpDYTH } from './double-take-home-tabs/ReadyToLevelUp';

export interface DoubleTakeHomeData {
  isCompleted?: boolean;
  readiness?: {
    payYourself?: boolean;
    expenseRatios?: boolean;
    emergencyFund?: boolean;
    cashSweepSetup?: boolean;
  };
}

interface Props {
  data: DoubleTakeHomeData;
  onDataChange: (d: DoubleTakeHomeData) => void;
  onComplete: () => void;
  onSave?: () => void;
}

const DoubleYourTakeHome: React.FC<Props> = ({ data, onDataChange, onComplete, onSave }) => {
  const [activeTab, setActiveTab] = useState('core');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <Wallet className="w-6 h-6 text-primary" />
            Level 4: Double Your Take-Home
            <Badge variant="outline" className="bg-background text-muted-foreground">Turn the business into a cash machine</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <Alert className="border-border bg-card">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription>
              Cash fuels scale. This module increases profitability so the business can richly serve you and everyone it impacts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="core" className="text-xs">Core Principles</TabsTrigger>
          <TabsTrigger value="pay" className="text-xs">Pay Yourself First</TabsTrigger>
          <TabsTrigger value="ratios" className="text-xs">Expense Ratios</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs">Emergency Fund</TabsTrigger>
          <TabsTrigger value="sweep" className="text-xs">Cash Sweep</TabsTrigger>
          <TabsTrigger value="tips" className="text-xs">Final Tips</TabsTrigger>
          <TabsTrigger value="ready" className="text-xs">Ready</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="mt-6">
          <CorePrinciplesOfProfitableScale />
        </TabsContent>

        <TabsContent value="pay" className="mt-6">
          <PayYourselfFirst />
        </TabsContent>

        <TabsContent value="ratios" className="mt-6">
          <SettingExpenseRatios />
        </TabsContent>

        <TabsContent value="emergency" className="mt-6">
          <BuildingYourEmergencyFund />
        </TabsContent>

        <TabsContent value="sweep" className="mt-6">
          <TheCashSweepWaterfall />
        </TabsContent>

        <TabsContent value="tips" className="mt-6">
          <FinalTipsAndReminders />
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          <ReadyToLevelUpDYTH
            data={data}
            onDataChange={onDataChange}
            isCompleted={Boolean(data.isCompleted)}
            onComplete={() => { onDataChange({ ...data, isCompleted: true }); onComplete(); }}
            onSave={onSave}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoubleYourTakeHome;