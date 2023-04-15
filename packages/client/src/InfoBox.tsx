import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useEffect } from "react";

export function InfoBox({
  message,
  monster,
}: {
  message: string;
  monster: string;
}) {
  //Get message back
  return (
    <div className="bg-slate-500 rounded-lg px-10 py-5">
      <div>
        <div className="text-center text-white">
          {monster} {message}
        </div>
      </div>
    </div>
  );
}
