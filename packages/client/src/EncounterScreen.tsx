import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import { EntityID, getComponentValueStrict, Has, HasValue } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { MonsterType, monsterTypes } from "./monsterTypes";
import { isDefined } from "@latticexyz/utils";

type Props = {
  monsterIds: string[];
};

//Get Attack function from API
export const EncounterScreen = ({ monsterIds }: Props) => {
  const {
    world,
    components: { Monster, Health, Strength },
    playerEntity,
    api: { throwBall, fleeEncounter, attack, heal },
  } = useMUD();

  // Just one monster for now
  const monster = monsterIds.map((m) => world.entityToIndex.get(m as EntityID)).filter(isDefined)[0];

  const monsterHealth = useComponentValue(Health, monster);
  const monsterStrength = useComponentValue(Strength, monster);
  const playerHealth = useComponentValue(Health, playerEntity);
  const playerStrength = useComponentValue(Strength, playerEntity);
  console.log("MonsterHealth: ", monsterHealth);
  console.log("MonsterStrength: ", monsterStrength);
  console.log("PlayerHealth: ", playerHealth);
  console.log("PlayerStrength: ", playerStrength);

  const monsterType = monsterTypes[useComponentValue(Monster, monster)?.value as MonsterType];

  // const monster = useEntityQuery([
  //   HasValue(Encounter, { value: encounterId }),
  //   Has(MonsterType),
  // ]).map((entity) => {
  //   const monsterType = getComponentValueStrict(MonsterType, entity)
  //     .value as MonsterType;
  //   return {
  //     entity,
  //     entityId: world.entities[entity],
  //     monster: monsterTypes[monsterType],
  //   };
  // })[0];

  // if (!monster) {
  //   throw new Error("No monster found in encounter");
  // }
  const doPlayerAction = async (actionNum) => {
    const monsterActionNum = await getMonsterAction();
    switch (actionNum) {
      case 1:
        attack(monsterActionNum);
        break;
      case 2:
        heal(monsterActionNum);
        break;
      case 3:
        fleeEncounter(monsterActionNum);
        break;
      default:
        console.log("Invalid action");
    }
  };

  const getMonsterAction = async () => {
    // Execute  Forward request
    // curl -X POST -H "Content-Type: application/json" -d '{"input_data": [[108, 108]], "input_shapes": [[2]], "output_data": [[-0.17382812, 0.52, 0]]}' http://0.0.0.0:3030/forward
    const rpcForwardParams = {
      input_data: [[playerHealth!.value, monsterHealth!.value]],
      input_shapes: [[2]],
      output_data: [[-0.17382812, 0.52, 0]],
    };

    const forwardOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcForwardParams),
    };
    console.log("stringifhed forwardOptions: ", JSON.stringify(rpcForwardParams));
    let forwardOutput = null;
    let action = 0;
    try {
      const forwardResponse = await fetch("http://localhost:4000/forward", forwardOptions);
      const forwardData = await forwardResponse.json();
      // console.log("forwardData: ", forwardData);
      forwardOutput = forwardData.output_data[0];
      if (forwardOutput[0] >= forwardOutput[1] && forwardOutput[0] >= forwardOutput[2]) {
        action = 1;
      } else if (forwardOutput[1] >= forwardOutput[0] && forwardOutput[1] >= forwardOutput[2]) {
        action = 2;
      } else {
        action = 3;
      }
    } catch (error) {
      console.error("Server error: ", error);
    }
    console.log("Server Forward response :", forwardOutput);
    console.log("Server Forward action :", action);
    return action;
  };

  const [appear, setAppear] = useState(false);
  useEffect(() => {
    setAppear(true);
  }, []);

  return (
    <div
      className={twMerge(
        "flex flex-col gap-10 items-center justify-center bg-black text-white transition-opacity duration-1000",
        appear ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="text-8xl animate-bounce">{monsterType.emoji}</div>
      <div>A wild {monsterType.name} appears 2122!</div>
      <div>Monster Health: {monsterHealth!.value}</div>
      <div>Monster Strength: {monsterStrength!.value}</div>

      <div className="flex gap-2">
        <button
          type="button"
          className="bg-stone-600 hover:ring rounded-lg px-4 py-2"
          onClick={async () => {
            const toastId = toast.loading("Throwing emojiball…");
            const status = await throwBall();
            if (status === "caught") {
              toast.update(toastId, {
                isLoading: false,
                type: "success",
                render: `You caught the ${monsterType.name}!`,
                autoClose: 5000,
                closeButton: true,
              });
            } else if (status === "fled") {
              toast.update(toastId, {
                isLoading: false,
                type: "error",
                render: `Oh no, the ${monsterType.name} fled!`,
                autoClose: 5000,
                closeButton: true,
              });
            } else {
              toast.update(toastId, {
                isLoading: false,
                type: "error",
                render: "You missed!",
                autoClose: 5000,
                closeButton: true,
              });
            }
          }}
        >
          ☄️ Throw
        </button>
        <button
          type="button"
          className="bg-stone-600 hover:ring rounded-lg px-4 py-2"
          onClick={async () => {
            await doPlayerAction(1);
          }}
        >
          ☄️ Attack
        </button>
        <button
          type="button"
          className="bg-stone-600 hover:ring rounded-lg px-4 py-2"
          onClick={async () => {
            await doPlayerAction(2);
          }}
        >
          ☄️ Heal
        </button>
        <button
          type="button"
          className="bg-stone-800 hover:ring rounded-lg px-4 py-2"
          onClick={async () => {
            const toastId = toast.loading("Running away…");
            await doPlayerAction(3);
            toast.update(toastId, {
              isLoading: false,
              type: "default",
              render: `You ran away!`,
              autoClose: 5000,
              closeButton: true,
            });
          }}
        >
          🏃‍♂️ Run
        </button>
        {/* <button
          type="button"
          className="bg-stone-600 hover:ring rounded-lg px-4 py-2"
          onClick={async () => {
            await getMonsterAction();
          }}
        >
          ☄️ Get Monster Action
        </button> */}
      </div>
    </div>
  );
};
