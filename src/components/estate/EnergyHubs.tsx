import { Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EnergyHubs = () => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-green-600 font-bold tracking-widest uppercase text-xs">Energy Hubs</span>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Filling Stations &<br />Energy Hubs</h2>
                            <p className="text-slate-600 text-lg leading-relaxed">Powering the continent with a network of high-efficiency fueling centers and EV charging infrastructure built for performance.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: Zap, title: "High-Capacity Stations", count: "45 Stations" },
                                { icon: ShieldCheck, title: "Quality Assurance", count: "ISO Certified" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-green-200 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                            <item.icon className="w-6 h-6 text-green-600" />
                                        </div>
                                        <span className="font-bold text-slate-800">{item.title}</span>
                                    </div>
                                    <span className="text-xs font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">{item.count}</span>
                                </div>
                            ))}
                        </div>

                        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-8 py-7 rounded-xl shadow-lg shadow-green-500/20 btn-interactive">
                            View Network Map
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-green-600/5 blur-3xl rounded-full" />
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                            <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80" alt="Energy Hub" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl w-full text-center">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mx-auto mb-3 shadow-lg">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-slate-900 font-black text-lg mb-1 italic">Future of Energy</div>
                                    <p className="text-slate-500 text-sm mb-4">The next generation of high-speed EV charging and premium fueling experience.</p>
                                    <Link to="#" className="text-green-600 font-bold text-xs uppercase tracking-widest hover:underline">Read Case Study</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
