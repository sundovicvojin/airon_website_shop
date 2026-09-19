-- AIRON Phase 5: allow authenticated users to resolve only their own admin roles.

create or replace function public.get_my_admin_roles()
returns setof public.admin_role
language sql
stable
security definer
set search_path = ''
as $$
  select r.code
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = auth.uid()
  order by r.code;
$$;

revoke all on function public.get_my_admin_roles() from public;
grant execute on function public.get_my_admin_roles() to authenticated;

comment on function public.get_my_admin_roles() is
  'Returns only the current authenticated user role codes. Used for server-side admin authorization.';
