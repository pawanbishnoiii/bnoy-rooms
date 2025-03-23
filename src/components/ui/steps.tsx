
import * as React from "react";
import { cn } from "@/lib/utils";

interface StepsProps {
  value: number;
  className?: string;
  children: React.ReactNode;
}

export const Steps = React.forwardRef<
  HTMLDivElement, 
  StepsProps
>(({ value, className, children, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    >
      <div className="flex items-center gap-2 mb-4">
        {childrenArray.map((step, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div className={cn(
                "h-0.5 flex-1", 
                index <= value ? "bg-primary" : "bg-muted-foreground/30"
              )} />
            )}
            {React.isValidElement(step) && 
              React.cloneElement(step as React.ReactElement<StepProps>, {
                stepIndex: index,
                isActive: index === value,
                isComplete: index < value
              })
            }
          </React.Fragment>
        ))}
      </div>
      <div>
        {React.isValidElement(childrenArray[value]) && 
          (childrenArray[value] as React.ReactElement<StepProps>).props.children}
      </div>
    </div>
  );
});

Steps.displayName = "Steps";

interface StepProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  stepIndex?: number;
  isActive?: boolean;
  isComplete?: boolean;
  children?: React.ReactNode;
  value?: number;
}

export const Step = React.forwardRef<
  HTMLDivElement,
  StepProps
>(({ 
  title, 
  description, 
  icon, 
  stepIndex, 
  isActive, 
  isComplete, 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "flex items-center justify-center rounded-full w-8 h-8 font-medium text-sm",
        isActive && "bg-primary text-primary-foreground",
        isComplete && "bg-primary/80 text-primary-foreground",
        !isActive && !isComplete && "bg-muted text-muted-foreground"
      )}
    >
      {icon || stepIndex! + 1}
    </div>
  );
});

Step.displayName = "Step";
