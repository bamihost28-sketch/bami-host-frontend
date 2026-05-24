import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const FarmLands = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80" alt="Farmland" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            </div>

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div>
                        <span className="text-blue-400 font-black tracking-widest uppercase text-xs">Sustainability</span>
                        <h2 className="text-2xl md:text-3xl font-black text-white mt-4 mb-6 leading-tight">Farm Lands &<br />Land Rentals</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">Pioneering agricultural advancements with premium land assets and infrastructure for large-scale production.</p>
                    </div>

                    <div className="space-y-4">
                        {["Integrated crop management", "Large scale production area", "High yield investment plots"].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-white font-bold">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-7 rounded-xl shadow-xl shadow-blue-900/50">
                        Check Agreement & Book
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: "5k+", sub: "Total Acres Managed", style: "border-slate-800 bg-slate-900/40" },
                        { label: "12", sub: "Regional Hubs", style: "border-slate-800 bg-slate-900/40" },
                        { label: "100%", sub: "Lease Reliability", style: "border-blue-900/40 bg-blue-600/10" },
                        { label: "₦2.5B", sub: "Portolio Value", style: "border-slate-800 bg-slate-900/40" }
                    ].map((stat, i) => (
                        <div key={i} className={cn("p-8 rounded-3xl border backdrop-blur shadow-2xl transition-transform hover:-translate-y-1", stat.style)}>
                            <div className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.label}</div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
