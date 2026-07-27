-- Remove tables accidentally imported from the unrelated airport project.
-- Intentionally omit CASCADE so the migration fails instead of deleting any
-- newly introduced dependent objects outside this explicit list.
DROP TABLE IF EXISTS
  public.airport_lounge_images,
  public.airport_lounges,
  public.airport_reviews,
  public.airport_guide_revisions,
  public.airport_guides,
  public.airport_images,
  public.airport_google_ratings,
  public.airport_profiles,
  public.__drizzle_migrations;
