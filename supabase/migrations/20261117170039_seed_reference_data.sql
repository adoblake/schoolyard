-- Reference data: regions, schools, school email domains (mirrors src/lib/data.ts).
-- VERIFY BEFORE LAUNCH: confirm each school's *student* email domain with the school.

insert into public.regions (slug, label, name, subtitle, sort_order) values
  ('phoenix',   'phoenix.schoolyard',   'Phoenix SchoolYard',   'Phoenix metro student classifieds',   1),
  ('tucson',    'tucson.schoolyard',    'Tucson SchoolYard',    'Tucson area student classifieds',     2),
  ('flagstaff', 'flagstaff.schoolyard', 'Flagstaff SchoolYard', 'Northern Arizona student classifieds', 3);

insert into public.schools (id, region_slug, name, sort_order) values
  ('asu-tempe',     'phoenix',   'ASU Tempe',             1),
  ('asu-downtown',  'phoenix',   'ASU Downtown',          2),
  ('gcu',           'phoenix',   'GCU',                   3),
  ('mesa-cc',       'phoenix',   'Mesa CC',               4),
  ('scottsdale-cc', 'phoenix',   'Scottsdale CC',         5),
  ('uarizona',      'tucson',    'University of Arizona', 1),
  ('pima-cc',       'tucson',    'Pima CC',               2),
  ('nau',           'flagstaff', 'NAU',                   1),
  ('coconino-cc',   'flagstaff', 'Coconino CC',           2);

insert into public.school_email_domains (domain, school_id) values
  ('asu.edu',      'asu-tempe'),
  ('asu.edu',      'asu-downtown'),
  ('gcu.edu',      'gcu'),
  ('maricopa.edu', 'mesa-cc'),
  ('maricopa.edu', 'scottsdale-cc'),
  ('arizona.edu',  'uarizona'),
  ('pima.edu',     'pima-cc'),
  ('nau.edu',      'nau'),
  ('coconino.edu', 'coconino-cc');
