-- Backfill reference ids and display values for ticket_history rows created before
-- old_ref_id/new_ref_id were introduced. These updates are intentionally scoped to
-- rows where the reference column is NULL so existing ref ids are not overwritten.

-- Status history values may have been stored as status ids. Preserve the ids in
-- old_ref_id/new_ref_id and show the human-readable status name in old_value/new_value.
UPDATE ticket_history th
LEFT JOIN status_master old_status ON old_status.status_id = th.old_value OR old_status.status_name = th.old_value OR old_status.label = th.old_value
LEFT JOIN status_master new_status ON new_status.status_id = th.new_value OR new_status.status_name = th.new_value OR new_status.label = th.new_value
SET
    th.old_ref_id = CASE
        WHEN th.old_ref_id IS NULL AND old_status.status_id IS NOT NULL THEN old_status.status_id
        ELSE th.old_ref_id
    END,
    th.new_ref_id = CASE
        WHEN th.new_ref_id IS NULL AND new_status.status_id IS NOT NULL THEN new_status.status_id
        ELSE th.new_ref_id
    END,
    th.old_value = COALESCE(old_status.status_name, th.old_value),
    th.new_value = COALESCE(new_status.status_name, th.new_value)
WHERE th.column_name = 'status_id'
  AND (th.old_ref_id IS NULL OR th.new_ref_id IS NULL);

-- Category history values may have been stored as category ids.
UPDATE ticket_history th
LEFT JOIN categories old_category ON old_category.category_id = th.old_value OR old_category.category = th.old_value
LEFT JOIN categories new_category ON new_category.category_id = th.new_value OR new_category.category = th.new_value
SET
    th.old_ref_id = CASE
        WHEN th.old_ref_id IS NULL AND old_category.category_id IS NOT NULL THEN old_category.category_id
        ELSE th.old_ref_id
    END,
    th.new_ref_id = CASE
        WHEN th.new_ref_id IS NULL AND new_category.category_id IS NOT NULL THEN new_category.category_id
        ELSE th.new_ref_id
    END,
    th.old_value = COALESCE(old_category.category, th.old_value),
    th.new_value = COALESCE(new_category.category, th.new_value)
WHERE th.column_name IN ('category', 'module', 'module_id')
  AND (th.old_ref_id IS NULL OR th.new_ref_id IS NULL);

-- Sub-category history values may have been stored as sub-category ids.
UPDATE ticket_history th
LEFT JOIN sub_categories old_sub_category ON old_sub_category.sub_category_id = th.old_value OR old_sub_category.sub_category = th.old_value
LEFT JOIN sub_categories new_sub_category ON new_sub_category.sub_category_id = th.new_value OR new_sub_category.sub_category = th.new_value
SET
    th.old_ref_id = CASE
        WHEN th.old_ref_id IS NULL AND old_sub_category.sub_category_id IS NOT NULL THEN old_sub_category.sub_category_id
        ELSE th.old_ref_id
    END,
    th.new_ref_id = CASE
        WHEN th.new_ref_id IS NULL AND new_sub_category.sub_category_id IS NOT NULL THEN new_sub_category.sub_category_id
        ELSE th.new_ref_id
    END,
    th.old_value = COALESCE(old_sub_category.sub_category, th.old_value),
    th.new_value = COALESCE(new_sub_category.sub_category, th.new_value)
WHERE th.column_name IN ('sub_category', 'sub_module', 'sub_module_id')
  AND (th.old_ref_id IS NULL OR th.new_ref_id IS NULL);

-- Issue type history values may have been stored as issue type ids.
UPDATE ticket_history th
LEFT JOIN issue_type_master old_issue_type ON old_issue_type.issue_type_id = th.old_value OR old_issue_type.name = th.old_value
LEFT JOIN issue_type_master new_issue_type ON new_issue_type.issue_type_id = th.new_value OR new_issue_type.name = th.new_value
SET
    th.old_ref_id = CASE
        WHEN th.old_ref_id IS NULL AND old_issue_type.issue_type_id IS NOT NULL THEN old_issue_type.issue_type_id
        ELSE th.old_ref_id
    END,
    th.new_ref_id = CASE
        WHEN th.new_ref_id IS NULL AND new_issue_type.issue_type_id IS NOT NULL THEN new_issue_type.issue_type_id
        ELSE th.new_ref_id
    END,
    th.old_value = COALESCE(old_issue_type.name, th.old_value),
    th.new_value = COALESCE(new_issue_type.name, th.new_value)
WHERE th.column_name IN ('issue_type_id', 'issue_type')
  AND (th.old_ref_id IS NULL OR th.new_ref_id IS NULL);

-- Division history values may have been stored as division ids.
UPDATE ticket_history th
LEFT JOIN division_master old_division ON old_division.division_id = th.old_value OR old_division.division_name = th.old_value
LEFT JOIN division_master new_division ON new_division.division_id = th.new_value OR new_division.division_name = th.new_value
SET
    th.old_ref_id = CASE
        WHEN th.old_ref_id IS NULL AND old_division.division_id IS NOT NULL THEN old_division.division_id
        ELSE th.old_ref_id
    END,
    th.new_ref_id = CASE
        WHEN th.new_ref_id IS NULL AND new_division.division_id IS NOT NULL THEN new_division.division_id
        ELSE th.new_ref_id
    END,
    th.old_value = COALESCE(old_division.division_name, th.old_value),
    th.new_value = COALESCE(new_division.division_name, th.new_value)
WHERE th.column_name IN ('division', 'division_id')
  AND (th.old_ref_id IS NULL OR th.new_ref_id IS NULL);
