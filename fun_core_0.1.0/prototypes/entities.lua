local export_silo = table.deepcopy(data.raw["container"]["steel-chest"])
export_silo.name = "fun-export-silo"
export_silo.minable = {mining_time = 0.5, result = "fun-export-silo"}
export_silo.picture.layers[1].tint = {r=1, g=0.5, b=0, a=1} -- Orange tint
export_silo.inventory_size = 48

local requisition_pad = table.deepcopy(data.raw["container"]["steel-chest"])
requisition_pad.name = "fun-requisition-pad"
requisition_pad.minable = {mining_time = 0.5, result = "fun-requisition-pad"}
requisition_pad.picture.layers[1].tint = {r=0, g=0.5, b=1, a=1} -- Blue tint
requisition_pad.inventory_size = 48

data:extend({export_silo, requisition_pad})
