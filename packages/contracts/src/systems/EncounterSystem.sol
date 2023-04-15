// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { Player } from "../tables/Player.sol";
import { Encounter } from "../tables/Encounter.sol";
import { OwnedBy } from "../tables/OwnedBy.sol";
import { Monster } from "../tables/Monster.sol";
import { Health } from "../tables/Health.sol";
import { Strength } from "../tables/Strength.sol";
import { addressToEntityKey } from "../addressToEntityKey.sol";

contract EncounterSystem is System {
  uint256 internal entropyNonce = 0;

  function throwBall() public {
    bytes32 player = addressToEntityKey(_msgSender());

    (uint256 actionCount, bytes32[] memory monsters) = Encounter.get(player);
    require(actionCount != 0, "not in this encounter");

    // TODO: support multiple monsters? i.e. throw at a specific monster
    bytes32 monster = monsters[0];

    uint256 rand = uint256(keccak256(abi.encode(player, monster, actionCount, block.difficulty)));
    if (rand % 2 == 0) {
      // 50% chance to catch monster
      OwnedBy.set(monster, player);
      Encounter.deleteRecord(player);
    } else if (actionCount > 2) {
      // Missed 2 times, monster escapes
      Encounter.deleteRecord(player);
      Monster.deleteRecord(monster);
    } else {
      // Throw missed!
      Encounter.setActionCount(player, ++actionCount);
    }
  }

  function flee() public {
    bytes32 player = addressToEntityKey(_msgSender());
    Encounter.deleteRecord(player);
  }

  function monsterFlee() public {
    bytes32 player = addressToEntityKey(_msgSender());
    Encounter.deleteRecord(player);
  }

  function attack() public {
    bytes32 player = addressToEntityKey(_msgSender());
    (uint256 actionCount, bytes32[] memory monsters) = Encounter.get(player);
    bytes32 monster = monsters[0];

    uint32 playerDamage = Strength.get(player);
    uint32 monsterHealth = Health.get(monster);

    if (playerDamage >= monsterHealth) {
      // Player killed monster
      Health.set(monster, 0);
      Monster.deleteRecord(monster);
      Encounter.deleteRecord(player);

      Strength.set(player, playerDamage + 1);
    } else {
      Health.set(monster, monsterHealth - playerDamage);
      monsterAction();
    }

    Health.set(monster, monsterHealth - playerDamage);
  }

  function monsterAttack() public {
    bytes32 player = addressToEntityKey(_msgSender());
    (uint256 actionCount, bytes32[] memory monsters) = Encounter.get(player);
    bytes32 monster = monsters[0];

    uint32 monsterDamage = Strength.get(monster);
    uint32 playerHealth = Health.get(player);

    if (monsterDamage >= playerHealth) {
      // Monster killed player
      Health.set(player, 0);
      Player.deleteRecord(player);
      Encounter.deleteRecord(player);
    } else {
      Health.set(player, playerHealth - monsterDamage);
    }
  }

  function heal() public {
    bytes32 player = addressToEntityKey(_msgSender());
    (uint256 actionCount, bytes32[] memory monsters) = Encounter.get(player);

    uint32 playerHealth = Health.get(player);
    uint32 newPlayerHealth = playerHealth + 10;
    if (newPlayerHealth > 100) {
      newPlayerHealth = 100;
    }
    Health.set(player, newPlayerHealth);
    monsterAction();
  }

  function monsterHeal() public {
    bytes32 player = addressToEntityKey(_msgSender());
    (uint256 actionCount, bytes32[] memory monsters) = Encounter.get(player);
    bytes32 monster = monsters[0];

    uint32 monsterHealth = Health.get(monster);
    uint32 newMonsterHealth = monsterHealth + 10;
    if (newMonsterHealth > 100) {
      newMonsterHealth = 100;
    }
    Health.set(monster, newMonsterHealth);
  }

  function monsterAction() public {
    bytes32 player = addressToEntityKey(_msgSender());
    (uint256 actionCount, bytes32[] memory monsters) = Encounter.get(player);
    bytes32 monster = monsters[0];
    uint256 rand = uint256(keccak256(abi.encode(player, monster, actionCount, block.difficulty, entropyNonce++)));
    if (rand % 3 == 0) {
      monsterHeal();
    } else if (rand % 3 == 0) {
      monsterAttack();
    } else {
      monsterFlee();
    }
  }
}
