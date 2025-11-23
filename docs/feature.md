# Byte In: Corrupted Grove Dungeon Mode - Design Document

This document outlines the design for the new dungeon mode in the "Byte In" mobile game.

## 1. Overview
**Concept:** A new game mode where players take their collected pets into a corrupted forest dungeon to battle junk-food-themed monsters.
**Core Loop:** Players progress through a linear map of 10 thematic levels. Each level is a battle. Scanned food from the main game is used as a resource to power up pets during combat.
**Theme:** "The Corrupted Grove." The dungeon starts at the player's cozy treehouse and descends into an increasingly sickly, corrupted forest.

## 2. Dungeon Map: "The Corrupted Grove"
* **Visuals:** A vertical map in a charming pixel-art style.
* **Progression:** A winding path made of wooden planks and roots, starting clean and getting more gnarled and corrupted as it descends.
* **Levels:** 10 distinct, food-themed zones, each represented by a pixelated icon:
    1.  Gummy Root Systems (Gummy Bear)
    2.  Greasy Swamp (Slimy Burger)
    3.  Salt Crystal Caves (Jagged Crystal)
    4.  Soda Stream (Bubbling Can)
    5.  Moldy Pantry (Rotting Box)
    6.  Deep Fryer Volcano (Erupting Fryer)
    7.  Frozen Wasteland (Icy Monster)
    8.  Stale Plains (Cracked Earth)
    9.  Artificial Flavor Factory (Toxic Pipe)
    10. **Boss:** The Heart of the Tree (Menacing Monster Mouth)

## 3. Battle System: "Macro Masters" (RPG Style)
* **Format:** Turn-based, cinematic RPG battle, similar to Pokémon.
* **Combatants:**
    * **Player:** A team of up to 3 pets. One "Active Pet" is on the field at a time.
    * **Enemy:** A single, powerful Boss Monster with a massive HP bar and unique status effects (e.g., "Fiber-Bound").
* **Pet Roles:** Pets are the primary fighters, each with unique stats and skills.
    * **Food Types:** Pets have types like Leaf, Fruit, Grain, and Protein, determining combat effectiveness.

## 4. Food Mechanics: The "Lunchbox"
Instead of food cards, the player uses a "Lunchbox" side-deck in battle. This can be implemented using one or a combination of the following approaches:

* **A. The Snack Pot (Alchemy):** Scanned food is broken down into raw "Essence" (Protein, Carbs, Fiber, Fats). In battle, the player drags essence into a pot to brew temporary buff potions for their pet.
* **B. Food Archetypes (Simplified Tokens):** Every scan is categorized into one of 5 basic icons (Meaty Bone, Leafy Green, Toast Slice, Avocado Half, Glazed Donut). The player plays these tokens to grant immediate, specific buffs.
* **C. Terrain Transformation:** Using a meal changes the battlefield's background art and rules for 3 turns (e.g., "Fiber Field" grants HP regeneration to friendly pets).

## 5. Pet Roster
* **Collectible Pets:** A variety of food-animal hybrids, such as:
    * Mimi (The Cat Mascot)
    * Coconut Capybara
    * Lemon Shark
    * Musubee (Sushi Bee)
    * Hedgehog Dragonfruit
    * Bunny Mochi
    * Cotton Candy Sheep

## 6. User Interface (UI)
* **Art Style:** All UI elements will follow the cozy, hand-drawn, and later pixel-art style.
* **HUD:**
    * **Top:** Boss name, HP bar, and status effects.
    * **Bottom:** Active Pet name, HP bar, and a "Lunchbox" button to open the food menu.
* **Battle Menu:** Large, clear buttons for "FIGHT," "FEED" (opens Lunchbox), "SWAP PET," and "FLEE."

## 7. Future Considerations
* **Pet Evolution:** Pets could evolve into stronger forms after reaching a certain level or being fed specific foods.
* **Co-op Mode:** Players could team up with friends to take down super-bosses.
* **Weekly Challenges:** Rotating dungeons with unique rules and rewards.