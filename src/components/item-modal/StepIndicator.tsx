import React from 'react';

interface StepIndicatorProps {
    currentStep: 'meat' | 'sauce' | 'exclusions' | 'sidedish' | 'complete';
    itemNumber: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, itemNumber }) => {
    const steps = [
        { id: 'meat', label: 'Fleisch', number: 1 },
        { id: 'sauce', label: 'Soße', number: 2 },
        { id: 'exclusions', label: 'Salat', number: 3 },
        ...(itemNumber === 4 ? [{ id: 'sidedish', label: 'Beilage', number: 4 }] : [])
    ];

    const getStepStatus = (stepId: string) => {
        const stepOrder = ['meat', 'sauce', 'exclusions', 'sidedish', 'complete'];
        const currentIndex = stepOrder.indexOf(currentStep);
        const stepIndex = stepOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="flex items-center justify-between w-full mb-6 px-2">
            {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.id}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                                ${status === 'active' ? 'bg-orange-600 text-white scale-110 shadow-lg shadow-orange-200' : ''}
                                ${status === 'pending' ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
                            `}>
                                {status === 'completed' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span className={`
                                text-xs font-semibold mt-2 absolute -bottom-5 w-max transition-colors duration-300
                                ${status === 'active' ? 'text-orange-600' : 'text-gray-400'}
                            `}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {!isLast && (
                            <div className="flex-1 h-0.5 mx-2 bg-gray-200 relative">
                                <div
                                    className="absolute inset-0 bg-green-500 transition-all duration-500 ease-out"
                                    style={{
                                        width: status === 'completed' ? '100%' : '0%'
                                    }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
