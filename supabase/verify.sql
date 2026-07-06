select 'localities' as dataset, count(*) as rows from public.localities
union all
select 'apartments', count(*) from public.apartments
union all
select 'transit_pois', count(*) from public.transit_pois;

select type, count(*) as cached_points, max(fetched_at) as last_refresh
from public.transit_pois
group by type
order by type;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('localities', 'apartments', 'transit_pois')
order by tablename, policyname;
