import { Search, MapPin, BadgeDollarSign, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/providers/ToastProvider";

export const EstateHero = () => {
    const { success } = useToast();

    const handleSearch = () => {
        success("Searching for properties matching your criteria...");
    };

    return (
        <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden flex items-center justify-center">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 w-full max-w-5xl px-6 text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                        Find your perfect <br />
                        <span className="text-green-400">rental home</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl mx-auto">
                        Discover thousands of verified apartments, houses, and short lets in the most desirable locations.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 shadow-2xl max-w-4xl mx-auto">
                    <div className="bg-white rounded-[1.8rem] p-4 md:p-2 flex flex-col md:flex-row items-center gap-4">
                        {/* Location */}
                        <div className="flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-slate-100 flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Location</p>
                                <Input
                                    placeholder="Where are you looking?"
                                    className="border-none p-0 h-auto focus-visible:ring-0 text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-medium"
                                />
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-slate-100 flex items-center gap-3">
                            <BadgeDollarSign className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Monthly Budget</p>
                                <Select>
                                    <SelectTrigger className="border-none p-0 h-auto focus:ring-0 text-slate-900 font-bold shadow-none">
                                        <SelectValue placeholder="Select Range" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100">
                                        <SelectItem value="0-500k">₦0 - ₦500k</SelectItem>
                                        <SelectItem value="500k-1m">₦500k - ₦1m</SelectItem>
                                        <SelectItem value="1m-5m">₦1m - ₦5m</SelectItem>
                                        <SelectItem value="5m+">₦5m+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Property Type */}
                        <div className="flex-1 w-full px-4 flex items-center gap-3">
                            <Building className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Rental Type</p>
                                <Select>
                                    <SelectTrigger className="border-none p-0 h-auto focus:ring-0 text-slate-900 font-bold shadow-none">
                                        <SelectValue placeholder="Apartment" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100">
                                        <SelectItem value="apartment">Apartment</SelectItem>
                                        <SelectItem value="house">House</SelectItem>
                                        <SelectItem value="short-let">Short Let</SelectItem>
                                        <SelectItem value="service-apartment">Service Apartment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-[1.5rem] px-8 py-7 md:py-4 flex items-center gap-2 font-bold transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 btn-interactive"
                        >
                            <Search className="h-5 w-5" />
                            Search Rentals
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
