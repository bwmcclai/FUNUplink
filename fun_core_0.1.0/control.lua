global.export_buffer = {}

-- Helper to add items to buffer (Supports 1.1 and 2.0)
local function buffer_items(contents)
    -- contents format varies between 1.1 (dict) and 2.0 (array of objects)
    for k, v in pairs(contents) do
        local name, count, quality
        
        if type(k) == "string" then
            -- 1.1 Style: { ["iron-plate"] = 50 }
            name = k
            count = v
            quality = "normal"
        else
            -- 2.0 Style: { {name="iron-plate", count=50, quality="epic"} }
            -- Note: In 2.0 get_contents() returns objects
            name = v.name
            count = v.count
            quality = v.quality or "normal"
        end

        -- Add to global buffer
        local found = false
        for _, stack in pairs(global.export_buffer) do
            if stack.name == name and stack.quality == quality then
                stack.count = stack.count + count
                found = true
                break
            end
        end
        
        if not found then
            table.insert(global.export_buffer, {name = name, count = count, quality = quality})
        end
    end
end

-- Event: When player closes a GUI
script.on_event(defines.events.on_gui_closed, function(event)
  if event.entity and event.entity.name == "fun-export-silo" then
    local inventory = event.entity.get_inventory(defines.inventory.chest)
    if inventory.is_empty() then return end

    local contents = inventory.get_contents()
    if next(contents) == nil then return end -- Empty

    buffer_items(contents)
    inventory.clear()

    event.entity.surface.create_entity{
      name = "flying-text",
      position = event.entity.position,
      text = "Exporting to Cloud...",
      color = {r=1, g=0.5, b=0}
    }
  end
end)

-- Remote Interface for RCON
remote.add_interface("fun_core", {
  get_export_buffer = function()
    local data = game.table_to_json({ items = global.export_buffer })
    global.export_buffer = {} -- Clear buffer
    return data
  end,

  spawn_delivery = function(json_payload)
    -- json_payload is a string from RCON
    local delivery = game.json_to_table(json_payload)
    
    if not delivery then
        game.print("fun_core Error: Invalid JSON delivery.")
        return
    end

    -- Attempt to find a requisition pad
    -- For simplicty, just give to the first player or print to chat if no pads
    -- In a real implementation, we'd track pads per player
    
    local target = nil
    -- Naive search for a pad on the main surface
    local pads = game.surfaces[1].find_entities_filtered({name="fun-requisition-pad"})
    if #pads > 0 then
        target = pads[1]
    else
        -- Fallback to player 1
        target = game.players[1].character
    end

    if target then
        -- Prepare stack with optional quality
        local stack = {name=delivery.item_name, count=delivery.amount, quality=delivery.quality or "normal"}
        
        if target.can_insert(stack) then
             target.insert(stack)
             local qText = (stack.quality and stack.quality ~= "normal") and (" ("..stack.quality..")") or ""
             game.print("Incoming Drop Pod: " .. delivery.amount .. "x " .. delivery.item_name .. qText)
        else
             game.print("fun_core: Delivery failed - Inventory full.")
        end
    else
         game.print("fun_core: No drop target found.")
    end
  end
})
