-- Referentials used by the activity forms (from the app's current option lists).
insert into public.brands (name) values
  ('Habesha'), ('Habesha Kostara'), ('Habesha Draught'), ('Negus'), ('Feta'), ('Kidame')
on conflict (name) do nothing;
insert into public.divisions (name) values
  ('Addis'), ('Central'), ('South'), ('Near East'), ('Far East'), ('West'), ('Northeast'), ('NW - Gojjam'), ('NW - Gondar'), ('National')
on conflict (name) do nothing;