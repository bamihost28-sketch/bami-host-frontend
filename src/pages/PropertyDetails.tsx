import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ChevronRight,
    ArrowRight,
    Building2,
    Bed,
    Bath,
    Maximize,
    Wifi,
    Car,
    Dog,
    Dumbbell,
    UserCheck,
    Wind,
    Waves,
    Square,
    MapPin,
    Compass,
    Home,
    Loader2,
    AlertCircle,
    CalendarDays,
    Tag,
    BadgeCheck,
    Share2,
    Copy,
    Check,
    MessageCircle,
    Twitter,
    Facebook,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyGallery } from "@/components/estate/PropertyGallery";
import { PropertyAgentSidebar } from "@/components/estate/PropertyAgentSidebar";
import { RentalApplicationDialog } from "@/components/estate/RentalApplicationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/providers/ToastProvider";
import { useGetPublicListingByIdQuery } from "@/services/estatesApi";
import { formatDate, formatCurrency } from "@/utils/propertyUtils";

const AMENITY_MAP = {
    wifi: { icon: <Wifi className="h-5 w-5" />, label: "High-speed Wi-Fi" },
    parking: { icon: <Car className="h-5 w-5" />, label: "Secure Parking" },
    petFriendly: { icon: <Dog className="h-5 w-5" />, label: "Pet Friendly" },
    gym: { icon: <Dumbbell className="h-5 w-5" />, label: "24/7 Fitness Gym" },
    security: { icon: <UserCheck className="h-5 w-5" />, label: "Concierge Service" },
    ac: { icon: <Wind className="h-5 w-5" />, label: "Central Cooling" },
    pool: { icon: <Waves className="h-5 w-5" />, label: "Rooftop Pool" },
    balcony: { icon: <Square className="h-5 w-5" />, label: "Private Balcony" },
    laundry: { icon: <Home className="h-5 w-5" />, label: "In-unit Laundry" },
};

const STATUS_BADGE: Record<string, string> = {
    vacant: "bg-green-100 text-green-700",
    occupied: "bg-orange-100 text-orange-700",
    maintenance: "bg-yellow-100 text-yellow-700",
};

const PropertyDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { data: response, isLoading, error } = useGetPublicListingByIdQuery(id || "");
    const property = response?.data;
    const { info } = useToast();
    const [applyOpen, setApplyOpen] = useState(false);

    const estateId = property?.estate?.id ?? property?.estate?._id ?? id ?? '';
    const unitId = property?.id ?? property?._id ?? '';

    const [copied, setCopied] = useState(false);
    const pageUrl = window.location.href;
    const shareText = property ? `Check out ${property.label} on BamiHost` : "Check out this property on BamiHost";

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${pageUrl}`)}`, "_blank");
    };

    const handleShareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`, "_blank");
    };

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank");
    };

    const handleShowAll = () => {
        info(`Viewing all ${property?.images?.length || 0} photos of this premium property!`);
    };

    const handleExploreArea = () => {
        info(`Opening neighborhood guide for ${property?.streetAddress || property?.label}...`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar variant="light" />
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-bold text-xl tracking-tight">Loading property details...</p>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar variant="light" />
                <div className="container mx-auto px-6 py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Property Not Found</h2>
                    <p className="text-slate-500 max-w-md mx-auto">We couldn't find the property you're looking for. It may have been moved or is no longer available.</p>
                    <Link to="/marketplace/estate">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-6 rounded-2xl">
                            Back to Marketplace
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const propertyAmenities = property.amenities
        ? Object.entries(property.amenities)
            .filter(([_, value]) => value === true)
            .map(([key]) => AMENITY_MAP[key as keyof typeof AMENITY_MAP])
            .filter(Boolean)
        : [];

    const displayImages = property.images && property.images.length > 0
        ? property.images.map((img) => img.url)
        : ["/images/estate/estate_exterior_modern_1768390624272.png"];

    const hasArea = property.area && property.area > 0;
    const statusKey = (property.status ?? "vacant").toLowerCase();

    const pricingRows = [
        { label: "Monthly Rent", value: property.monthlyPrice ? formatCurrency(property.monthlyPrice) : null },
        { label: "Service Charge / mo", value: property.serviceChargeMonthly ? formatCurrency(property.serviceChargeMonthly) : null },
        { label: "Caution Fee", value: property.cautionFee ? formatCurrency(property.cautionFee) : null },
        { label: "Legal Fee", value: property.legalFee ? formatCurrency(property.legalFee) : null },
    ].filter((r) => r.value !== null);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <Navbar variant="light" />

            <main className="container mx-auto px-6 py-8 mt-20">
                {/* Breadcrumbs */}
                <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400 mb-8">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link to="/marketplace/estate" className="hover:text-blue-600 transition-colors">Marketplace</Link>
                    {property.estate?.name && (
                        <>
                            <ChevronRight className="h-4 w-4" />
                            <Link
                                to={`/marketplace/estate/all?estate=${property.estate._id || property.estate.id}&estateName=${encodeURIComponent(property.estate.name)}`}
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                {property.estate.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 truncate max-w-[200px]">{property.label}</span>
                </nav>

                {/* Gallery */}
                <div className="mb-10">
                    <PropertyGallery images={displayImages} onShowAll={handleShowAll} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {property.category && (
                                        <Badge className="bg-blue-50 text-blue-700 border-0 font-bold text-xs px-3 py-1 rounded-full">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {property.category}
                                        </Badge>
                                    )}
                                    {property.listingType && (
                                        <Badge className="bg-slate-100 text-slate-600 border-0 font-bold text-xs px-3 py-1 rounded-full">
                                            {property.listingType}
                                        </Badge>
                                    )}
                                    {property.status && (
                                        <Badge className={`border-0 font-bold text-xs px-3 py-1 rounded-full capitalize ${STATUS_BADGE[statusKey] ?? "bg-slate-100 text-slate-600"}`}>
                                            <BadgeCheck className="h-3 w-3 mr-1" />
                                            {property.status}
                                        </Badge>
                                    )}
                                    {property.estate?.name && (
                                        <Link
                                            to={`/marketplace/estate/all?estate=${property.estate._id || property.estate.id}&estateName=${encodeURIComponent(property.estate.name)}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
                                        >
                                            <Compass className="h-3 w-3" />
                                            {property.estate.name}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                                    {property.label}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
                                    {property.streetAddress && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                                            {property.streetAddress}
                                        </span>
                                    )}
                                    {property.availableDate && (
                                        <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            Available {formatDate(property.availableDate)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                                <div className="text-left md:text-right">
                                    <p className="text-xl font-black text-blue-600">
                                        {property.monthlyPrice ? `${formatCurrency(property.monthlyPrice)}/mo` : "Contact Sales"}
                                    </p>
                                    {property.serviceChargeMonthly ? (
                                        <p className="text-sm font-bold text-slate-400">
                                            + {formatCurrency(property.serviceChargeMonthly)} service charge
                                        </p>
                                    ) : null}
                                </div>

                                {/* Share button */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/30">
                                            <Share2 className="h-4 w-4" />
                                            Share
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-64 p-3 rounded-2xl shadow-xl border-slate-100 bg-white">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Share this property</p>
                                        <div className="space-y-1">
                                            <button
                                                onClick={handleCopyLink}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{copied ? "Copied!" : "Copy link"}</p>
                                                    <p className="text-[10px] text-slate-400">Share the direct URL</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={handleShareWhatsApp}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                                    <MessageCircle className="h-4 w-4 text-green-600" />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">WhatsApp</p>
                                                    <p className="text-[10px] text-slate-400">Send via WhatsApp</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={handleShareTwitter}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 transition-colors text-left"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                                                    <Twitter className="h-4 w-4 text-sky-500" />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Twitter / X</p>
                                                    <p className="text-[10px] text-slate-400">Post on X</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={handleShareFacebook}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                                    <Facebook className="h-4 w-4 text-blue-600" />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Facebook</p>
                                                    <p className="text-[10px] text-slate-400">Share on Facebook</p>
                                                </div>
                                            </button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Quick Features */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6">
                            <div className="flex items-center gap-4 bg-slate-700 px-6 py-4 rounded-2xl border border-slate-600">
                                <div className="p-2.5 bg-slate-800 rounded-xl">
                                    <Bed className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bedrooms</p>
                                    <p className="text-base font-bold text-slate-100">{property.bedrooms || 0} Beds</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-700 px-6 py-4 rounded-2xl border border-slate-600">
                                <div className="p-2.5 bg-slate-800 rounded-xl">
                                    <Bath className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bathrooms</p>
                                    <p className="text-base font-bold text-slate-100">{property.bathrooms || 0} Baths</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-700 px-6 py-4 rounded-2xl border border-slate-600">
                                <div className="p-2.5 bg-slate-800 rounded-xl">
                                    <Maximize className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Living Area</p>
                                    <p className="text-base font-bold text-slate-100">
                                        {hasArea ? `${property.area!.toLocaleString()} sqft` : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Description */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-black text-slate-900">About this property</h3>
                            <div className="text-slate-500 leading-relaxed font-medium space-y-4">
                                {property.description ? (
                                    property.description.split('\n\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))
                                ) : (
                                    <p>Experience luxury living at its finest in this breathtaking property. Meticulously designed for high-impact living and working environments.</p>
                                )}
                            </div>
                        </section>

                        <div className="border-t border-slate-100" />

                        {/* Pricing Breakdown */}
                        {pricingRows.length > 0 && (
                            <>
                                <section className="space-y-6">
                                    <h3 className="text-lg font-black text-slate-900">Pricing breakdown</h3>
                                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                        {pricingRows.map((row, idx) => (
                                            <div key={idx} className={`flex items-center justify-between px-6 py-4 ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                                                <span className="text-sm font-bold text-slate-500">{row.label}</span>
                                                <span className="text-sm font-black text-slate-900">{row.value}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between px-6 py-4 bg-blue-600">
                                            <span className="text-sm font-bold text-blue-100">First Year Total</span>
                                            <span className="text-base font-black text-white">
                                                {formatCurrency(
                                                    (property.monthlyPrice ?? 0) * 12 +
                                                    (property.serviceChargeMonthly ?? 0) * 12 +
                                                    (property.cautionFee ?? 0) +
                                                    (property.legalFee ?? 0)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                                <div className="border-t border-slate-100" />
                            </>
                        )}

                        {/* Amenities */}
                        <section className="space-y-8">
                            <h3 className="text-lg font-black text-slate-900">What this place offers</h3>
                            {propertyAmenities.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                                    {propertyAmenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                            <span className="text-blue-600">{amenity!.icon}</span>
                                            {amenity!.label}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">No specific amenities listed.</p>
                            )}
                        </section>

                        <div className="border-t border-slate-100" />

                        {/* Location / Map Placeholder */}
                        <section className="space-y-8">
                            <h3 className="text-lg font-black text-slate-900">Location</h3>
                            <div className="relative rounded-3xl overflow-hidden h-[400px] border border-slate-100 shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1600&q=80"
                                    alt="Map Placeholder"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-600 rounded-xl">
                                                <Compass className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900">Neighborhood Guide</h5>
                                                <p className="text-xs font-bold text-slate-500">
                                                    {property.streetAddress || property.estate?.name || "Lagos, Nigeria"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button onClick={handleExploreArea} variant="ghost" className="text-blue-600 font-black hover:bg-blue-50">
                                            Explore Area
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* More units in this estate */}
                        {property.estate?.name && (
                            <>
                                <div className="border-t border-slate-100" />
                                <section>
                                    <Link
                                        to={`/marketplace/estate/all?estate=${property.estate._id || property.estate.id}&estateName=${encodeURIComponent(property.estate.name)}`}
                                        className="group flex items-center justify-between p-6 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-2xl transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                                                <Building2 className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-0.5">Browse Estate</p>
                                                <h4 className="text-base font-black text-slate-900">See other vacant units in {property.estate.name}</h4>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">View all available apartments in this estate</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-blue-600 shrink-0 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </section>
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <Button
                                onClick={() => setApplyOpen(true)}
                                className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg"
                            >
                                Apply Now
                            </Button>

                            <PropertyAgentSidebar
                                agent={{
                                    name: "Jonathan Miller",
                                    image: "https://i.pravatar.cc/150?u=jonathan",
                                    reviews: 42,
                                    rating: 5,
                                }}
                                estateId={estateId}
                                unitId={unitId}
                            />
                        </div>
                    </aside>
                </div>
            </main>

            <Footer variant="light" />

            <RentalApplicationDialog
                open={applyOpen}
                onOpenChange={setApplyOpen}
                estateId={estateId}
                unitId={unitId}
                propertyLabel={property?.label}
            />
        </div>
    );
};

export default PropertyDetails;
