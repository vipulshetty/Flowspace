// Script to generate a modern office template with proper collisions and distinct rooms
const fs = require('fs');
const path = require('path');

function createModernOfficeTemplate() {
    const template = {
        spawnpoint: {
            roomIndex: 0,
            x: 7,
            y: 8
        },
        rooms: [
            // Room 0: Modern Reception/Lobby
            {
                name: "Reception Lobby",
                tilemap: createReception()
            },
            // Room 1: Open Office Space
            {
                name: "Open Office",
                tilemap: createOpenOffice()
            },
            // Room 2: Meeting Room
            {
                name: "Meeting Room",
                tilemap: createMeetingRoom()
            },
            // Room 3: Break Room
            {
                name: "Break Room",
                tilemap: createBreakRoom()
            },
            // Room 4: Private Offices
            {
                name: "Executive Offices",
                tilemap: createPrivateOffices()
            }
        ]
    };

    return template;
}

function createReception() {
    const tilemap = {};
    const width = 15;
    const height = 12;

    // Create bordered room with modern walls
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const key = `${x}, ${y}`;
            const isWall = x === 0 || x === width - 1 || y === 0 || y === height - 1;
            
            if (isWall) {
                // Walls with collision
                tilemap[key] = {
                    floor: 'modern:tile_floor_grey',
                    object: 'modern:wall_grey'
                };
            } else {
                // Interior floor
                tilemap[key] = {
                    floor: 'modern:tile_floor_grey'
                };
            }
        }
    }

    // Add reception desk
    tilemap['7, 3'] = { floor: 'modern:tile_floor_grey', object: 'modern:desk_left' };
    tilemap['8, 3'] = { floor: 'modern:tile_floor_grey', object: 'modern:desk_right' };
    
    // Add monitors on desk
    tilemap['7, 3'] = { floor: 'modern:tile_floor_grey', object: 'modern:desk_left', above_floor: 'modern:monitor_on' };
    tilemap['8, 3'] = { floor: 'modern:tile_floor_grey', object: 'modern:desk_right', above_floor: 'modern:laptop_open' };

    // Add plants for decoration
    tilemap['2, 2'] = { floor: 'modern:tile_floor_grey', object: 'modern:plant_large' };
    tilemap['12, 2'] = { floor: 'modern:tile_floor_grey', object: 'modern:plant_large' };
    
    // Waiting area chairs
    tilemap['3, 8'] = { floor: 'modern:tile_floor_grey', above_floor: 'modern:chair_right' };
    tilemap['4, 8'] = { floor: 'modern:tile_floor_grey', object: 'modern:coffee_table' };
    tilemap['5, 8'] = { floor: 'modern:tile_floor_grey', above_floor: 'modern:chair_left' };

    // Door/teleport to open office
    tilemap['7, 11'] = { 
        floor: 'modern:tile_floor_grey',
        teleporter: { roomIndex: 1, x: 7, y: 1 }
    };

    return tilemap;
}

function createOpenOffice() {
    const tilemap = {};
    const width = 20;
    const height = 15;

    // Create bordered room
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const key = `${x}, ${y}`;
            const isWall = x === 0 || x === width - 1 || y === 0 || y === height - 1;
            
            if (isWall) {
                tilemap[key] = {
                    floor: 'modern:wood_floor_light',
                    object: 'modern:wall_white'
                };
            } else {
                tilemap[key] = {
                    floor: 'modern:wood_floor_light'
                };
            }
        }
    }

    // Add desk clusters (4 desks per cluster)
    // Cluster 1 (top-left)
    addDeskSetup(tilemap, 3, 3, 'modern:wood_floor_light');
    addDeskSetup(tilemap, 6, 3, 'modern:wood_floor_light');
    
    // Cluster 2 (top-right)
    addDeskSetup(tilemap, 13, 3, 'modern:wood_floor_light');
    addDeskSetup(tilemap, 16, 3, 'modern:wood_floor_light');
    
    // Cluster 3 (bottom-left)
    addDeskSetup(tilemap, 3, 10, 'modern:wood_floor_light');
    addDeskSetup(tilemap, 6, 10, 'modern:wood_floor_light');
    
    // Cluster 4 (bottom-right)
    addDeskSetup(tilemap, 13, 10, 'modern:wood_floor_light');
    addDeskSetup(tilemap, 16, 10, 'modern:wood_floor_light');

    // Add plants between desk clusters
    tilemap['10, 5'] = { floor: 'modern:wood_floor_light', object: 'modern:plant_medium' };
    tilemap['10, 9'] = { floor: 'modern:wood_floor_light', object: 'modern:plant_medium' };

    // Teleport back to reception
    tilemap['7, 0'] = { 
        floor: 'modern:wood_floor_light',
        teleporter: { roomIndex: 0, x: 7, y: 10 }
    };

    // Teleport to meeting room
    tilemap['19, 7'] = { 
        floor: 'modern:wood_floor_light',
        teleporter: { roomIndex: 2, x: 1, y: 7 }
    };

    return tilemap;
}

function createMeetingRoom() {
    const tilemap = {};
    const width = 18;
    const height = 12;

    // Create bordered room with blue carpet
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const key = `${x}, ${y}`;
            const isWall = x === 0 || x === width - 1 || y === 0 || y === height - 1;
            
            if (isWall) {
                tilemap[key] = {
                    floor: 'modern:carpet_blue',
                    object: 'modern:wall_blue'
                };
            } else {
                tilemap[key] = {
                    floor: 'modern:carpet_blue'
                };
            }
        }
    }

    // Large meeting table in center
    for (let x = 6; x <= 11; x++) {
        for (let y = 4; y <= 7; y++) {
            tilemap[`${x}, ${y}`] = {
                floor: 'modern:carpet_blue',
                object: 'modern:meeting_table'
            };
        }
    }

    // Chairs around table
    // Top chairs
    for (let x = 6; x <= 11; x++) {
        tilemap[`${x}, 3`] = { floor: 'modern:carpet_blue', above_floor: 'modern:chair_down' };
    }
    // Bottom chairs
    for (let x = 6; x <= 11; x++) {
        tilemap[`${x}, 8`] = { floor: 'modern:carpet_blue', above_floor: 'modern:chair_up' };
    }
    // Left chairs
    tilemap['5, 5'] = { floor: 'modern:carpet_blue', above_floor: 'modern:chair_right' };
    tilemap['5, 6'] = { floor: 'modern:carpet_blue', above_floor: 'modern:chair_right' };
    // Right chairs
    tilemap['12, 5'] = { floor: 'modern:carpet_blue', above_floor: 'modern:chair_left' };
    tilemap['12, 6'] = { floor: 'modern:carpet_blue', above_floor: 'modern:chair_left' };

    // Whiteboard on wall
    tilemap['9, 1'] = { floor: 'modern:carpet_blue', above_floor: 'modern:whiteboard' };

    // Plants in corners
    tilemap['2, 2'] = { floor: 'modern:carpet_blue', object: 'modern:plant_large' };
    tilemap['15, 2'] = { floor: 'modern:carpet_blue', object: 'modern:plant_large' };

    // Teleport back to open office
    tilemap['0, 7'] = { 
        floor: 'modern:carpet_blue',
        teleporter: { roomIndex: 1, x: 18, y: 7 }
    };

    // Teleport to break room
    tilemap['9, 11'] = { 
        floor: 'modern:carpet_blue',
        teleporter: { roomIndex: 3, x: 9, y: 1 }
    };

    return tilemap;
}

function createBreakRoom() {
    const tilemap = {};
    const width = 16;
    const height = 14;

    // Create bordered room with warm tiles
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const key = `${x}, ${y}`;
            const isWall = x === 0 || x === width - 1 || y === 0 || y === height - 1;
            
            if (isWall) {
                tilemap[key] = {
                    floor: 'modern:tile_floor_white',
                    object: 'modern:wall_beige'
                };
            } else {
                tilemap[key] = {
                    floor: 'modern:tile_floor_white'
                };
            }
        }
    }

    // Kitchen area (top-left)
    tilemap['2, 2'] = { floor: 'modern:tile_floor_white', object: 'modern:coffee_machine' };
    tilemap['3, 2'] = { floor: 'modern:tile_floor_white', object: 'modern:water_cooler' };
    tilemap['4, 2'] = { floor: 'modern:tile_floor_white', object: 'modern:coffee_table' };

    // Seating area 1
    tilemap['7, 5'] = { floor: 'modern:tile_floor_white', object: 'modern:round_table' };
    tilemap['6, 5'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_right' };
    tilemap['8, 5'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_left' };
    tilemap['7, 4'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_down' };
    tilemap['7, 6'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_up' };

    // Seating area 2
    tilemap['11, 5'] = { floor: 'modern:tile_floor_white', object: 'modern:round_table' };
    tilemap['10, 5'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_right' };
    tilemap['12, 5'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_left' };
    tilemap['11, 4'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_down' };
    tilemap['11, 6'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_up' };

    // Relaxation area (bottom)
    tilemap['6, 10'] = { floor: 'modern:tile_floor_white', object: 'modern:coffee_table' };
    tilemap['5, 10'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_right' };
    tilemap['7, 10'] = { floor: 'modern:tile_floor_white', above_floor: 'modern:chair_left' };
    tilemap['10, 10'] = { floor: 'modern:tile_floor_white', object: 'modern:plant_medium' };

    // Teleport back to meeting room
    tilemap['9, 0'] = { 
        floor: 'modern:tile_floor_white',
        teleporter: { roomIndex: 2, x: 9, y: 10 }
    };

    // Teleport to executive offices
    tilemap['15, 7'] = { 
        floor: 'modern:tile_floor_white',
        teleporter: { roomIndex: 4, x: 1, y: 7 }
    };

    return tilemap;
}

function createPrivateOffices() {
    const tilemap = {};
    const width = 18;
    const height = 14;

    // Create bordered room with dark wood floor
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const key = `${x}, ${y}`;
            const isWall = x === 0 || x === width - 1 || y === 0 || y === height - 1;
            
            if (isWall) {
                tilemap[key] = {
                    floor: 'modern:wood_floor_dark',
                    object: 'modern:wall_wood'
                };
            } else {
                tilemap[key] = {
                    floor: 'modern:wood_floor_dark'
                };
            }
        }
    }

    // Office 1 (top-left corner)
    addExecutiveDesk(tilemap, 3, 3, 'modern:wood_floor_dark');
    tilemap['5, 3'] = { floor: 'modern:wood_floor_dark', object: 'modern:bookshelf' };
    tilemap['2, 5'] = { floor: 'modern:wood_floor_dark', object: 'modern:plant_medium' };

    // Office 2 (top-right corner)
    addExecutiveDesk(tilemap, 13, 3, 'modern:wood_floor_dark');
    tilemap['15, 3'] = { floor: 'modern:wood_floor_dark', object: 'modern:filing_cabinet' };
    tilemap['12, 5'] = { floor: 'modern:wood_floor_dark', object: 'modern:plant_large' };

    // Office 3 (bottom-left corner)
    addExecutiveDesk(tilemap, 3, 9, 'modern:wood_floor_dark');
    tilemap['5, 9'] = { floor: 'modern:wood_floor_dark', object: 'modern:bookshelf' };
    tilemap['2, 11'] = { floor: 'modern:wood_floor_dark', object: 'modern:plant_medium' };

    // Office 4 (bottom-right corner)
    addExecutiveDesk(tilemap, 13, 9, 'modern:wood_floor_dark');
    tilemap['15, 9'] = { floor: 'modern:wood_floor_dark', object: 'modern:printer' };
    tilemap['12, 11'] = { floor: 'modern:wood_floor_dark', object: 'modern:plant_large' };

    // Central seating area
    tilemap['9, 7'] = { floor: 'modern:wood_floor_dark', object: 'modern:coffee_table' };
    tilemap['8, 7'] = { floor: 'modern:wood_floor_dark', above_floor: 'modern:chair_right' };
    tilemap['10, 7'] = { floor: 'modern:wood_floor_dark', above_floor: 'modern:chair_left' };

    // Teleport back to break room
    tilemap['0, 7'] = { 
        floor: 'modern:wood_floor_dark',
        teleporter: { roomIndex: 3, x: 14, y: 7 }
    };

    // Teleport to reception (complete loop)
    tilemap['9, 13'] = { 
        floor: 'modern:wood_floor_dark',
        teleporter: { roomIndex: 0, x: 7, y: 1 }
    };

    return tilemap;
}

// Helper function to add a desk with monitor and chair
function addDeskSetup(tilemap, x, y, floorType) {
    tilemap[`${x}, ${y}`] = {
        floor: floorType,
        object: 'modern:desk_single'
    };
    tilemap[`${x}, ${y}`] = {
        floor: floorType,
        object: 'modern:desk_single',
        above_floor: 'modern:monitor_on'
    };
    tilemap[`${x}, ${y + 1}`] = {
        floor: floorType,
        above_floor: 'modern:office_chair'
    };
}

// Helper function for executive desk setup
function addExecutiveDesk(tilemap, x, y, floorType) {
    tilemap[`${x}, ${y}`] = {
        floor: floorType,
        object: 'modern:desk_left'
    };
    tilemap[`${x + 1}, ${y}`] = {
        floor: floorType,
        object: 'modern:desk_right'
    };
    tilemap[`${x}, ${y}`] = {
        floor: floorType,
        object: 'modern:desk_left',
        above_floor: 'modern:monitor_on'
    };
    tilemap[`${x + 1}, ${y}`] = {
        floor: floorType,
        object: 'modern:desk_right',
        above_floor: 'modern:laptop_open'
    };
    tilemap[`${x}, ${y + 1}`] = {
        floor: floorType,
        above_floor: 'modern:office_chair'
    };
}

// Generate and save the template
const template = createModernOfficeTemplate();
const outputPath = path.join(__dirname, '../../..', 'frontend', 'utils', 'defaultOfficeTemplate.json');

fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));

console.log('✅ Modern office template created successfully!');
console.log(`📁 Saved to: ${outputPath}`);
console.log('\n📊 Template statistics:');
console.log(`   - Rooms: ${template.rooms.length}`);
template.rooms.forEach((room, index) => {
    const tileCount = Object.keys(room.tilemap).length;
    console.log(`   - ${room.name}: ${tileCount} tiles`);
});
