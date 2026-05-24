import { MapPin, ArrowRight, Loader2, CalendarDays, Bed, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useGetPublicListingsQuery } from "@/services/estatesApi";
import { formatDate, formatCurrency } from "@/utils/propertyUtils";

export const EstateProperties = () => {
    const { data: response, isLoading } = useGetPublicListingsQuery({ limit: 3 });
    const properties = response?.data || [];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-2">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-xs">Portfolio</span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900">Estate Properties & Associates</h2>
                        <p className="text-slate-500 max-w-xl">Curated residential and commercial spaces designed for high-impact living and working environments.</p>
                    </div>
                    <Link to="/marketplace/estate/all">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-6 group">
                            Explore Assets <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold">Fetching premium properties...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-bold">No public listings available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div key={property.id || property._id} className="group flex flex-col h-[380px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="relative h-[190px] shrink-0 overflow-hidden">
                                    <img
                                        src={property.images && property.images.length > 0 ? property.images[0].url : "/images/estate/estate_exterior_modern_1768390624272.png"}
                                        alt={property.label}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                                    <div className="absolute top-3 left-3 flex gap-1.5">
                                        <Badge className="bg-blue-600 text-white font-bold border-none text-[10px] px-2.5 py-1 rounded-lg shadow">
                                            {property.category || "Property"}
                                        </Badge>
                                        {property.listingType && (
                                            <Badge className="bg-white/90 text-slate-700 font-bold border-none text-[10px] px-2.5 py-1 rounded-lg backdrop-blur">
                                                {property.listingType}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between p-4 flex-1 overflow-hidden">
                                    <div className="space-y-1.5">
                                        <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{property.label}</h3>
                                        {property.estate?.name && (
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{property.estate.name}</p>
                                        )}
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                            <span className="text-[10px] truncate">{property.streetAddress || "Lagos, Nigeria"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                            {(property.bedrooms ?? 0) > 0 && (
                                                <span className="flex items-center gap-0.5"><Bed className="w-3 h-3 text-slate-400" />{property.bedrooms}</span>
                                            )}
                                            {(property.bathrooms ?? 0) > 0 && (
                                                <span className="flex items-center gap-0.5"><Bath className="w-3 h-3 text-slate-400" />{property.bathrooms}</span>
                                            )}
                                            {property.area ? (
                                                <span className="text-slate-400 text-[10px]">{property.area.toLocaleString()} sqft</span>
                                            ) : null}
                                        </div>
                                        {property.availableDate && (
                                            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                                                <CalendarDays className="w-3 h-3" />
                                                Available {formatDate(property.availableDate)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase block">Monthly</span>
                                            <span className="text-sm font-black text-blue-600">
                                                {property.monthlyPrice ? formatCurrency(property.monthlyPrice) : "Contact Sales"}
                                            </span>
                                            {property.serviceChargeMonthly ? (
                                                <span className="text-[9px] text-slate-400 font-bold block">+ {formatCurrency(property.serviceChargeMonthly)} service</span>
                                            ) : null}
                                        </div>
                                        <Link to={`/marketplace/estate/${property.id || property._id}`}>
                                            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 h-9 rounded-xl text-xs">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center mt-16">
                    <Link to="/marketplace/estate/all">
                        <Button variant="outline" className="border-slate-200 bg-white text-slate-900 font-bold px-12 py-7 rounded-2xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all group">
                            See more properties
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
