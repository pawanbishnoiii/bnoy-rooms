
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
  }[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
}

const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ steps, currentStep, orientation = "horizontal", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex",
                orientation === "horizontal" ? "flex-col" : "flex-row",
                "gap-2",
                { "flex-1": orientation === "horizontal" }
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  orientation === "horizontal" && "flex-col"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 font-medium",
                    {
                      "border-primary bg-primary text-white": isCompleted,
                      "border-primary text-primary": isCurrent,
                      "border-gray-300 text-gray-500": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.icon || index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      orientation === "horizontal"
                        ? "h-px w-full bg-gray-300"
                        : "h-full w-px bg-gray-300 ml-4 my-2",
                      {
                        "bg-primary": isCompleted,
                      }
                    )}
                  />
                )}
              </div>
              <div
                className={cn(
                  "flex flex-col",
                  orientation === "horizontal" && "mt-2 items-center text-center"
                )}
              >
                <span
                  className={cn("font-medium", {
                    "text-primary": isCompleted || isCurrent,
                    "text-gray-500": !isCompleted && !isCurrent,
                  })}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-sm text-gray-500">{step.description}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

Steps.displayName = "Steps";

export { Steps };
