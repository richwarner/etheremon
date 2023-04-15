import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useEffect } from "react";

export function PlayerBar() {
  const {
    components: { Health, Strength },
    playerEntity,
  } = useMUD();

  const currentPlayer = playerEntity;

  const playerHealth = useComponentValue(Health, currentPlayer);
  const playerStrength = useComponentValue(Strength, currentPlayer);

  console.log("playerHealth", playerHealth);
  console.log("playerStrength", playerStrength);

  if (!currentPlayer) return <></>;
  if (!playerHealth) return <></>;
  if (!playerStrength) return <></>;

  return (
    <div className="absolute bottom-0 left-0 h-[150px] w-screen bg-slate-400/40 flex flex-row items-center justify-center p-8 rounded-lg">
      <div>
        <div className="w-40 px-4 h-8 bg-red-600 rounded-lg mb-4 flex flex-row items-center justify-center">
          <div className="text-center text-white">{playerHealth.value} HP</div>
        </div>

        <div className="w-40 h-8 bg-green-600 rounded-lg mb-4 flex flex-row items-center justify-center">
          <div className="text-center text-white">{playerStrength.value} STR</div>
        </div>
      </div>
    </div>
  );
}
