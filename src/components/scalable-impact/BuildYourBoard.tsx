import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, UsersRound } from "lucide-react";

// Tabs
import { WhyYouNeedABoard } from './build-your-board-tabs/WhyYouNeedABoard';
import { WhatIsABoardOfAdvisors } from './build-your-board-tabs/WhatIsABoardOfAdvisors';
import { WhoShouldBeOnYourBoard } from './build-your-board-tabs/WhoShouldBeOnYourBoard';
import { CompensatingYourBoardMembers } from './build-your-board-tabs/CompensatingYourBoardMembers';
import { RunningABoardMeeting } from './build-your-board-tabs/RunningABoardMeeting';
import { ReadyToLevelUp as ReadyToLevelUpBoard } from './build-your-board-tabs/ReadyToLevelUp';

export interface BuildYourBoardData {
  isCompleted?: boolean;
}

interface Props {
  data: BuildYourBoardData;
  onDataChange: (d: BuildYourBoardData) => void;
  onComplete: () => void;
  onSave?: () => void;
}

const BuildYourBoard: React.FC<Props> = ({ data, onDataChange, onComplete, onSave }) => {
  const [activeTab, setActiveTab] = useState('why');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <UsersRound className="w-6 h-6 text-primary" />
            Level 5: Build Your Board
            <Badge variant="outline" className="bg-background text-muted-foreground">Mentors + peers for scale and accountability</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <Alert className="border-border bg-card">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription>
              Entrepreneurship is lonely. A Board of Advisors surrounds you with insight, accountability, and support so you don’t fly blind.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="why" className="text-xs">Why You Need a Board</TabsTrigger>
          <TabsTrigger value="what" className="text-xs">What Is a Board</TabsTrigger>
          <TabsTrigger value="who" className="text-xs">Who Should Be On</TabsTrigger>
          <TabsTrigger value="comp" className="text-xs">Compensation</TabsTrigger>
          <TabsTrigger value="run" className="text-xs">Run a Meeting</TabsTrigger>
          <TabsTrigger value="ready" className="text-xs">Ready</TabsTrigger>
        </TabsList>

        <TabsContent value="why" className="mt-6">
          <WhyYouNeedABoard />
        </TabsContent>

        <TabsContent value="what" className="mt-6">
          <WhatIsABoardOfAdvisors />
        </TabsContent>

        <TabsContent value="who" className="mt-6">
          <WhoShouldBeOnYourBoard />
        </TabsContent>

        <TabsContent value="comp" className="mt-6">
          <CompensatingYourBoardMembers />
        </TabsContent>

        <TabsContent value="run" className="mt-6">
          <RunningABoardMeeting />
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          <ReadyToLevelUpBoard
            isCompleted={Boolean(data.isCompleted)}
            onComplete={() => { onDataChange({ ...data, isCompleted: true }); onComplete(); }}
            onSave={onSave}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuildYourBoard;
