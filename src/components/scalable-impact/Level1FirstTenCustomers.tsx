import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Import tab components
import DoThisFirst from './tabs/DoThisFirst';
import TheProblemWithProductMarketFit from './tabs/TheProblemWithProductMarketFit';
import GettingYourFirst10 from './tabs/GettingYourFirst10';
import TheOneQuestionSurvey from './tabs/TheOneQuestionSurvey';
import YourModel10 from './tabs/YourModel10';
import ReadyToLevelUp from './tabs/ReadyToLevelUp';

export interface Level1Data {
  hasMadeSale: boolean;
  hasDeliveredPromise: boolean;
  hasReached10Customers: boolean;
  hasTestimonials: boolean;
  // New: NPS promoters and Model 10 gating
  hasTenPromoters: boolean;
  hasModel10List: boolean;
  promotersCount?: number; // count of NPS 9-10
  npsNotes?: string; // optional notes
  model10List?: string; // comma or newline separated names
  customerList: string;
  salesProof: string; // short proof/summary or testimonial
  testimonialText?: string; // required short text proof
  testimonialFileName?: string; // optional uploaded filename for UI display
  isCompleted: boolean;
}

const tabTriggerCls = "text-xs md:text-sm py-2 px-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm";

interface Level1FirstTenCustomersProps {
  data: Level1Data;
  onDataChange: (data: Level1Data) => void;
  onComplete: () => void;
}

export const Level1FirstTenCustomers: React.FC<Level1FirstTenCustomersProps> = ({
  data,
  onDataChange,
  onComplete
}) => {
  return (
    <div className="space-y-4">
      {/* Slim intro — the level hero above already sets the context */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Target className="w-4 h-4 text-primary flex-shrink-0" />
        <span>Work through each tab to understand, complete and verify this level.</span>
        <Badge variant="outline" className="ml-auto border-primary/30 text-primary text-[10px]">MANDATORY</Badge>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="do-this-first" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1 bg-muted rounded-xl">
          <TabsTrigger value="do-this-first" className={cn(tabTriggerCls)}>
            Do This First
          </TabsTrigger>
          <TabsTrigger value="problem" className={cn(tabTriggerCls)}>
            Product-Market Fit
          </TabsTrigger>
          <TabsTrigger value="first-10" className={cn(tabTriggerCls)}>
            Getting First 10
          </TabsTrigger>
          <TabsTrigger value="survey" className={cn(tabTriggerCls)}>
            One Question Survey
          </TabsTrigger>
          <TabsTrigger value="model-10" className={cn(tabTriggerCls)}>
            Your Model 10
          </TabsTrigger>
          <TabsTrigger value="ready" className={cn(tabTriggerCls)}>
            Ready to Level Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="do-this-first" className="mt-4">
          <DoThisFirst />
        </TabsContent>

        <TabsContent value="problem" className="mt-4">
          <TheProblemWithProductMarketFit />
        </TabsContent>

        <TabsContent value="first-10" className="mt-4">
          <GettingYourFirst10 data={data} onDataChange={onDataChange} />
        </TabsContent>

        <TabsContent value="survey" className="mt-4">
          <TheOneQuestionSurvey />
        </TabsContent>

        <TabsContent value="model-10" className="mt-4">
          <YourModel10 />
        </TabsContent>

        <TabsContent value="ready" className="mt-4">
          <ReadyToLevelUp data={data} onComplete={onComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Level1FirstTenCustomers;
