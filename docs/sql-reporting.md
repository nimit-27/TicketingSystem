# Reporting query guidance

The current `tickets` table stores `category` and `sub_category` as free-text fields rather than foreign keys, while the canonical names and IDs live in `categories` and `sub_categories`. Because the ticket rows do not carry `category_id` or `sub_category_id`, a join on IDs is not possible without first adding those columns and backfilling them.

## Query usable with the existing schema

With the current structure you can aggregate directly from `tickets` using the stored names:

```sql
SELECT
  t.category,
  t.sub_category,
  SUM(t.status_id = '7') AS resolved_count,
  SUM(t.status_id = '8') AS closed_count,
  COUNT(*) AS total_count
FROM tickets t
WHERE t.status_id IN ('7','8')
GROUP BY t.category, t.sub_category
ORDER BY t.category, t.sub_category;
```

This avoids unnecessary subqueries and lets MySQL combine the grouping and ordering in one pass. A join to lookup tables would require matching on text (e.g., `sub_categories.sub_category = tickets.sub_category`), which is feasible but not indexed in the dump; add an index on `sub_categories.sub_category` first if you take that approach.

## Recommended normalized query (requires schema change)

If you add `category_id` and `sub_category_id` to `tickets` and populate them, you can fetch canonical names and IDs efficiently:

```sql
SELECT
  c.category_id,
  c.category,
  sc.sub_category_id,
  sc.sub_category,
  t.status_id,
  COUNT(*) AS ticket_count
FROM tickets t
JOIN sub_categories sc ON sc.sub_category_id = t.sub_category_id
JOIN categories c ON c.category_id = sc.category_id
WHERE t.status_id IN ('7','8')
GROUP BY c.category_id, c.category, sc.sub_category_id, sc.sub_category, t.status_id
ORDER BY c.category, sc.sub_category;
```

With indexes on the new foreign keys this query is optimized for the schema in the dump and can directly supply both IDs and display names to the frontend.

## Spring Data JPA usage

Use a projection interface and a native query so you can call the query from a Spring Data repository without writing custom DAO code. The example below works against the **current** text-based schema; swap the SQL for the normalized query above if you add the foreign keys.

```java
public interface TicketCategoryCount {
  String getCategory();
  String getSubCategory();
  Integer getResolvedCount();
  Integer getClosedCount();
  Integer getTotalCount();
}

public interface TicketRepository extends Repository<Ticket, Long> {
  @Query(
      value = """
        SELECT
          t.category AS category,
          t.sub_category AS subCategory,
          SUM(t.status_id = '7') AS resolvedCount,
          SUM(t.status_id = '8') AS closedCount,
          COUNT(*) AS totalCount
        FROM tickets t
        WHERE t.status_id IN ('7','8')
        GROUP BY t.category, t.sub_category
        ORDER BY t.category, t.sub_category
      """,
      nativeQuery = true)
  List<TicketCategoryCount> fetchTicketCategoryCounts();
}
```

Spring Data will map the aliased columns to the projection getters. You can expose `fetchTicketCategoryCounts()` through a service/controller and return the results directly to the frontend. If you later normalize the schema, update only the SQL string; the repository signature and projection stay the same.
