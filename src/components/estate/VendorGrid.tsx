import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useGetPublicVendorsQuery } from "@/services/vendorsApi";

export const VendorGrid = () => {
    const { data: vendorsData, isLoading } = useGetPublicVendorsQuery();
    const vendors = vendorsData?.data || [];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 text-center">
                <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">Our Ecosystem</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">Vendor Marketplace & Services</h2>
                <p className="text-slate-500 max-w-2xl mx-auto mb-16">Connect with pre-vetted industry experts and certified service providers handpicked for their dedication to excellence.</p>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {vendors.map((vendor) => (
                            <div key={vendor._id} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="w-full h-full rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-2xl uppercase">
                                        {vendor.name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-lg px-2 py-1 shadow-sm border border-slate-100 flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-black">4.9</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">{vendor.businessName || vendor.name}</h4>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-6 truncate px-2">
                                    {vendor.specialization || 'Service Provider'}
                                </p>
                                <Link to={`/marketplace/vendor/${vendor._id}`}>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl transition-transform active:scale-95">View Profile</Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && vendors.length === 0 && (
                    <div className="py-20 text-slate-400 font-bold italic">
                        No vendors currently available in your region.
                    </div>
                )}
            </div>
        </section>
    );
};
