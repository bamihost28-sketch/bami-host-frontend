import React, { useState, useEffect, useRef } from 'react';
import { useGetGrowthPlanQuery, useSaveGrowthPlanMutation } from '@/services/growthApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
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
import OperatingSystemBuilder, { OperatingSystemData } from './OperatingSystemBuilder';
import DoubleYourTakeHome, { DoubleTakeHomeData } from './DoubleYourTakeHome';
import BuildYourBoard, { BuildYourBoardData } from './BuildYourBoard';
import ExpandThroughAcquisition, { AcquisitionData } from './ExpandThroughAcquisition';

const ScalableImpactPlanner: React.FC<{
  embedded?: boolean;
  /** When set, the planner shows only this step and hides its own step navigator + prev/next
   *  controls — navigation is driven externally (e.g. by the Scale ladder). */
  controlledStep?: number;
  hideChrome?: boolean;
}> = ({ embedded = false, controlledStep, hideChrome = false }) => {
  const { toast } = useToast();

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

  // ── Server sync (real data — no localStorage): load the saved plan from the
  // backend, then debounce-save this component's own slice of it. Starting
  // Point / End Game / WHY / How+Taking Action live in the Strategy tab now
  // (ScaleDashboard's StrategyPanel), which owns and saves those independently
  // — this component no longer touches them, so it can't overwrite Your Number
  // with stale data. ──
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
      if (d.os) setOsData(d.os);
      if (d.double_take_home) setDoubleTakeHome(d.double_take_home);
      if (d.build_board) setBuildBoard(d.build_board);
      if (d.acquisition) setAcqData(d.acquisition);
    }
  }, [serverLoaded, serverPlan]);

  useEffect(() => {
    if (!hydratedRef.current) return;  // don't overwrite server before hydration
    const t = setTimeout(() => {
      saveGrowthPlan({
        data: {
          current_step: currentStep, completed_steps: completedSteps, level1_data: level1Data,
          growth_flywheel: growthFlywheel, os: osData, double_take_home: doubleTakeHome,
          build_board: buildBoard, acquisition: acqData,
        },
        current_step: currentStep,
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [currentStep, completedSteps, level1Data, growthFlywheel, osData, doubleTakeHome, buildBoard, acqData]);

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
    const step = controlledStep ?? currentStep;
    switch (step) {
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
            onSave={() => saveGrowthPlan({ data: { growth_flywheel: growthFlywheel } })}
          />
        );
      case 3:
        return (
          <OperatingSystemBuilder
            data={osData}
            onDataChange={setOsData}
            onComplete={handleOsComplete}
            onSave={() => saveGrowthPlan({ data: { os: osData } })}
          />
        );
      case 4:
        return (
          <DoubleYourTakeHome
            data={doubleTakeHome}
            onDataChange={setDoubleTakeHome}
            onComplete={handleStep4Complete}
            onSave={() => saveGrowthPlan({ data: { double_take_home: doubleTakeHome } })}
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
            onSave={() => saveGrowthPlan({ data: { build_board: buildBoard } })}
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
            onSave={() => saveGrowthPlan({ data: { acquisition: acqData } })}
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
    <div className={embedded ? "" : "max-w-7xl mx-auto p-6 bg-background min-h-screen"}>
      {/* Header (hidden when embedded inside the Scale dashboard tab) */}
      {!embedded && (
        <div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Scalable Impact Planner</CardTitle>
            <span className="text-sm text-muted-foreground">Steps 1–7</span>
          </div>
        </div>
      )}

      {/* Step Navigator (hidden when the Scale ladder drives navigation) */}
      {!hideChrome && (
        <StepNavigator
          currentStep={currentStep}
          onStepChange={handleStepChange}
          completedSteps={completedSteps}
        />
      )}

      {/* Current Step Content */}
      <div className="mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Controls */}
      {!hideChrome && (
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
      )}

      {/* Completion Alert */}
      {!hideChrome && completedSteps.every(Boolean) && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Congratulations! 🎉</strong> You've completed all 7 steps of your Scalable Impact Plan.
            From Level 1 foundation to your action plan, you're ready to scale systematically!
          </AlertDescription>
        </Alert>
      )}

      {/* Footer */}
      {!embedded && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© The Scalable Company - Helping entrepreneurs scale systematically</p>
        </div>
      )}
    </div>
  );
};

export default ScalableImpactPlanner;