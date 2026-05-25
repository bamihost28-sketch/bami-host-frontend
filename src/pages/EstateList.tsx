import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Search, MapPin, LayoutGrid, List,
    ArrowRight, Building2,
    Sparkles, Filter,
    Loader2, CalendarDays, X, ChevronDown
} from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/propertyUtils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useGetPublicListingsQuery, useGetPublicEstatesQuery } from "@/services/estatesApi";

const EstateList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [propertyType, setPropertyType] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const activeEstateId = searchParams.get("estate") || undefined;
    const activeEstateName = searchParams.get("estateName") || undefined;

    const { data: response, isLoading } = useGetPublicListingsQuery({
        search: searchQuery || undefined,
        estateId: activeEstateId,
    });

    const { data: estatesResponse } = useGetPublicEstatesQuery();
    const publicEstates = estatesResponse?.data || [];

    const properties = response?.data || [];

    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            const matchesType = propertyType === "all" ||
                (p.category && p.category.toLowerCase().includes(propertyType.toLowerCase()));
            return matchesType;
        });
    }, [properties, propertyType]);

    const handleEstateFilter = (estateId: string, estateName: string) => {
        setSearchParams({ estate: estateId, estateName });
    };

    const clearEstateFilter = () => {
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar variant="light" />

            <main className="container mx-auto px-4 md:px-6 py-8 mt-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                            <Sparkles className="w-3 h-3" /> BamiHost Properties
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 italic tracking-tighter">
                            {activeEstateName ? activeEstateName : "Explore Premier Estates"}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {activeEstateName
                                ? `Showing all available units in ${activeEstateName}`
                                : "Find your perfect home or investment across our curated collection."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Active Estate Filter Banner */}
                {activeEstateName && (
                    <div className="flex items-center gap-3 mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Filtered by Estate</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{activeEstateName}</p>
                        </div>
                        <Button
                            onClick={clearEstateFilter}
                            variant="outline"
                            className="shrink-0 h-8 px-3 rounded-xl border-blue-200 bg-white text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold text-xs gap-1.5"
                        >
                            <X className="w-3.5 h-3.5" /> Clear
                        </Button>
                    </div>
                )}

                {/* Search & Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
                    <div className="md:col-span-12 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by area, property name or city..."
                            className="w-full h-16 pl-14 pr-6 rounded-2xl border-slate-100 bg-white shadow-sm focus-visible:ring-blue-600 text-lg font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
                    <div className="md:col-span-3">
                        <Select value={propertyType} onValueChange={setPropertyType}>
                            <SelectTrigger className="w-full h-16 rounded-2xl border-slate-100 bg-white shadow-sm font-bold text-slate-700 px-6">
                                <Building2 className="w-5 h-5 mr-3 text-blue-600" />
                                <SelectValue placeholder="Property Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 p-2">
                                <SelectItem value="all" className="rounded-xl font-bold py-3">All Properties</SelectItem>
                                <SelectItem value="apartment" className="rounded-xl font-bold py-3">Apartments</SelectItem>
                                <SelectItem value="villa" className="rounded-xl font-bold py-3">Villas</SelectItem>
                                <SelectItem value="land" className="rounded-xl font-bold py-3">Land Plot</SelectItem>
                                <SelectItem value="penthouse" className="rounded-xl font-bold py-3">Penthouses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-3">
                        {/* Estate Filter Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-full h-16 rounded-2xl border-slate-100 bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-50 gap-3 justify-between px-6 ${activeEstateId ? "border-blue-300 bg-blue-50" : ""}`}
                                >
                                    <span className="flex items-center gap-3 truncate">
                                        <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                                        <span className="truncate">{activeEstateName || "Filter by Estate"}</span>
                                    </span>
                                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72 rounded-2xl p-2 border-slate-100 shadow-xl">
                                {activeEstateId && (
                                    <DropdownMenuItem
                                        onClick={clearEstateFilter}
                                        className="rounded-xl font-bold px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> All Estates
                                    </DropdownMenuItem>
                                )}
                                {publicEstates.length === 0 ? (
                                    <div className="px-4 py-3 text-xs text-slate-400 font-bold">No estates available</div>
                                ) : (
                                    publicEstates.map(estate => (
                                        <DropdownMenuItem
                                            key={estate._id}
                                            onClick={() => handleEstateFilter(estate._id, estate.name)}
                                            className={`rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between gap-2 ${activeEstateId === estate._id ? "bg-blue-50 text-blue-700" : ""}`}
                                        >
                                            <span className="font-bold text-sm truncate">{estate.name}</span>
                                            <span className="shrink-0 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                                {estate.vacantUnits} vacant
                                            </span>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="md:col-span-6">
                        <Button className="w-full h-16 rounded-2xl bg-slate-900 border-none hover:bg-slate-800 text-white font-black gap-3 shadow-xl transform active:scale-95 transition-all">
                            <Filter className="w-5 h-5" />
                            Filters
                        </Button>
                    </div>
                </div>

                <Separator className="mb-10 opacity-50" />

                {/* Results Count */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-slate-500 font-bold">
                        {isLoading ? "Searching..." : (
                            <>Showing <span className="text-slate-900">{filteredProperties.length}</span> results found</>
                        )}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sort By:</span>
                        <Select defaultValue="featured">
                            <SelectTrigger className="w-40 border-none bg-transparent font-black text-blue-600 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                <SelectItem value="newest">Newest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Property Grid/List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold text-xl tracking-tight">Curating your next home...</p>
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {filteredProperties.map((property) => (
                            <div
                                key={property.id || property._id}
                                className={`group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 ${
                                    viewMode === "list" ? "flex flex-row h-[210px]" : "flex flex-col h-[420px]"
                                }`}
                            >
                                {/* Image */}
                                <div className={`relative overflow-hidden shrink-0 ${viewMode === "list" ? "w-[260px] h-full" : "w-full h-[200px]"}`}>
                                    <img
                                        src={property.images && property.images.length > 0 ? property.images[0].url : "/images/estate/estate_exterior_modern_1768390624272.png"}
                                        alt={property.label}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/estate/estate_exterior_modern_1768390624272.png"; }}
                                    />
                                    <div className="absolute top-3 left-3 flex gap-1.5">
                                        <Badge className="bg-blue-600 text-white font-bold px-2.5 py-1 border-none rounded-lg text-[10px] shadow">
                                            {property.category || "Property"}
                                        </Badge>
                                        {property.listingType && (
                                            <Badge className="bg-white/90 text-slate-700 font-bold px-2.5 py-1 border-none rounded-lg text-[10px] backdrop-blur">
                                                {property.listingType}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col justify-between p-5 flex-1 min-w-0 overflow-hidden">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-blue-600">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            <span className="text-xs font-bold uppercase tracking-wider truncate">
                                                {property.streetAddress || property.estate?.name || "Lagos, Nigeria"}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors truncate">
                                            {property.label}
                                        </h3>

                                        {/* Clickable Estate Name */}
                                        {property.estate?.name && (
                                            <button
                                                onClick={() => handleEstateFilter(
                                                    property.estate!._id || property.estate!.id,
                                                    property.estate!.name
                                                )}
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors group/estate w-full text-left"
                                            >
                                                <Building2 className="w-3 h-3 shrink-0 text-slate-400 group-hover/estate:text-blue-600 transition-colors" />
                                                <span className="truncate uppercase tracking-wider">{property.estate.name}</span>
                                                <ArrowRight className="w-3 h-3 shrink-0 opacity-0 group-hover/estate:opacity-100 transition-opacity ml-auto" />
                                            </button>
                                        )}

                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Beds</span>
                                                <span className="text-sm font-bold text-slate-700">{property.bedrooms || 0}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Baths</span>
                                                <span className="text-sm font-bold text-slate-700">{property.bathrooms || 0}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Size</span>
                                                <span className="text-sm font-bold text-slate-700">{property.area ? `${property.area.toLocaleString()} sqft` : "N/A"}</span>
                                            </div>
                                        </div>
                                        {property.availableDate && (
                                            <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                Available {formatDate(property.availableDate)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Separator className="mb-3" />
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Monthly</span>
                                                <span className="text-base font-black text-blue-600">
                                                    {property.monthlyPrice ? formatCurrency(property.monthlyPrice) : "Contact Sales"}
                                                </span>
                                                {property.serviceChargeMonthly && (
                                                    <span className="text-[10px] text-slate-400 font-bold block">+ {formatCurrency(property.serviceChargeMonthly)} service</span>
                                                )}
                                            </div>
                                            <Link to={`/marketplace/estate/${property.id || property._id}`}>
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 h-9 rounded-xl gap-1.5 text-sm">
                                                    Details <ArrowRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900">No properties found</h3>
                            <p className="text-slate-500 font-medium">
                                {activeEstateName
                                    ? `No vacant units found in ${activeEstateName}.`
                                    : "Try adjusting your filters or search query to find more results."}
                            </p>
                        </div>
                        <Button
                            onClick={() => { setSearchQuery(""); setPropertyType("all"); clearEstateFilter(); }}
                            variant="link"
                            className="text-blue-600 font-black h-auto p-0"
                        >
                            Reset all filters
                        </Button>
                    </div>
                )}
            </main>

            <Footer variant="light" />
        </div>
    );
};

export default EstateList;
