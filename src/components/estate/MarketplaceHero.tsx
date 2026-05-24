import { Building2 } from "lucide-react";

export const MarketplaceHero = () => {
    return (
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/estate/marketplace_hero.png"
                    alt="Conglomerate Architecture"
                    className="w-full h-full object-cover animate-[ken-burns_20s_ease-in-out_infinite]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                    One Conglomerate.<br />Infinite Possibilities.
                </h1>
                <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
                    Moving you through the world with world-class strategic investments and industrial excellence.
                </p>
            </div>
        </section>
    );
};
