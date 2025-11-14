import { SpriteSheetTile } from './spritesheet'
import { SpriteSheetData } from './SpriteSheetData'

// SIMPLIFIED Modern Interior Spritesheet - FREE VERSION
// Using conservative sprite definitions that should work with the limited free tileset
// PNG location: /Modern tiles_Free/Interiors_free/32x32/Interiors_free_32x32.png

const tileSize = 32
const width = 512
const height = 512
const url = '/Modern tiles_Free/Interiors_free/32x32/Interiors_free_32x32.png'

// COMPREHENSIVE Modern Office Sprite Mapping
// Based on standard Modern Interiors tileset layout
const sprites: SpriteSheetTile[] = [
    // ============= FLOORS (Rows 0-3, cols 0-31) =============
    // Wood planks - horizontal
    { name: 'wood_h_1', x: 0, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_h_2', x: 32, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_h_3', x: 64, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_h_4', x: 96, y: 0, width: 32, height: 32, layer: 'floor' },
    // Wood planks - vertical
    { name: 'wood_v_1', x: 128, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_v_2', x: 160, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_v_3', x: 192, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_v_4', x: 224, y: 0, width: 32, height: 32, layer: 'floor' },
    
    // Carpet tiles
    { name: 'carpet_blue', x: 256, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'carpet_red', x: 288, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'carpet_green', x: 320, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'carpet_purple', x: 352, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'carpet_grey', x: 384, y: 0, width: 32, height: 32, layer: 'floor' },
    
    // Tiles - white/light
    { name: 'tile_white_1', x: 416, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'tile_white_2', x: 448, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'tile_beige_1', x: 480, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'tile_beige_2', x: 512, y: 0, width: 32, height: 32, layer: 'floor' },
    
    // More floor types (Row 1)
    { name: 'concrete_1', x: 0, y: 32, width: 32, height: 32, layer: 'floor' },
    { name: 'concrete_2', x: 32, y: 32, width: 32, height: 32, layer: 'floor' },
    { name: 'marble_1', x: 64, y: 32, width: 32, height: 32, layer: 'floor' },
    { name: 'marble_2', x: 96, y: 32, width: 32, height: 32, layer: 'floor' },
    { name: 'tile_black', x: 128, y: 32, width: 32, height: 32, layer: 'floor' },
    { name: 'tile_grey', x: 160, y: 32, width: 32, height: 32, layer: 'floor' },
    
    // ============= WALLS (Rows 4-7, cols 0-31) =============
    // Basic walls with colliders
    { name: 'wall_white', x: 0, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'wall_grey', x: 32, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'wall_beige', x: 64, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'wall_blue', x: 96, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'wall_green', x: 128, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'wall_brick', x: 160, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'wall_wood', x: 192, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'wall_glass', x: 224, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Wall decorations - windows, pictures, etc
    { name: 'window_1', x: 256, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'window_2', x: 288, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'picture_1', x: 320, y: 128, width: 32, height: 32, layer: 'above_floor' },
    { name: 'picture_2', x: 352, y: 128, width: 32, height: 32, layer: 'above_floor' },
    { name: 'clock', x: 384, y: 128, width: 32, height: 32, layer: 'above_floor' },
    { name: 'whiteboard', x: 416, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // ============= DESKS & WORKSTATIONS (Rows 8-11) =============
    // Single desks with computers (facing down)
    { name: 'desk_pc_down', x: 0, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_laptop_down', x: 32, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_clean_down', x: 64, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_papers_down', x: 96, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Desks facing up
    { name: 'desk_pc_up', x: 128, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_laptop_up', x: 160, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_clean_up', x: 192, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Desks facing left
    { name: 'desk_pc_left', x: 224, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_laptop_left', x: 256, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Desks facing right
    { name: 'desk_pc_right', x: 288, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_laptop_right', x: 320, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Long desks (for rows of workstations)
    { name: 'desk_long_left', x: 0, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_long_mid', x: 32, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_long_right', x: 64, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Corner/L-shaped desks
    { name: 'desk_corner_tl', x: 96, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_corner_tr', x: 128, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_corner_bl', x: 160, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_corner_br', x: 192, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // ============= CHAIRS (Rows 12-13) =============
    // Office chairs - 4 directions
    { name: 'chair_down', x: 0, y: 384, width: 32, height: 32, layer: 'above_floor' },
    { name: 'chair_up', x: 32, y: 384, width: 32, height: 32, layer: 'above_floor' },
    { name: 'chair_left', x: 64, y: 384, width: 32, height: 32, layer: 'above_floor' },
    { name: 'chair_right', x: 96, y: 384, width: 32, height: 32, layer: 'above_floor' },
    
    // Fancy office chairs
    { name: 'chair_exec_down', x: 128, y: 384, width: 32, height: 32, layer: 'above_floor' },
    { name: 'chair_exec_up', x: 160, y: 384, width: 32, height: 32, layer: 'above_floor' },
    { name: 'chair_exec_left', x: 192, y: 384, width: 32, height: 32, layer: 'above_floor' },
    { name: 'chair_exec_right', x: 224, y: 384, width: 32, height: 32, layer: 'above_floor' },
    
    // ============= MEETING ROOMS (Rows 14-15) =============
    // Conference tables
    { name: 'table_conf_left', x: 0, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'table_conf_mid', x: 32, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'table_conf_right', x: 64, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'table_round', x: 96, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'table_square', x: 128, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Presentation equipment
    { name: 'projector_screen', x: 160, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'tv_monitor', x: 192, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'podium', x: 224, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // ============= STORAGE (Rows 16-17) =============
    // Filing cabinets
    { name: 'file_cabinet_1', x: 0, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'file_cabinet_2', x: 32, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'file_cabinet_3', x: 64, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Bookshelves
    { name: 'bookshelf_1', x: 96, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'bookshelf_2', x: 128, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'bookshelf_3', x: 160, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'shelf_low', x: 192, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Storage boxes
    { name: 'box_closed', x: 224, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'box_open', x: 256, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'crate', x: 288, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // ============= OFFICE EQUIPMENT (Rows 18-19) =============
    { name: 'printer', x: 0, y: 576, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'copier', x: 32, y: 576, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'scanner', x: 64, y: 576, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'shredder', x: 96, y: 576, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'fax_machine', x: 128, y: 576, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // ============= BREAK ROOM (Rows 20-21) =============
    // Appliances
    { name: 'water_cooler', x: 0, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'coffee_machine', x: 32, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'microwave', x: 64, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'fridge', x: 96, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'vending_snack', x: 128, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'vending_drink', x: 160, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Lounge furniture
    { name: 'couch_left', x: 192, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'couch_mid', x: 224, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'couch_right', x: 256, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'armchair', x: 288, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'coffee_table', x: 320, y: 640, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // ============= PLANTS & DECOR (Rows 22-23) =============
    // Potted plants
    { name: 'plant_small_1', x: 0, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_small_2', x: 32, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_med_1', x: 64, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_med_2', x: 96, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_large_1', x: 128, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_large_2', x: 160, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_hanging', x: 192, y: 704, width: 32, height: 32, layer: 'above_floor' },
    { name: 'plant_floor', x: 224, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Decorative items
    { name: 'trash_bin', x: 256, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'recycle_bin', x: 288, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'umbrella_stand', x: 320, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'coat_rack', x: 352, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // ============= LIGHTING (Row 24) =============
    { name: 'lamp_desk', x: 0, y: 768, width: 32, height: 32, layer: 'above_floor' },
    { name: 'lamp_floor', x: 32, y: 768, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'lamp_ceiling', x: 64, y: 768, width: 32, height: 32, layer: 'above_floor' },
    { name: 'lamp_wall', x: 96, y: 768, width: 32, height: 32, layer: 'above_floor' },
    
    // ============= DOORS (Row 25) =============
    { name: 'door_wood_h', x: 0, y: 800, width: 32, height: 32, layer: 'above_floor' },
    { name: 'door_wood_v', x: 32, y: 800, width: 32, height: 32, layer: 'above_floor' },
    { name: 'door_glass_h', x: 64, y: 800, width: 32, height: 32, layer: 'above_floor' },
    { name: 'door_glass_v', x: 96, y: 800, width: 32, height: 32, layer: 'above_floor' },
    { name: 'door_double', x: 128, y: 800, width: 32, height: 32, layer: 'above_floor' },
    
    // ============= BACKWARD COMPATIBILITY ALIASES =============
    // These maintain compatibility with old template sprite names
    
    // Old floor names
    { name: 'wood_floor_light', x: 0, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_floor_medium', x: 32, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'wood_floor_dark', x: 64, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'tile_floor_white', x: 416, y: 0, width: 32, height: 32, layer: 'floor' },
    { name: 'tile_floor_grey', x: 160, y: 32, width: 32, height: 32, layer: 'floor' },
    
    // Old furniture names
    { name: 'desk_left', x: 0, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_middle', x: 32, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_right', x: 64, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_single', x: 96, y: 256, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'desk_corner', x: 96, y: 288, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    { name: 'office_chair', x: 128, y: 384, width: 32, height: 32, layer: 'above_floor' },
    
    // Old electronics
    { name: 'monitor', x: 0, y: 256, width: 32, height: 32, layer: 'above_floor' },
    { name: 'monitor_on', x: 32, y: 256, width: 32, height: 32, layer: 'above_floor' },
    { name: 'laptop', x: 64, y: 256, width: 32, height: 32, layer: 'above_floor' },
    { name: 'laptop_open', x: 96, y: 256, width: 32, height: 32, layer: 'above_floor' },
    { name: 'keyboard', x: 128, y: 256, width: 32, height: 32, layer: 'above_floor' },
    
    // Old plants
    { name: 'plant_small', x: 0, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_medium', x: 64, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'plant_large', x: 128, y: 704, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Old accessories
    { name: 'bookshelf', x: 96, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'filing_cabinet', x: 0, y: 512, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Old tables
    { name: 'meeting_table', x: 0, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'round_table', x: 96, y: 448, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Old decorations
    { name: 'picture_frame', x: 320, y: 128, width: 32, height: 32, layer: 'above_floor' },
    { name: 'window', x: 256, y: 128, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    
    // Old lighting
    { name: 'ceiling_light', x: 64, y: 768, width: 32, height: 32, layer: 'above_floor' },
    
    // Old doors
    { name: 'door_closed', x: 0, y: 800, width: 32, height: 32, layer: 'object', colliders: [{ x: 0, y: 0 }] },
    { name: 'door_open', x: 32, y: 800, width: 32, height: 32, layer: 'above_floor' },
    { name: 'door_glass', x: 64, y: 800, width: 32, height: 32, layer: 'above_floor' },
]

const modernSpriteSheetData = new SpriteSheetData(width, height, url, sprites)

export { modernSpriteSheetData }
