#!/usr/bin/env python3
"""Install ProductHelper backend parent-price cache support for Grocy.

This adds a SQLite view + triggers so parent products (`no_own_stock = 1`)
get a persisted `cache__products_last_purchased` row derived from the average
of their child products, normalized to the parent stock unit.
"""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path


REFRESH_PARENT_CACHE_SQL = """
DELETE FROM cache__products_last_purchased
WHERE product_id IN (SELECT id FROM products WHERE no_own_stock = 1);

INSERT OR REPLACE INTO cache__products_last_purchased
  (product_id, amount, best_before_date, purchased_date, price, location_id, shopping_location_id)
SELECT
  product_id,
  amount,
  best_before_date,
  purchased_date,
  price,
  location_id,
  shopping_location_id
FROM producthelper_parent_last_purchased;
"""


INSTALL_SQL = f"""
DROP TRIGGER IF EXISTS producthelper_parent_cache_plp_insert;
DROP TRIGGER IF EXISTS producthelper_parent_cache_plp_update;
DROP TRIGGER IF EXISTS producthelper_parent_cache_plp_delete;
DROP TRIGGER IF EXISTS producthelper_parent_cache_quc_insert;
DROP TRIGGER IF EXISTS producthelper_parent_cache_quc_update;
DROP TRIGGER IF EXISTS producthelper_parent_cache_quc_delete;
DROP TRIGGER IF EXISTS producthelper_parent_cache_products_insert;
DROP TRIGGER IF EXISTS producthelper_parent_cache_products_update;
DROP TRIGGER IF EXISTS producthelper_parent_cache_products_delete;
DROP VIEW IF EXISTS producthelper_parent_last_purchased;
DROP VIEW IF EXISTS uihelper_shopping_list;

CREATE VIEW producthelper_parent_last_purchased
AS
WITH child_last_purchased AS (
  SELECT
    parent.id AS product_id,
    child.id AS child_product_id,
    clp.amount AS child_amount,
    clp.best_before_date,
    clp.purchased_date,
    clp.location_id,
    clp.shopping_location_id,
    clp.price AS child_price_stock_unit,
    CASE
      WHEN child.qu_id_stock = parent.qu_id_stock THEN 1.0
      ELSE (
        SELECT quc.factor
        FROM cache__quantity_unit_conversions_resolved quc
        WHERE quc.product_id = child.id
          AND quc.from_qu_id = child.qu_id_stock
          AND quc.to_qu_id = parent.qu_id_stock
        LIMIT 1
      )
    END AS factor_to_parent_stock
  FROM products parent
  JOIN products child
    ON child.parent_product_id = parent.id
  JOIN cache__products_last_purchased clp
    ON clp.product_id = child.id
  WHERE parent.no_own_stock = 1
),
normalized AS (
  SELECT
    product_id,
    child_product_id,
    best_before_date,
    purchased_date,
    location_id,
    shopping_location_id,
    child_amount * factor_to_parent_stock AS amount_in_parent_stock,
    child_price_stock_unit / factor_to_parent_stock AS price_in_parent_stock,
    ROW_NUMBER() OVER (
      PARTITION BY product_id
      ORDER BY purchased_date DESC, child_product_id DESC
    ) AS recency_rank
  FROM child_last_purchased
  WHERE factor_to_parent_stock > 0
    AND child_price_stock_unit > 0
),
averaged AS (
  SELECT
    product_id,
    AVG(price_in_parent_stock) AS avg_price_in_parent_stock,
    AVG(CASE WHEN amount_in_parent_stock > 0 THEN amount_in_parent_stock END) AS avg_amount_in_parent_stock,
    MAX(purchased_date) AS latest_purchased_date
  FROM normalized
  GROUP BY product_id
)
SELECT
  1 AS id,
  averaged.product_id,
  COALESCE(averaged.avg_amount_in_parent_stock, 1.0) AS amount,
  latest.best_before_date,
  averaged.latest_purchased_date AS purchased_date,
  latest.location_id,
  latest.shopping_location_id,
  averaged.avg_price_in_parent_stock AS price
FROM averaged
LEFT JOIN normalized latest
  ON latest.product_id = averaged.product_id
  AND latest.recency_rank = 1;

CREATE VIEW uihelper_shopping_list
AS
SELECT
  sl.*,
  p.name AS product_name,
  CASE
    WHEN p.no_own_stock = 1 THEN (
      SELECT AVG(
        child_plp.price / CASE
          WHEN child.qu_id_stock = sl.qu_id THEN 1.0
          ELSE NULLIF((
            SELECT quc_child.factor
            FROM cache__quantity_unit_conversions_resolved quc_child
            WHERE quc_child.product_id = child.id
              AND quc_child.from_qu_id = child.qu_id_stock
              AND quc_child.to_qu_id = sl.qu_id
            LIMIT 1
          ), 0)
        END
      )
      FROM products child
      JOIN cache__products_last_purchased child_plp
        ON child_plp.product_id = child.id
      WHERE child.parent_product_id = p.id
        AND child_plp.price > 0
        AND (
          child.qu_id_stock = sl.qu_id
          OR EXISTS (
            SELECT 1
            FROM cache__quantity_unit_conversions_resolved quc_child
            WHERE quc_child.product_id = child.id
              AND quc_child.from_qu_id = child.qu_id_stock
              AND quc_child.to_qu_id = sl.qu_id
          )
        )
    )
    ELSE plp.price * IFNULL(quc.factor, 1.0)
  END AS last_price_unit,
  CASE
    WHEN p.no_own_stock = 1 THEN (
      COALESCE((
        SELECT AVG(
          child_plp.price / CASE
            WHEN child.qu_id_stock = sl.qu_id THEN 1.0
            ELSE NULLIF((
              SELECT quc_child.factor
              FROM cache__quantity_unit_conversions_resolved quc_child
              WHERE quc_child.product_id = child.id
                AND quc_child.from_qu_id = child.qu_id_stock
                AND quc_child.to_qu_id = sl.qu_id
              LIMIT 1
            ), 0)
          END
        )
        FROM products child
        JOIN cache__products_last_purchased child_plp
          ON child_plp.product_id = child.id
        WHERE child.parent_product_id = p.id
          AND child_plp.price > 0
          AND (
            child.qu_id_stock = sl.qu_id
            OR EXISTS (
              SELECT 1
              FROM cache__quantity_unit_conversions_resolved quc_child
              WHERE quc_child.product_id = child.id
                AND quc_child.from_qu_id = child.qu_id_stock
                AND quc_child.to_qu_id = sl.qu_id
            )
          )
      ), 0)
      * CASE
          WHEN sl.qu_id = p.qu_id_stock THEN sl.amount
          WHEN IFNULL(quc.factor, 0) > 0 THEN sl.amount / quc.factor
          ELSE sl.amount
        END
    )
    ELSE plp.price * sl.amount
  END AS last_price_total,
  plp.price AS price,
  st.name AS default_shopping_location_name,
  qu.name AS qu_name,
  qu.name_plural AS qu_name_plural,
  pg.id AS product_group_id,
  pg.name AS product_group_name,
  pbcs.barcodes AS product_barcodes
FROM shopping_list sl
LEFT JOIN products p
  ON sl.product_id = p.id
LEFT JOIN cache__products_last_purchased plp
  ON sl.product_id = plp.product_id
LEFT JOIN shopping_locations st
  ON p.shopping_location_id = st.id
LEFT JOIN quantity_units qu
  ON sl.qu_id = qu.id
LEFT JOIN product_groups pg
  ON p.product_group_id = pg.id
LEFT JOIN cache__quantity_unit_conversions_resolved quc
  ON p.id = quc.product_id
  AND p.qu_id_stock = quc.to_qu_id
  AND sl.qu_id = quc.from_qu_id
LEFT JOIN product_barcodes_comma_separated pbcs
  ON sl.product_id = pbcs.product_id;

CREATE TRIGGER producthelper_parent_cache_plp_insert
AFTER INSERT ON cache__products_last_purchased
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_plp_update
AFTER UPDATE ON cache__products_last_purchased
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_plp_delete
AFTER DELETE ON cache__products_last_purchased
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_quc_insert
AFTER INSERT ON cache__quantity_unit_conversions_resolved
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_quc_update
AFTER UPDATE ON cache__quantity_unit_conversions_resolved
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_quc_delete
AFTER DELETE ON cache__quantity_unit_conversions_resolved
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_products_insert
AFTER INSERT ON products
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_products_update
AFTER UPDATE ON products
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

CREATE TRIGGER producthelper_parent_cache_products_delete
AFTER DELETE ON products
BEGIN
  {REFRESH_PARENT_CACHE_SQL}
END;

{REFRESH_PARENT_CACHE_SQL}
"""


def install(db_path: Path) -> int:
    conn = sqlite3.connect(str(db_path))
    try:
        conn.executescript(INSTALL_SQL)
        conn.commit()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT COUNT(*)
            FROM cache__products_last_purchased
            WHERE product_id IN (SELECT id FROM products WHERE no_own_stock = 1)
            """
        )
        parent_count = int(cur.fetchone()[0] or 0)
        print(f"Installed parent-price backend cache support. Parent cache rows: {parent_count}")
        return parent_count
    finally:
        conn.close()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--db-path",
        default="/opt/grocy/config/data/grocy.db",
        help="Path to grocy.db",
    )
    args = parser.parse_args()
    db_path = Path(args.db_path)
    if not db_path.exists():
        raise SystemExit(f"Database not found: {db_path}")
    install(db_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
