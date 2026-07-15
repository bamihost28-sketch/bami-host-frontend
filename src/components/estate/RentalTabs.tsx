import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RentalTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const RentalTabs: React.FC<RentalTabsProps> = ({ activeTab, onTabChange }) => {
    const categories = [
        { id: "all", label: "View All Rentals" },
        { id: "shortlet", label: "Short Lets" },
        { id: "apartment", label: "Apartments" },
        { id: "house", label: "Houses" },
        { id: "service", label: "Service Apartments" },
    ];

    return (
        <div className="w-full flex justify-center py-8">
            <Tabs defaultValue={activeTab} className="w-fit" onValueChange={onTabChange}>
                <TabsList className="bg-transparent h-auto p-0 gap-4 md:gap-8 overflow-x-auto no-scrollbar max-w-[100vw] px-6">
                    {categories.map((category) => (
                        <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent rounded-none font-bold text-slate-500 data-[state=active]:text-green-600 transition-all text-xs md:text-sm whitespace-nowrap shadow-none"
                        >
                            {category.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};
