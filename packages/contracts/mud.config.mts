import { mudConfig } from "@latticexyz/cli";

export default mudConfig({
  deploysDirectory: "./deploys",
  enums: {
    MonsterType: ["None", "Eagle", "Rat", "Caterpillar"],
    TerrainType: ["None", "TallGrass", "Boulder"],
  },
  tables: {
    Counter: "uint256",
    Encounter: {
      dataStruct: false,
      primaryKeys: {
        player: "bytes32",
      },
      schema: {
        actionCount: "uint256",
        monsters: "bytes32[]",
      },
    },
    EncounterTrigger: "bool",
    Encounterable: "bool",
    Health: "uint32",
    MapConfig: {
      primaryKeys: {},
      dataStruct: false,
      schema: {
        width: "uint32",
        height: "uint32",
        terrain: "bytes",
      },
    },
    Monster: "MonsterType",
    Event: "string",
    Movable: "bool",
    Obstruction: "bool",
    OwnedBy: "bytes32",
    Player: "bool",
    Position: {
      dataStruct: false,
      schema: {
        x: "uint32",
        y: "uint32",
      },
    },
    Strength: "uint32",
  },
  // modules: [
  //   {
  //     name: "KeysWithValueModule",
  //     root: true,
  //     args: [resolveTableId("CounterTable")],
  //   },
  // ],
});
