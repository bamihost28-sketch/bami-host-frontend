import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const MachinerySection = () => {
    return (
        <section className="py-24 bg-slate-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-blue-600 font-bold tracking-widest uppercase text-xs">Heavy Assets</span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">Equipment Yards & Heavy Machinery</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">First-class terminal services and industrial equipment leasing for infrastructure development projects.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { id: "cat-320-gc", title: "Excavator Rental", image: "https://images.unsplash.com/photo-1578319439584-104c94d37305?auto=format&fit=crop&w=800&q=70" },
                        { id: "architectural-cranes", title: "Architectural Cranes", image: "https://images.unsplash.com/photo-1541888941259-7b9d9218574d?auto=format&fit=crop&w=800&q=70" },
                        { id: "logistics-hubs", title: "Logistics Hubs", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=70" }
                    ].map((item, i) => (
                        <Link to={`/marketplace/equipment/${item.id}`} key={i} className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-end p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                <h4 className="text-lg font-black text-white mb-2">{item.title}</h4>
                                <p className="text-slate-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity">Premium equipment for high-scale construction needs.</p>
                                <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest hover:text-blue-400 transition-colors">
                                    Check Inventory <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button variant="outline" className="border-slate-300 bg-white text-slate-900 font-black px-10 py-7 rounded-xl hover:bg-slate-50 shadow-lg">
                        Checkout Search Library
                    </Button>
                </div>
            </div>
        </section>
    );
};
