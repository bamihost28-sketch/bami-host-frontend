import React from "react";
import { Button } from "@/components/ui/button";

export const ReadyToListCta = () => {
    return (
        <div className="py-20 container mx-auto px-6">
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 to-blue-500 p-8 md:p-16 text-white shadow-2xl shadow-blue-600/20">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black leading-tight">
                            Ready to list your rental?
                        </h2>
                        <p className="text-lg md:text-xl text-blue-50/90 font-medium">
                            Join thousands of landlords who find quality tenants fast on Bami Host Estate Marketplace.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-7 h-auto rounded-2xl shadow-xl shadow-black/10 transition-transform hover:scale-105">
                            List a Rental
                        </Button>
                        <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-bold px-10 py-7 h-auto rounded-2xl backdrop-blur-sm transition-transform hover:scale-105">
                            For Landlords
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
