import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useSubmitEnquiryMutation } from "@/services/estatesApi";

interface PropertyAgentSidebarProps {
    agent: {
        name: string;
        image: string;
        reviews: number;
        rating: number;
    };
    estateId?: string;
    unitId?: string;
}

export const PropertyAgentSidebar: React.FC<PropertyAgentSidebarProps> = ({ agent, estateId, unitId }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("I am interested in this property and would like more details.");
    const [sent, setSent] = useState(false);

    const [submitEnquiry, { isLoading }] = useSubmitEnquiryMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await submitEnquiry({
                name,
                email,
                message,
                ...(estateId ? { estateId } : {}),
                ...(unitId ? { unitId } : {}),
            }).unwrap();
            if (res.success) {
                setSent(true);
            } else {
                toast({ title: "Failed to send", description: res.message ?? "Please try again shortly.", variant: "destructive" });
            }
        } catch {
            toast({ title: "Failed to send", description: "Please try again shortly.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6 space-y-6">
                    {/* Agent Profile */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-slate-50">
                            <AvatarImage src={agent.image} alt={agent.name} />
                            <AvatarFallback>{agent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listed By</p>
                            <h4 className="text-lg font-bold text-slate-900">{agent.name}</h4>
                            <div className="flex items-center gap-1">
                                <div className="flex text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(agent.rating) ? "fill-current" : "text-slate-200"}`} />
                                    ))}
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">({agent.reviews} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {sent ? (
                        <div className="flex flex-col items-center gap-3 py-6 text-center">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                            <p className="font-bold text-slate-900">Message sent!</p>
                            <p className="text-xs text-slate-500">We'll get back to you within 1 hour.</p>
                            <Button variant="ghost" size="sm" onClick={() => setSent(false)}>Send another</Button>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Name</label>
                                <Input
                                    required
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl h-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 focus-visible:ring-1"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Email</label>
                                <Input
                                    required
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl h-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 focus-visible:ring-1"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Message</label>
                                <Textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl min-h-[100px] resize-none text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 focus-visible:ring-1"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-transform hover:scale-[1.02]"
                                >
                                    {isLoading ? "Sending…" : "Send Enquiry"}
                                </Button>
                            </div>
                        </form>
                    )}

                    <p className="text-[11px] text-center text-slate-400 font-medium">
                        Response time: Usually within 1 hour
                    </p>
                </CardContent>
            </Card>

            {/* Verified Badge */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                    <h5 className="text-sm font-bold text-slate-900">Verified Property</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        This property listing has been verified for accuracy of details and photos by our quality team.
                    </p>
                </div>
            </div>
        </div>
    );
};
