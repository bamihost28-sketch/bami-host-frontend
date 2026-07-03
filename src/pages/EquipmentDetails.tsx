import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    ChevronRight, CheckCircle2, ShieldCheck,
    Zap, Eye, Lightbulb, Ruler,
    ArrowLeft, Calendar as CalendarIcon,
    HardHat, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const EQUIPMENT_DATA = {
    id: "cat-320-gc",
    title: "CAT 320 GC Next Gen Excavator",
    category: "Logistics / Equipment Yard",
    dailyRate: 250000,
    operatorRate: 35000,
    logisticsFee: 45000,
    status: "Available for Rental",
    overview: "The CAT 320 GC is a versatile machine that provides the ideal balance between performance, operator productivity features, and cost management. Its refined hydraulic system and engine technology significantly reduce fuel consumption by up to 20% compared to previous models. Designed for durability, it excels in trenching, loading, and finishing tasks with high precision.",
    safetyFeatures: [
        { icon: <ShieldCheck className="w-5 h-5" />, title: "ROPS Certified Cab", desc: "Roll-over protective structure for maximum operator safety." },
        { icon: <Eye className="w-5 h-5" />, title: "360° Vision System", desc: "Integrated cameras providing full visibility around the machine." },
        { icon: <Zap className="w-5 h-5" />, title: "E-Fence Technology", desc: "Automatically stops motion when boundaries are reached." },
        { icon: <Lightbulb className="w-5 h-5" />, title: "High-Visibility Lighting", desc: "LED work lights for safe night-time operations." }
    ],
    images: [
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a4e5190?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1579412691525-4139881682d3?auto=format&fit=crop&w=800&q=80"
    ]
};

const EquipmentDetails = () => {
    const { id } = useParams();
    const [duration, setDuration] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
    const [includeOperator, setIncludeOperator] = useState(true);
    const [days, setDays] = useState(4);

    const equipmentPrice = EQUIPMENT_DATA.dailyRate * days;
    const operatorPrice = includeOperator ? EQUIPMENT_DATA.operatorRate * days : 0;
    const total = equipmentPrice + operatorPrice + EQUIPMENT_DATA.logisticsFee;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar variant="light" />

            <main className="container mx-auto px-4 md:px-6 py-8 mt-20">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8 overflow-hidden whitespace-nowrap uppercase tracking-widest">
                    <Link to="/marketplace/estate" className="hover:text-blue-600">Logistics</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span>Equipment Yard</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900">{EQUIPMENT_DATA.title}</span>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Hero Image Section */}
                        <div className="relative rounded-3xl overflow-hidden group shadow-2xl">
                            <img
                                src={EQUIPMENT_DATA.images[0]}
                                alt={EQUIPMENT_DATA.title}
                                className="w-full h-[350px] md:h-[600px] object-cover"
                            />
                            <div className="absolute top-6 left-6">
                                <Badge className="bg-green-500 hover:bg-green-600 text-white font-black px-4 py-2 border-none rounded-xl flex items-center gap-2 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4" /> {EQUIPMENT_DATA.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Operational Overview */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Info className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Operational Overview</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-medium text-lg">
                                {EQUIPMENT_DATA.overview}
                            </p>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Our logistics units are meticulously maintained to OEM standards at our central equipment yards, ensuring 99% uptime for your project duration. Each unit comes with a full maintenance log and diagnostic report.
                            </p>
                        </section>

                        {/* Safety Features */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Safety Features</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {EQUIPMENT_DATA.safetyFeatures.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors">
                                            <div className="text-blue-600 group-hover:text-white">
                                                {feature.icon}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-black text-slate-900">{feature.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Booking */}
                    <div className="space-y-6">
                        <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl sticky top-28 outline outline-1 outline-slate-100">
                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rental Rate</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900 italic">₦{EQUIPMENT_DATA.dailyRate.toLocaleString()}</span>
                                        <span className="text-slate-400 font-bold text-sm">/ Day</span>
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                {/* Duration Select */}
                                <div className="space-y-4">
                                    <div className="text-[11px] font-black uppercase text-slate-900 tracking-widest">Rental Duration</div>
                                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        {["Daily", "Weekly", "Monthly"].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setDuration(mode as any)}
                                                className={cn(
                                                    "py-3 rounded-xl text-xs font-black transition-all",
                                                    duration === mode
                                                        ? "bg-blue-600 text-white shadow-lg"
                                                        : "text-slate-500 hover:bg-slate-100"
                                                )}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Select Dates */}
                                <div className="space-y-4">
                                    <div className="text-[11px] font-black uppercase text-slate-900 tracking-widest">Select Dates</div>
                                    <div className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-6 gap-4 text-sm font-bold text-slate-600 cursor-pointer hover:border-blue-300 transition-colors">
                                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                                        <span>Oct 24 - Oct 28, 2024</span>
                                    </div>
                                </div>

                                {/* Operator Toggle */}
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200/50">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-slate-900">Include Operator</div>
                                        <div className="text-[10px] font-bold text-blue-600">+₦{EQUIPMENT_DATA.operatorRate.toLocaleString()} / Day</div>
                                    </div>
                                    <Switch
                                        checked={includeOperator}
                                        onCheckedChange={setIncludeOperator}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>

                                {/* Breakdown */}
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500">Excavator Rental ({days} Days)</span>
                                        <span className="text-slate-900 tracking-tighter">₦{equipmentPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500">Expert Operator ({days} Days)</span>
                                        <span className="text-slate-900 tracking-tighter">₦{operatorPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500">Logistics & Mobilization</span>
                                        <span className="text-slate-900 tracking-tighter">₦{EQUIPMENT_DATA.logisticsFee.toLocaleString()}</span>
                                    </div>
                                    <Separator className="bg-slate-50" />
                                    <div className="flex justify-between items-end">
                                        <div className="text-xl font-black text-slate-900 uppercase italic">Total Amount</div>
                                        <div className="text-3xl font-black text-blue-600 italic tracking-tighter">₦{total.toLocaleString()}</div>
                                    </div>
                                </div>

                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-[1.5rem] text-lg shadow-xl shadow-blue-100 transition-all active:scale-95 group">
                                    Request Booking <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <p className="text-[9px] text-center text-slate-400 font-bold px-8 leading-relaxed">
                                    * Final invoice may include VAT and site-specific surcharges for specialized terrain operations.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Logistics Footer Branding */}
            <div className="bg-white border-t border-slate-100 py-16">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12">
                        <div className="space-y-6">
                            <div className="text-2xl font-black text-slate-900 italic flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                BusinessHub
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Driving industrial excellence across Nigeria with state-of-the-art equipment and professional logistics.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Quick Links</h5>
                            <ul className="space-y-3 text-xs font-bold text-slate-500">
                                <li>Inventory Search</li>
                                <li>Rental Terms</li>
                                <li>Safety Protocols</li>
                                <li>Support Center</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Our Offices</h5>
                            <ul className="space-y-3 text-xs font-bold text-slate-500">
                                <li>Lagos Headquarters</li>
                                <li>Abuja Logistics Hub</li>
                                <li>Port Harcourt Yard</li>
                                <li>Kano Regional Office</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h5 className="font-black text-slate-900 uppercase tracking-widest text-xs">Emergency Support</h5>
                            <p className="text-[10px] text-slate-500 font-bold">24/7 On-site maintenance available for active rentals.</p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black gap-2 rounded-xl">
                                <HardHat className="w-4 h-4" /> Call Dispatch
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer variant="dark" />
        </div>
    );
};

export default EquipmentDetails;
