import { Building2, Tractor, Users, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ManagedServices = () => {
    return (
        <section className="py-24 bg-slate-950">
            <div className="container mx-auto px-6 text-center">
                <span className="text-blue-500 font-black tracking-widest uppercase text-xs mb-4 block">Executive Services</span>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Big Assets & Managed Services</h2>
                <p className="text-slate-400 max-w-2xl mx-auto mb-16 italic">Personalized portfolio management for the discerning high-net-worth individual and institutional investments.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Building2, title: "Estate Assets", desc: "Premium property portfolios for corporate headquarters and luxury hospitality." },
                        { icon: Tractor, title: "Fixed Assets", desc: "Large-scale machinery and equipment leasing for heavy industrial operations." },
                        { icon: Users, title: "Physical Hubs", desc: "Energy hubs and logistics terminals for high-capacity regional operations." },
                        { icon: BarChart3, title: "Financial Assets", desc: "Strategic investment vehicles and managed portfolio growth services." }
                    ].map((service, i) => (
                        <div key={i} className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl hover:bg-slate-900/60 hover:border-blue-500/50 transition-all text-left group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                                <service.icon className="w-7 h-7 text-blue-500 group-hover:text-white" />
                            </div>
                            <h4 className="text-xl font-black text-white mb-4 italic">{service.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">{service.desc}</p>
                            <Link to="#" className="inline-flex items-center text-[10px] font-black uppercase text-blue-500 tracking-widest hover:text-white transition-colors">
                                Learn More <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
