-- Price on request: a NULL price_amount means the price is not defined and is agreed with the customer directly.
-- Checkout does not exist yet; order_items.unit_price_amount intentionally stays NOT NULL so an unpriced product can never be ordered.

alter table public.products
  alter column price_amount drop not null;

-- The original check (compare_at_price_amount > price_amount) evaluates to NULL, and therefore passes, when price_amount is NULL.
-- Make the rule explicit: a compare-at price is only valid together with a price.
alter table public.products
  add constraint products_compare_at_requires_price check (
    compare_at_price_amount is null
    or (price_amount is not null and compare_at_price_amount > price_amount)
  );

comment on column public.products.price_amount is
  'Price in EUR cents. NULL = price on request (not purchasable online).';

-- public.search_public_products already returns price_amount / compare_at_price_amount as nullable bigint
-- and never filters or orders by price, so it needs no change.
