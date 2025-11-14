const fs = require('fs');
const path = require('path');

// This creates 5 VISUALLY DISTINCT rooms using only existing sprites

const template = {
  "spawnpoint": {
    "roomIndex": 0,
    "x": 7,
    "y": 8
  },
  "rooms": [
    {
      "name": "Lobby - Main Entrance",
      "tilemap": {
        // Lobby - LIGHT FLOORS, minimal furniture, fountain centerpiece
        ...generateRoom(15, 11, "city:light_concrete", {
          "7, 5": { "object": "village:big_fountain" }, // Centerpiece fountain
          "7, 6": {  },
          "8, 5": {  },
          "8, 6": {  },
          "2, 8": { "object": "village:bench_left_top" },
          "3, 8": { "object": "village:bench_right_top" },
          "11, 8": { "object": "village:bench_left_top" },
          "12, 8": { "object": "village:bench_right_top" },
          "7, 10": { "teleporter": { "roomIndex": 1, "x": 10, "y": 2 } }
        })
      }
    },
    {
      "name": "Open Office - Work Area",
      "tilemap": {
        // DARK FLOORS, many desks in rows
        ...generateRoom(20, 14, "city:dark_concrete", {
          // Desk rows - Left side
          "2, 2": { "object": "village:chair_down" },
          "2, 3": { "object": "village:table" },
          "2, 4": { "object": "village:chair_up" },
          
          "5, 2": { "object": "village:chair_down" },
          "5, 3": { "object": "village:table" },
          "5, 4": { "object": "village:chair_up" },
          
          "8, 2": { "object": "village:chair_down" },
          "8, 3": { "object": "village:table" },
          "8, 4": { "object": "village:chair_up" },
          
          // Desk rows - Right side
          "11, 2": { "object": "village:chair_down" },
          "11, 3": { "object": "village:table" },
          "11, 4": { "object": "village:chair_up" },
          
          "14, 2": { "object": "village:chair_down" },
          "14, 3": { "object": "village:table" },
          "14, 4": { "object": "village:chair_up" },
          
          "17, 2": { "object": "village:chair_down" },
          "17, 3": { "object": "village:table" },
          "17, 4": { "object": "village:chair_up" },
          
          // Second row
          "2, 7": { "object": "village:chair_down" },
          "2, 8": { "object": "village:table" },
          "2, 9": { "object": "village:chair_up" },
          
          "5, 7": { "object": "village:chair_down" },
          "5, 8": { "object": "village:table" },
          "5, 9": { "object": "village:chair_up" },
          
          "8, 7": { "object": "village:chair_down" },
          "8, 8": { "object": "village:table" },
          "8, 9": { "object": "village:chair_up" },
          
          "11, 7": { "object": "village:chair_down" },
          "11, 8": { "object": "village:table" },
          "11, 9": { "object": "village:chair_up" },
          
          "14, 7": { "object": "village:chair_down" },
          "14, 8": { "object": "village:table" },
          "14, 9": { "object": "village:chair_up" },
          
          "17, 7": { "object": "village:chair_down" },
          "17, 8": { "object": "village:table" },
          "17, 9": { "object": "village:chair_up" },
          
          "10, 2": { "teleporter": { "roomIndex": 0, "x": 7, "y": 10 } },
          "10, 12": { "teleporter": { "roomIndex": 2, "x": 8, "y": 2 } }
        })
      }
    },
    {
      "name": "Conference Hall",
      "tilemap": {
        // STONE TILES floor, ONE BIG central table
        ...generateRoom(17, 12, "village:dark_stone_tile_1", {
          // Long conference table
          "5, 5": { "object": "village:chair_left" },
          "6, 5": { "object": "village:table" },
          "7, 5": { "object": "village:table" },
          "8, 5": { "object": "village:table" },
          "9, 5": { "object": "village:table" },
          "10, 5": { "object": "village:table" },
          "11, 5": { "object": "village:chair_right" },
          
          "5, 6": { "object": "village:chair_left" },
          "6, 6": { "object": "village:table" },
          "7, 6": { "object": "village:table" },
          "8, 6": { "object": "village:table" },
          "9, 6": { "object": "village:table" },
          "10, 6": { "object": "village:table" },
          "11, 6": { "object": "village:chair_right" },
          
          // Chairs around table
          "6, 4": { "object": "village:chair_down" },
          "7, 4": { "object": "village:chair_down" },
          "8, 4": { "object": "village:chair_down" },
          "9, 4": { "object": "village:chair_down" },
          "10, 4": { "object": "village:chair_down" },
          
          "6, 7": { "object": "village:chair_up" },
          "7, 7": { "object": "village:chair_up" },
          "8, 7": { "object": "village:chair_up" },
          "9, 7": { "object": "village:chair_up" },
          "10, 7": { "object": "village:chair_up" },
          
          "8, 2": { "teleporter": { "roomIndex": 1, "x": 10, "y": 12 } },
          "8, 10": { "teleporter": { "roomIndex": 3, "x": 10, "y": 2 } }
        })
      }
    },
    {
      "name": "Break Room - Lounge",
      "tilemap": {
        // MIX of stone tiles, benches scattered, crates
        ...generateRoom(16, 11, "village:light_stone_tile_2", {
          // Lounge benches
          "3, 3": { "object": "village:bench_left_top" },
          "4, 3": { "object": "village:bench_right_top" },
          "3, 4": { "object": "village:bench_left_bottom" },
          "4, 4": { "object": "village:bench_right_bottom" },
          
          "11, 3": { "object": "village:bench_left_top" },
          "12, 3": { "object": "village:bench_right_top" },
          "11, 4": { "object": "village:bench_left_bottom" },
          "12, 4": { "object": "village:bench_right_bottom" },
          
          "3, 7": { "object": "village:bench_left_top" },
          "4, 7": { "object": "village:bench_right_top" },
          "3, 8": { "object": "village:bench_left_bottom" },
          "4, 8": { "object": "village:bench_right_bottom" },
          
          "11, 7": { "object": "village:bench_left_top" },
          "12, 7": { "object": "village:bench_right_top" },
          "11, 8": { "object": "village:bench_left_bottom" },
          "12, 8": { "object": "village:bench_right_bottom" },
          
          // Coffee area
          "7, 4": { "object": "village:table" },
          "8, 4": { "object": "village:table" },
          "7, 5": { "object": "village:crate" },
          "8, 5": { "object": "village:crate" },
          
          "10, 2": { "teleporter": { "roomIndex": 2, "x": 8, "y": 10 } },
          "10, 9": { "teleporter": { "roomIndex": 4, "x": 7, "y": 2 } }
        })
      }
    },
    {
      "name": "Storage - Back Room",
      "tilemap": {
        // GRASS FLOOR, lots of crates and boxes
        ...generateRoom(14, 10, "ground:normal_solid_grass", {
          "2, 2": { "object": "village:crate" },
          "3, 2": { "object": "village:crate" },
          "2, 3": { "object": "village:box" },
          "3, 3": { "object": "village:empty_box" },
          
          "10, 2": { "object": "village:three_boxes" },
          "11, 2": {  },
          "10, 3": {  },
          "11, 3": {  },
          
          "2, 6": { "object": "village:small_crate" },
          "3, 6": { "object": "village:small_crate" },
          "4, 6": { "object": "village:small_empty_box" },
          
          "10, 6": { "object": "village:crate" },
          "11, 6": { "object": "village:crate" },
          "10, 7": { "object": "village:box" },
          "11, 7": { "object": "village:box" },
          
          "6, 4": { "object": "village:filled_water_trough" },
          "7, 4": {  },
          
          "7, 2": { "teleporter": { "roomIndex": 3, "x": 10, "y": 9 } }
        })
      }
    }
  ]
};

function generateRoom(width, height, floorType, customTiles = {}) {
  const tilemap = {};
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = `${x}, ${y}`;
      
      // Walls on edges
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        tilemap[key] = {
          "floor": floorType,
          "object": "city:dark_bricks_v"
        };
      } else {
        tilemap[key] = { "floor": floorType };
      }
    }
  }
  
  // Apply custom tiles
  for (const [key, value] of Object.entries(customTiles)) {
    if (tilemap[key]) {
      tilemap[key] = { ...tilemap[key], ...value };
    }
  }
  
  return tilemap;
}

// Write to file
const outputPath = path.join(__dirname, '../../../frontend/utils/defaultOfficeTemplate.json');
fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
console.log('✅ Created DISTINCT room template!');
console.log('Now run: npx ts-node src/scripts/updateRealmsToOfficeTemplate.ts');
