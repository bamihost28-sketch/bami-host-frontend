import React from "react";
import { Bed, Bath, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";

interface RentalCardProps {
    id: string;
    title: string;
    image: string;
    price: string;
    location: string;
    beds: number;
    baths: number;
    isNew?: boolean;
}

export const RentalCard: React.FC<RentalCardProps> = React.memo(({
    id,
    title,
    image,
    price,
    location,
    beds,
    baths,
    isNew
}) => {
    return (
        <Link to={`/marketplace/estate/${id}`} className="block h-full">
            <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white h-full">
                <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                        <AspectRatio ratio={4 / 3}>
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </AspectRatio>

                        {/* Overlay elements */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {isNew && (
                            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold border-none px-3 py-1 text-[10px] uppercase tracking-wider">
                                New Rental
                            </Badge>
                        )}

                        <div className="absolute bottom-4 left-4">
                            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-none font-bold px-3 py-1">
                                {price}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors line-clamp-1">
                                {title}
                            </h3>
                            <div className="flex items-center gap-1.2 text-slate-400 mt-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">{location}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Bed className="h-4 w-4 text-green-500" />
                                <span className="text-xs font-bold">{beds} Beds</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Bath className="h-4 w-4 text-green-500" />
                                <span className="text-xs font-bold">{baths} Baths</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
});

RentalCard.displayName = "RentalCard";
