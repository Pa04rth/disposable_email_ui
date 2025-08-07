import React from "react";
import { useNavigate } from "react-router-dom";

const cardData = [
  {
    name: "Netflix",
    color: "bg-red-700",
    img: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
  },
  {
    name: "Crunchyroll",
    color: "bg-orange-600",
    img: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Crunchyroll_logo_2018_vertical.png"
  },
  {
    name: "Youtube Premium",
    color: "bg-red-600",
    img: "https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png"
  },
  {
    name: "Prime",
    color: "bg-sky-500",
    img: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png"
  },
];

const Cards = () => {
  const navigate = useNavigate();


  const handleCardClick = (color: string) => {
    navigate("/verification", { state: { bgColor: color } });
  };

  return (
    <div className="p-8 min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Choose a Service</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
        {cardData.map((card) => (
          <div
            key={card.name}
            className={`cursor-pointer rounded-xl shadow-lg flex flex-col items-center justify-between text-white text-xl font-semibold transition-transform hover:scale-105 ${card.color}`}
            style={{ minHeight: 200, padding: 0 }}
            onClick={() => handleCardClick(card.color)}
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
    </div>
  );
};

export default Cards;


