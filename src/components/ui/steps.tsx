
import React from "react";
import { cn } from "@/lib/utils";

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: {
    title: string;
    description: string;
  }[];
  currentStep: number;
}

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ steps, currentStep, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex w-full", className)}
        {...props}
      >
        {steps.map((step, index) => (
          <div key={index} className={cn(
            "flex-1",
            index !== steps.length - 1 ? "mr-2" : ""
          )}>
            <div className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  index < currentStep
                    ? "border-primary bg-primary text-primary-foreground" // Completed
                    : index === currentStep
                    ? "border-primary bg-background text-foreground" // Current
                    : "border-input bg-background text-muted-foreground" // Upcoming
                )}
              >
                {index < currentStep ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mx-1 bg-muted",
                    index < currentStep ? "bg-primary" : ""
                  )}
                />
              )}
            </div>
            <div className="mt-2">
              <p
                className={cn(
                  "text-xs font-medium",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p
                className={cn(
                  "text-xs",
                  index <= currentStep ? "text-muted-foreground" : "text-muted-foreground/60"
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

Steps.displayName = "Steps";
