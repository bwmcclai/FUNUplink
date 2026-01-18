local export_silo_item = table.deepcopy(data.raw["item"]["steel-chest"])
export_silo_item.name = "fun-export-silo"
export_silo_item.place_result = "fun-export-silo"
export_silo_item.order = "a[fun-export-silo]"
export_silo_item.icons = {
  {
    icon = export_silo_item.icon,
    tint = {r=1, g=0.5, b=0, a=1}
  }
}

local requisition_pad_item = table.deepcopy(data.raw["item"]["steel-chest"])
requisition_pad_item.name = "fun-requisition-pad"
requisition_pad_item.place_result = "fun-requisition-pad"
requisition_pad_item.order = "b[fun-requisition-pad]"
requisition_pad_item.icons = {
  {
    icon = requisition_pad_item.icon,
    tint = {r=0, g=0.5, b=1, a=1}
  }
}

data:extend({export_silo_item, requisition_pad_item})
