-- Referentials used by the activity forms (from the app's current option lists).
insert into public.brands (name) values
  ('Habesha'), ('Habesha Kostara'), ('Habesha Draught'), ('Negus'), ('Feta'), ('Kidame')
on conflict (name) do nothing;
insert into public.divisions (name) values
  ('Addis Ababa'), ('Central'), ('East'), ('North East'), ('North West'), ('South'), ('West'), ('National')
on conflict (name) do nothing;