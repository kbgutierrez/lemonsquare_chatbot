const normalizeManualEntry = (
  item = {}
) => {

  console.log(
    "NORMALIZE_MANUAL_ENTRY",
    item
  )

  const resolvedId =
    item.EntryID ??
    item.entry_id ??
    item.ManualEntryID ??
    item.manual_entry_id ??
    item.ID ??
    item.id ??
    null

  return {
    id: resolvedId,

    title:
      item.Title ??
      item.title ??
      "",

    category:
      item.Category ??
      item.category ??
      "General",

    content:
      item.Content ??
      item.content ??
      "",

    created_at:
      item.CreatedAt ??
      item.created_at ??
      null,

    updated_at:
      item.UpdatedAt ??
      item.updated_at ??
      null,

    is_active:
      item.IsActive ??
      item.is_active ??
      true,
  }
}

export default normalizeManualEntry