import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Building2 } from "lucide-react";

// Tabs
import { WhyAcquisitions } from './expand-through-acquisition-tabs/WhyAcquisitions';
import { ClosingYourFirstAcquisition } from './expand-through-acquisition-tabs/ClosingYourFirstAcquisition';
import { ReadyToLevelUp as ReadyToLevelUpAcq } from './expand-through-acquisition-tabs/ReadyToLevelUp';

export interface AcquisitionData {
  isCompleted?: boolean;
}

interface Props {
  data: AcquisitionData;
  onDataChange: (d: AcquisitionData) => void;
  onComplete: () => void;
  onSave?: () => void;
}

const ExpandThroughAcquisition: React.FC<Props> = ({ data, onDataChange, onComplete, onSave }) => {
  const [activeTab, setActiveTab] = useState('why');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <Building2 className="w-6 h-6 text-primary" />
            Level 6: Expanding Through Acquisition
            <Badge variant="outline" className="bg-background text-muted-foreground">Fastest path to scale (when done right)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <Alert className="border-border bg-card">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription>
              Every business eventually caps out organically. Learning acquisitions gives you options to grow leads, talent, margin, market share, and enterprise value.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="why" className="text-xs">Why Acquisitions</TabsTrigger>
          <TabsTrigger value="closing" className="text-xs">Closing Your First Acquisition</TabsTrigger>
          <TabsTrigger value="ready" className="text-xs">Ready</TabsTrigger>
        </TabsList>

        <TabsContent value="why" className="mt-6">
          <WhyAcquisitions />
        </TabsContent>

        <TabsContent value="closing" className="mt-6">
          <ClosingYourFirstAcquisition />
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          <ReadyToLevelUpAcq
            isCompleted={Boolean(data.isCompleted)}
            onComplete={() => { onDataChange({ ...data, isCompleted: true }); onComplete(); }}
            onSave={onSave}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpandThroughAcquisition;
