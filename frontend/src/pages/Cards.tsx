import React from "react";
import { useNavigate } from "react-router-dom";

const cardData = [
  {
    name: "NF",
    color: "bg-red-700",
    img: "/images/netmirror.jpg"
  },
  {
    name: "Crunchy",
    color: "bg-orange-600",
    img: "/images/crunchyroll.png"
  },
  {
    name: "YT Premium",
    color: "bg-red-600",
    img: "/images/youtube.png"
  },
  {
    name: "Prime",
    color: "bg-sky-500",
    img: "/images/prime2.png"
  },
];

const Cards = () => {
  const navigate = useNavigate();


  const handleCardClick = (name,color: string) => {
    navigate(`/${encodeURIComponent(name)}/verification`, { state: { bgColor: color } });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-5xl px-6 py-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-gray-900">Choose a Service</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl px-6">
        {cardData.map((card) => (
          <div
            key={card.name}
            className={`cursor-pointer rounded-xl shadow-lg flex flex-col items-center justify-between text-white text-xl font-semibold transition-transform hover:scale-105 ${card.color}`}
            style={{ minHeight: 200, padding: 0 }}
            onClick={() => handleCardClick(card.name,card.color)}
          >
            <div className="w-full flex justify-center items-center bg-white rounded-t-xl" style={{ height: 110 }}>
              <img src={card.img} alt={card.name} className="h-16 w-16 object-contain" />
            </div>
            <div className="w-full flex items-center justify-center py-6 rounded-b-xl">
              <span className="text-xl font-bold">{card.name}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Footer removed per request (no WhatsApp/Telegram buttons) */}
    </div>
  );
};

export default Cards;


