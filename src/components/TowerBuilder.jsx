import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TowerBuilder = () => {
  const [count, setCount] = useState(0);

  // Fetch count from Google Sheets
  useEffect(() => {
  const fetchCount = async () => {
    try {
      const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSMrXCHJJG4a-iQ2tXnl2_cE1SH4hoGXPY6CcxlqEotK7aOhW2uHObrHMAuXdS6qmNwnfezDElXW3DC/pubhtml?gid=1454092095&single=true");
      const html = await response.text();
      console.log(html)
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find the table cells
      const cells = doc.querySelectorAll("td");

      // Find your specific cell
      // (For now: pick last cell, or adjust as needed)
      const lastCell = cells[cells.length - 1].textContent.trim();
      const value = parseInt(lastCell);

      console.log("Fetched count:", value);
      setCount(value);
    } catch (err) {
      console.error("Failed to fetch count:", err);
    }
  };

    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);


  if (count === null) {
    return <div className="text-white text-xl">Loading...</div>;
  }

  const atmosphereLayers = [
    { color: "bg-blue-200", label: "Troposphere" },
    { color: "bg-blue-300", label: "Stratosphere" },
    { color: "bg-blue-500", label: "Mesosphere" },
    { color: "bg-blue-700", label: "Thermosphere" },
    { color: "bg-blue-900", label: "Exosphere" },
    { color: "bg-indigo-900", label: "Edge of Space" },
    { color: "bg-black", label: "Deep Space" }
  ];

  const blocksPerTier = 5;
  const totalBaseLayers = atmosphereLayers.length;

  const preemptiveOffset = 1;
  const layersUnlocked = Math.ceil((count + preemptiveOffset) / blocksPerTier);

  const blackLayersNeeded = Math.max(layersUnlocked - totalBaseLayers, 0);

  const baseLayers = atmosphereLayers.slice(0, Math.min(layersUnlocked, totalBaseLayers));
  const blackLayers = Array(blackLayersNeeded).fill({ color: "bg-black", label: "" });

  const activeLayers = [...baseLayers, ...blackLayers];

  const groundHeight = 24 * 4;
  const fullScreenHeight = window.innerHeight;
  const towerHeight = fullScreenHeight - groundHeight;

  const totalLayers = activeLayers.length;
  const layerHeight = towerHeight / totalLayers;
  const marginPerBrick = 2;
  const brickHeight = (layerHeight - (blocksPerTier * marginPerBrick)) / blocksPerTier;

  const baseWidth = 120;
  const baseHeight = 40;
  const heightScale = Math.min(1, brickHeight / baseHeight);
  const blockWidth = baseWidth * heightScale;

  const ratios = Array(totalLayers).fill(1 / totalLayers);

  return (
    <div className="w-screen h-screen relative flex flex-col justify-end items-center overflow-hidden">

      {/* Datasets Saved Label */}
      <div className="absolute top-4 left-40 bg-yellow-300 text-black px-4 py-2 rounded shadow text-lg font-bold z-20">
        Datasets Saved: {count}
      </div>

      {/* Atmosphere layers with left-aligned labels */}
      <div className="absolute w-full" style={{ height: towerHeight, bottom: groundHeight }}>
        <div className="flex flex-col h-full z-[-10]">
          {ratios.map((ratio, i) => (
            <div
              key={i}
              className={`${activeLayers[totalLayers - 1 - i].color} w-full relative`}
              style={{ flex: ratio }}
            >
              {activeLayers[totalLayers - 1 - i].label && (
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-sm font-bold drop-shadow">
                  {activeLayers[totalLayers - 1 - i].label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full" style={{ height: groundHeight }}>
        <div className="w-full h-full bg-green-700 z-0"></div>
      </div>

      {/* Tower and Flags */}
      <div className="absolute flex justify-center items-end w-full" style={{ height: towerHeight, bottom: groundHeight }}>

        {/* Flags */}
        {[...Array(totalLayers)].map((_, i) => {
          const fromBottom = (i + 1) * layerHeight;
          const labelCount = (i + 1) * blocksPerTier;
          const badgeIndex = i + 1;

          return (
            <div
              key={`flag-${i}`}
              className="absolute left-[calc(50%+70px)] bg-yellow-300 text-black px-2 py-1 text-xs rounded shadow flex items-center space-x-1"
              style={{ bottom: fromBottom }}
            >
              {badgeIndex <= 12 && (
                <img
                  src={`/img/badge_${badgeIndex}.png`}
                  alt={`Badge ${badgeIndex}`}
                  className="w-20 h-20"
                />
              )}
              <span>{labelCount}</span>
            </div>
          );
        })}

        {/* Tower */}
        <div className="flex flex-col-reverse items-center">
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              style={{
                width: blockWidth,
                height: brickHeight,
                marginBottom: `${marginPerBrick}px`
              }}
              className="border border-black bg-red-400 rounded-sm shadow"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TowerBuilder;
