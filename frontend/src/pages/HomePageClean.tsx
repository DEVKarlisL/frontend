import React, { useState } from "react";
import { Gavel, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Countdown from "@/components/Countdown";

interface Auction {
  id: number;
  title: string;
  image: string;
  currentBid: number;
  numberOfBids: number;
  timeRemaining: string;
  status: "live" | "soon" | "ended";
  category: string;
  location?: string;
  verified?: boolean;
}

interface Category {
  id: string;
  title: string;
  count: number;
  icon: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const auctions: Auction[] = [
    {
      id: 1,
      title: "BMW 530d xDrive M-Sport (2022)",
      image:
        "https://images.unsplash.com/photo-1609687953322-c36bbfb6c31c?w=500&h=500&fit=crop",
      currentBid: 42500,
      numberOfBids: 18,
      timeRemaining: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: "live",
      category: "Automašīnas",
      location: "Lidosta Rīga",
    },
    {
      id: 2,
      title: "Luksusa apartamenti Klīversalā",
      image:
        "https://images.unsplash.com/photo-1512917774080-9a485dc89309?w=500&h=500&fit=crop",
      currentBid: 285000,
      numberOfBids: 7,
      timeRemaining: new Date(
        Date.now() + (2 * 24 + 14) * 60 * 60 * 1000,
      ).toISOString(),
      status: "live",
      category: "Īpašumi",
      location: "Rīga, Pārdaugava",
    },
    {
      id: 3,
      title: "Rolex Submariner Date 41mm",
      image:
        "https://images.unsplash.com/photo-1523170335684-f06b4b7905d9?w=500&h=500&fit=crop",
      currentBid: 14200,
      numberOfBids: 32,
      timeRemaining: new Date(
        Date.now() + 1 * 60 * 60 * 1000 + 22 * 60 * 1000,
      ).toISOString(),
      status: "live",
      category: "Pulksteņi",
      verified: true,
    },
    {
      id: 4,
      title: "Kravas kuteris Venta-2",
      image:
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=500&fit=crop",
      currentBid: 12000,
      numberOfBids: 45,
      timeRemaining: new Date(
        Date.now() + (1 * 24 + 8) * 60 * 60 * 1000,
      ).toISOString(),
      status: "soon",
      category: "Kuģi",
      location: "Ventspils Osta",
    },
    {
      id: 5,
      title: "Mercedes-Benz GLC 63 AMG",
      image:
        "https://images.unsplash.com/photo-1606611191867-4957ec2658a7?w=500&h=500&fit=crop",
      currentBid: 65000,
      numberOfBids: 31,
      timeRemaining: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: "live",
      category: "Automašīnas",
    },
    {
      id: 6,
      title: "Vintage Seiko Chronograph",
      image:
        "https://images.unsplash.com/photo-1495856458515-0637185298c1?w=500&h=500&fit=crop",
      currentBid: 8500,
      numberOfBids: 28,
      timeRemaining: new Date(
        Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000,
      ).toISOString(),
      status: "live",
      category: "Pulksteņi",
    },
  ];

  const categories: Category[] = [
    { id: "cars", title: "Automašīnas", count: 912, icon: "🚗" },
    { id: "property", title: "Īpašumi", count: 61, icon: "🏢" },
    { id: "watches", title: "Pulksteņi", count: 131, icon: "⌚" },
    { id: "ships", title: "Kuģi", count: 4, icon: "⛵" },
  ];

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
  };

  const handleAuctionClick = (auctionId: number) => {
    navigate(`/auctions/${auctionId}`);
  };

  const handleBidClick = (
    e: React.MouseEvent,
    auctionId: number,
    status: string,
  ) => {
    e.stopPropagation();
    if (status === "soon") {
      alert("Atgādinājums pievienots!");
    } else {
      navigate(`/auctions/${auctionId}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, auctionId: number) => {
    e.stopPropagation();
    const newFav = new Set(favorites);
    if (newFav.has(auctionId)) newFav.delete(auctionId);
    else newFav.add(auctionId);
    setFavorites(newFav);
  };

  const visibleAuctions = selectedCategory
    ? auctions.filter((a) => a.category === selectedCategory)
    : auctions;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">
          Kategorijas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.title)}
              className="text-left p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md hover:border-primary-300 transition-all"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">
                {cat.title}
              </h3>
              <p className="text-xs text-primary-600 font-semibold">
                {cat.count} Izsoles
              </p>
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">
          Aktuālās izsoles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleAuctions.map((auction) => (
            <button
              key={auction.id}
              onClick={() => handleAuctionClick(auction.id)}
              className="text-left bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100"
            >
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect fill='%23e2e8f0' width='500' height='500'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%2394a3b8'%3EImage Error%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-1 rounded ${
                      auction.status === "live"
                        ? "bg-green-500 text-white"
                        : auction.status === "soon"
                          ? "bg-amber-500 text-white"
                          : "bg-slate-400 text-white"
                    }`}
                  >
                    {auction.status === "live"
                      ? "TIEŠRAIDE"
                      : auction.status === "soon"
                        ? "DRĪZ SĀKSIES"
                        : "BEIGTA"}
                  </span>
                </div>
                <button
                  onClick={(e) => handleFavoriteClick(e, auction.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                >
                  <Heart
                    size={16}
                    className={
                      favorites.has(auction.id)
                        ? "fill-red-500 text-red-500"
                        : "text-slate-400"
                    }
                  />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-sm mb-2 line-clamp-2">
                  {auction.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {auction.verified && "✓"} {auction.category}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Cena
                    </p>
                    <p className="text-lg font-black text-primary-600">
                      €{(auction.currentBid / 1000).toFixed(1)}k
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Atlicis
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      <Countdown endTime={auction.timeRemaining} />
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                    <Gavel size={14} />
                    {auction.numberOfBids} solītāji
                  </div>
                  <button
                    onClick={(e) =>
                      handleBidClick(e, auction.id, auction.status)
                    }
                    className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${
                      auction.status === "soon"
                        ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    }`}
                  >
                    {auction.status === "soon" ? "Atgādināt" : "Solīt"}
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <footer className="bg-slate-100 border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-sm text-slate-500">
            <p>
              © 2024 Latvijas Izsole. Reģ. Nr. 40003000001. Visas tiesības
              aizsargātas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
