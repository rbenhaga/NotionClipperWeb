import React, { createContext, useContext, useState } from 'react';

interface Subscription {
    plan: 'free' | 'premium';
    status: 'active' | 'inactive' | 'trialing';
    tier?: string;
}

interface SubscriptionContextType {
    subscription: Subscription | null;
    isLoading: boolean;
    createCheckoutSession: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [subscription] = useState<Subscription | null>({
        plan: 'free',
        status: 'active',
    });
    const [isLoading, setIsLoading] = useState(false);

    const createCheckoutSession = async () => {
        setIsLoading(true);
        // Simulate checkout
        setTimeout(() => {
            setIsLoading(false);
            alert('Redirecting to checkout...');
        }, 1000);
    };

    return (
        <SubscriptionContext.Provider value={{ subscription, isLoading, createCheckoutSession }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
