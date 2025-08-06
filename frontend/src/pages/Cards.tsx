import React from "react";
import { useNavigate } from "react-router-dom";

const cardData = [
  { name: "Netflix", color: "bg-red-700" },
  { name: "Crunchyroll", color: "bg-orange-600" },
  { name: "You Premium", color: "bg-red-600" },
  { name: "Prime", color: "bg-sky-500" },
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
            className={`cursor-pointer rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-white text-xl font-semibold transition-transform hover:scale-105 ${card.color}`}
            onClick={() => handleCardClick(card.color)}
          >
            {card.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;


