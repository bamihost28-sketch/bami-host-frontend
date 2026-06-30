import React, { useState, useEffect, useRef } from 'react';
import { useGetGrowthPlanQuery, useSaveGrowthPlanMutation } from '@/services/growthApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Target,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

// Import step components
import { StepNavigator } from './StepNavigator';
import { Level1FirstTenCustomers } from './Level1FirstTenCustomers';
import { ScaleLevelConfirmation } from './ScaleLevelConfirmation';
import GrowthFlywheelBuilder, { GrowthFlywheelData } from './GrowthFlywheelBuilder';
import { StartingPointSection } from './StartingPointSection';
import { EndGameSection } from './EndGameSection';
import WhySection from './WhySection';
import HowSection from './HowSection';
import TakingActionSection from './TakingActionSection';
import OperatingSystemBuilder, { OperatingSystemData } from './OperatingSystemBuilder';
import DoubleYourTakeHome, { DoubleTakeHomeData } from './DoubleYourTakeHome';
import BuildYourBoard, { BuildYourBoardData } from './BuildYourBoard';
import ExpandThroughAcquisition, { AcquisitionData } from './ExpandThroughAcquisition';

// Import shared types
import type {
  StartingPoint,
  EndingPoint,
  WhyStatement,
  HowStatement,
  TakingActionItems
} from './types';

const ScalableImpactPlanner: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Step navigation state (limited to initial 2 steps on this page)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false, false, false]);

  // Step 1: Level 1 - First 10 Customers (MANDATORY GATING STEP)
  const [level1Data, setLevel1Data] = useState({
    hasMadeSale: false,
    hasDeliveredPromise: false,
    hasReached10Customers: false,
    hasTestimonials: false,
    hasTenPromoters: false,
    hasModel10List: false,
    promotersCount: 0,
    npsNotes: '',
    model10List: '',
    customerList: '',
    salesProof: '',
    isCompleted: false
  });

  // Step 2 (Level 2): Growth Flywheel builder data
  const [growthFlywheel, setGrowthFlywheel] = useState<GrowthFlywheelData>({
    growthPattern: '',
    flagshipOffers: '',
    awarenessChannels: '',
    engageReengage: '',
    leadMagnets: '',
    microCommitments: '',
    ahaMoments: '',
    focusFlagship: '',
    triggeringEvents: '',
    endingEvent: '',
    stepsOutline: '',
    isCompleted: false
  });

  // Step 3 (OS) state – declared early so effects can reference it safely
  const [osData, setOsData] = useState<OperatingSystemData>({});

  // Step 4 (Double Take-Home)
  const [doubleTakeHome, setDoubleTakeHome] = useState<DoubleTakeHomeData>({ isCompleted: false });

  // Step 5 (Build Your Board)
  const [buildBoard, setBuildBoard] = useState<BuildYourBoardData>({ isCompleted: false });

  // Step 6 (Acquisition)
  const [acqData, setAcqData] = useState<AcquisitionData>({ isCompleted: false });

  // Step 2: Starting Point  
  const [startingPoint, setStartingPoint] = useState<StartingPoint>({
    currentRevenue: '',
    currentProfit: '',
    currentProfitability: '',
    currentValuation: '',
    assessmentDate: '',
    revenueSource: '',
    businessStage: 'startup'
  });

  // Step 2: Starting Point (new format for component)
  const [startingPointData, setStartingPointData] = useState({
    currentRevenue: '',
    currentProfit: '',
    currentProfitMargin: '',
    currentValuation: '',
    assessmentDate: '',
    revenueSource: '',
    businessStage: 'owner-dependent' as 'owner-dependent' | 'professionalized'
  });

  // Step 3 (later steps): Ending Point (new format for component)
  const [endGameData, setEndGameData] = useState({
    targetRevenue: '',
    targetProfit: '',
    targetValuation: '',
    timeframe: '3-year' as '3-year',
    growthStrategy: '',
    selectedBenchmark: '',
    targetProfitMargin: ''
  });

  // Step 3: Ending Point (old format for compatibility)
  const [endingPoint, setEndingPoint] = useState<EndingPoint>({
    targetRevenue: '',
    targetProfit: '',
    targetValuation: '',
    timeframe: '3-year',
    growthStrategy: 'double-in-three',
    benchmarks: {
      year1Revenue: '',
      year2Revenue: '',
      year3Revenue: ''
    }
  });

  // Step 4: WHY Statement
  const [whyStatement, setWhyStatement] = useState<WhyStatement>({
    me: {
      personalGoals: 'Exit the day-to-day',
      motivation: 'Build dream home',
      skillsDevelopment: '₦1M in passive investments',
      personalWhy: 'Travel one month every year'
    },
    us: {
      teamVision: "Fund kids' college",
      companyMission: 'Distribute ₦1M in profit sharing to team',
      culturalValues: 'Buy a vacation property',
      collectiveWhy: ''
    },
    them: {
      customerImpact: 'Become a 6-figure donor',
      marketProblem: 'Volunteer an hour a week',
      socialContribution: 'Serve on association board',
      externalWhy: ''
    }
  });

  // Step 5: HOW Statement (Focus 5)
  const [howStatement, setHowStatement] = useState<HowStatement>({
    action1: '',
    action2: '',
    action3: '',
    action4: '',
    action5: ''
  });

  // Step 6: Taking Action
  const [takingActionItems, setTakingActionItems] = useState<TakingActionItems>({
    currentAction1: '',
    currentAction2: '',
    currentAction3: ''
  });

  // Local storage utilities
  const saveToLocalStorage = (key: string, data: any) => {
    if (user?.id) {
      const userKey = `${key}_${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(data));
    }
  };

  const loadFromLocalStorage = (key: string) => {
    if (user?.id) {
      const userKey = `${key}_${user.id}`;
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const savedStep = loadFromLocalStorage('scalable_impact_current_step');
      const savedCompleted = loadFromLocalStorage('scalable_impact_completed_steps');
      const savedLevel1 = loadFromLocalStorage('scalable_impact_level1_data');
      const savedScaleLevel = null; // deprecated
      const savedFlywheel = loadFromLocalStorage('scalable_impact_growth_flywheel');
      const savedStarting = loadFromLocalStorage('scalable_impact_starting');
      const savedStartingData = loadFromLocalStorage('scalable_impact_starting_data');
      const savedEnding = loadFromLocalStorage('scalable_impact_ending');
      const savedEndGameData = loadFromLocalStorage('scalable_impact_endgame_data');
      const savedWhy = loadFromLocalStorage('scalable_impact_why');
      const savedHow = loadFromLocalStorage('scalable_impact_how');
      const savedTakingAction = loadFromLocalStorage('scalable_impact_taking_action');
      const savedOS = loadFromLocalStorage('scalable_impact_os');
      const savedDYTH = loadFromLocalStorage('scalable_impact_double_take_home');
      const savedBoard = loadFromLocalStorage('scalable_impact_build_board');
      const savedAcq = loadFromLocalStorage('scalable_impact_acquisition');

      if (savedStep) setCurrentStep(savedStep);
      if (savedCompleted) setCompletedSteps(savedCompleted);
      if (savedLevel1) setLevel1Data(savedLevel1);
      if (savedFlywheel) setGrowthFlywheel(savedFlywheel);
      if (savedStarting) setStartingPoint(savedStarting);
      if (savedStartingData) setStartingPointData(savedStartingData);
      if (savedEnding) setEndingPoint(savedEnding);
      if (savedEndGameData) setEndGameData(savedEndGameData);
      if (savedWhy) setWhyStatement(savedWhy);
      if (savedHow) setHowStatement(savedHow);
      if (savedTakingAction) setTakingActionItems(savedTakingAction);
      if (savedOS) setOsData(savedOS);
      if (savedDYTH) setDoubleTakeHome(savedDYTH);
      if (savedBoard) setBuildBoard(savedBoard);
      if (savedAcq) setAcqData(savedAcq);
    }
  }, [user?.id]);

  // Auto-save data whenever it changes
  useEffect(() => {
    if (user?.id) {
      saveToLocalStorage('scalable_impact_current_step', currentStep);
      saveToLocalStorage('scalable_impact_completed_steps', completedSteps);
      saveToLocalStorage('scalable_impact_level1_data', level1Data);
      saveToLocalStorage('scalable_impact_growth_flywheel', growthFlywheel);
      saveToLocalStorage('scalable_impact_starting', startingPoint);
      saveToLocalStorage('scalable_impact_starting_data', startingPointData);
      saveToLocalStorage('scalable_impact_ending', endingPoint);
      saveToLocalStorage('scalable_impact_endgame_data', endGameData);
      saveToLocalStorage('scalable_impact_why', whyStatement);
      saveToLocalStorage('scalable_impact_how', howStatement);
      saveToLocalStorage('scalable_impact_taking_action', takingActionItems);
      saveToLocalStorage('scalable_impact_os', osData);
      saveToLocalStorage('scalable_impact_double_take_home', doubleTakeHome);
      saveToLocalStorage('scalable_impact_build_board', buildBoard);
      saveToLocalStorage('scalable_impact_acquisition', acqData);
    }
  }, [currentStep, completedSteps, level1Data, growthFlywheel, startingPoint, startingPointData, endingPoint, endGameData, whyStatement, howStatement, takingActionItems, osData, doubleTakeHome, buildBoard, acqData, user?.id]);

  // ── Server sync: load the saved plan from the backend (source of truth across
  // devices), then debounce-save the whole bundle so it persists server-side. ──
  const { data: serverPlan, isSuccess: serverLoaded } = useGetGrowthPlanQuery();
  const [saveGrowthPlan] = useSaveGrowthPlanMutation();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!serverLoaded || hydratedRef.current) return;
    hydratedRef.current = true;
    const d = serverPlan?.exists ? (serverPlan.data || {}) : null;
    if (d && Object.keys(d).length) {
      if (d.current_step) setCurrentStep(d.current_step);
      if (d.completed_steps) setCompletedSteps(d.completed_steps);
      if (d.level1_data) setLevel1Data(d.level1_data);
      if (d.growth_flywheel) setGrowthFlywheel(d.growth_flywheel);
      if (d.starting) setStartingPoint(d.starting);
      if (d.starting_data) setStartingPointData(d.starting_data);
      if (d.ending) setEndingPoint(d.ending);
      if (d.endgame_data) setEndGameData(d.endgame_data);
      if (d.why) setWhyStatement(d.why);
      if (d.how) setHowStatement(d.how);
      if (d.taking_action) setTakingActionItems(d.taking_action);
      if (d.os) setOsData(d.os);
      if (d.double_take_home) setDoubleTakeHome(d.double_take_home);
      if (d.build_board) setBuildBoard(d.build_board);
      if (d.acquisition) setAcqData(d.acqData ?? d.acquisition);
    }
  }, [serverLoaded, serverPlan]);

  useEffect(() => {
    if (!hydratedRef.current) return;  // don't overwrite server before hydration
    const t = setTimeout(() => {
      const num = (v: string) => { const n = parseFloat(String(v || '').replace(/[^\d.]/g, '')); return isNaN(n) ? undefined : n; };
      const w = whyStatement;
      const why_summary = [w?.me?.personalWhy, w?.us?.collectiveWhy || w?.us?.companyMission, w?.them?.externalWhy || w?.them?.customerImpact]
        .filter(Boolean).join(' · ') || undefined;
      saveGrowthPlan({
        data: {
          current_step: currentStep, completed_steps: completedSteps, level1_data: level1Data,
          growth_flywheel: growthFlywheel, starting: startingPoint, starting_data: startingPointData,
          ending: endingPoint, endgame_data: endGameData, why: whyStatement, how: howStatement,
          taking_action: takingActionItems, os: osData, double_take_home: doubleTakeHome,
          build_board: buildBoard, acquisition: acqData,
        },
        current_step: currentStep,
        target_revenue: num(endGameData?.targetRevenue) ?? num(endingPoint?.targetRevenue),
        target_profit: num(endGameData?.targetProfit) ?? num(endingPoint?.targetProfit),
        target_valuation: num(endGameData?.targetValuation) ?? num(endingPoint?.targetValuation),
        why_summary,
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [currentStep, completedSteps, level1Data, growthFlywheel, startingPoint, startingPointData, endingPoint, endGameData, whyStatement, howStatement, takingActionItems, osData, doubleTakeHome, buildBoard, acqData]);

  // Step navigation handlers
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleStepComplete = (stepIndex: number) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[stepIndex] = true;
    setCompletedSteps(newCompletedSteps);
  };

  const handleNextStep = () => {
    if (currentStep < 7) {
      handleStepComplete(currentStep - 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step-specific handlers
  const handleLevel1Complete = () => {
    if (level1Data.isCompleted) {
      handleNextStep();
      toast({
        title: "Level 1 Complete! 🏆",
        description: "You've proven your business with 10 customers. Ready to scale!",
      });
    }
  };

  const handleStep2Complete = () => {
    if (growthFlywheel.isCompleted) {
      handleNextStep();
      toast({
        title: "Growth Engine Mapped! ⚙️",
        description: "Great! Your first engine is defined. Start iterating it to scale.",
      });
    }
  };

  const handleStep3Complete = () => {
    handleNextStep();
    toast({
      title: "Starting Point Established! 📊",
      description: "Great! Now let's set your 3-year targets.",
    });
  };

  // Step 3 (OS): complete handler
  const handleOsComplete = () => {
    if (osData.isCompleted) {
      handleNextStep();
      toast({ title: 'Operating System Draft Installed ✅', description: 'Your OS baseline is set with SOPs, scorecards, and meeting rhythm.' });
    }
  };

  const handleStep4Complete = () => {
    handleNextStep();
    toast({
      title: "Pay Raise Activated! 💸",
      description: "Cash discipline installed. You're ready to scale profitably.",
    });
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Level1FirstTenCustomers
            data={level1Data}
            onDataChange={setLevel1Data}
            onComplete={handleLevel1Complete}
          />
        );

      case 2:
        return (
          <GrowthFlywheelBuilder
            data={growthFlywheel}
            onDataChange={setGrowthFlywheel}
            onComplete={handleStep2Complete}
            onSave={() => saveToLocalStorage('scalable_impact_growth_flywheel', growthFlywheel)}
          />
        );
      case 3:
        return (
          <OperatingSystemBuilder
            data={osData}
            onDataChange={setOsData}
            onComplete={handleOsComplete}
            onSave={() => saveToLocalStorage('scalable_impact_os', osData)}
          />
        );
      case 4:
        return (
          <DoubleYourTakeHome
            data={doubleTakeHome}
            onDataChange={setDoubleTakeHome}
            onComplete={handleStep4Complete}
            onSave={() => saveToLocalStorage('scalable_impact_double_take_home', doubleTakeHome)}
          />
        );
      case 5:
        return (
          <BuildYourBoard
            data={buildBoard}
            onDataChange={setBuildBoard}
            onComplete={() => {
              handleNextStep();
              toast({ title: 'Board Established 👥', description: 'You are now surrounded by mentors and peers—onward to acquisitions.' });
            }}
            onSave={() => saveToLocalStorage('scalable_impact_build_board', buildBoard)}
          />
        );
      case 6:
        return (
          <ExpandThroughAcquisition
            data={acqData}
            onDataChange={setAcqData}
            onComplete={() => {
              handleNextStep();
              toast({ title: 'Acquisition Complete 🧩', description: 'You’ve integrated your first expansion acquisition.' });
            }}
            onSave={() => saveToLocalStorage('scalable_impact_acquisition', acqData)}
          />
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Invalid step</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Scalable Impact Planner</CardTitle>
          <span className="text-sm text-muted-foreground">Steps 1–7</span>
        </div>
      </div>

      {/* Step Navigator */}
      <StepNavigator
        currentStep={currentStep}
        onStepChange={handleStepChange}
        completedSteps={completedSteps}
      />

      {/* Current Step Content */}
      <div className="mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Controls */}
      <Card className="bg-card border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </Button>

            <div className="text-center">
              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                Step {currentStep} of 7
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Progress: {Math.round((completedSteps.filter(Boolean).length / Math.max(1, completedSteps.length)) * 100)}%
              </p>
            </div>

            <Button
              onClick={handleNextStep}
              disabled={
                (currentStep === 1 && !level1Data.isCompleted) ||
                (currentStep === 2 && !growthFlywheel.isCompleted) ||
                (currentStep === 3 && !osData.isCompleted) ||
                (currentStep === 4 && !doubleTakeHome.isCompleted) ||
                (currentStep === 5 && !buildBoard.isCompleted) ||
                (currentStep === 6 && !acqData.isCompleted)
              }
              className="gap-2"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Alert */}
      {completedSteps.every(Boolean) && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Congratulations! 🎉</strong> You've completed all 7 steps of your Scalable Impact Plan.
            From Level 1 foundation to your action plan, you're ready to scale systematically!
          </AlertDescription>
        </Alert>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© The Scalable Company - Helping entrepreneurs scale systematically</p>
      </div>
    </div>
  );
};

export default ScalableImpactPlanner;