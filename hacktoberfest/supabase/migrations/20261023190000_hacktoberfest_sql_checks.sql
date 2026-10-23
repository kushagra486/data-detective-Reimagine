-- Hacktoberfest 2026: the name check and the certificate-ID check run in SQL.
--
-- hacktoberfest_claim(name, client)  -> the person's row only for an exact listed name
--                                       (case and extra spaces ignored); counts the download.
--                                       Wrong names are logged, and a visitor with too many
--                                       wrong names in 10 minutes is refused.
-- hacktoberfest_verify(certificate_id) -> who a certificate was issued to.
--
-- Only the Edge Functions (service_role) may call these; the public website key cannot.

create or replace function public.hacktoberfest_claim(p_name text, p_client text)
returns table (status text, name text, team text, certificate_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key    text := lower(regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g'));
  v_misses int;
  v_row    public.hacktoberfest_participants;
begin
  if length(v_key) < 2 or length(v_key) > 80 then
    return query select 'not_found'::text, null::text, null::text, null::text;
    return;
  end if;

  select count(*) into v_misses from public.hacktoberfest_lookups l
   where l.client = p_client and l.created_at > now() - interval '10 minutes';
  if v_misses >= 40 then
    return query select 'rate_limited'::text, null::text, null::text, null::text;
    return;
  end if;

  update public.hacktoberfest_participants p
     set download_count      = p.download_count + 1,
         first_downloaded_at = coalesce(p.first_downloaded_at, now()),
         last_downloaded_at  = now()
   where p.name_key = v_key and not p.revoked
  returning p.* into v_row;

  if v_row.id is null then
    insert into public.hacktoberfest_lookups (client) values (p_client);
    return query select 'not_found'::text, null::text, null::text, null::text;
    return;
  end if;

  return query select 'ok'::text, v_row.name, v_row.team, v_row.certificate_id;
end;
$$;

create or replace function public.hacktoberfest_verify(p_certificate_id text)
returns table (status text, name text, team text, certificate_id text)
language sql
stable
security definer
set search_path = public
as $$
  select case when p.revoked then 'revoked' else 'valid' end, p.name, p.team, p.certificate_id
    from public.hacktoberfest_participants p
   where p.certificate_id = upper(btrim(p_certificate_id));
$$;

revoke all on function public.hacktoberfest_claim(text, text) from public, anon, authenticated;
revoke all on function public.hacktoberfest_verify(text)      from public, anon, authenticated;
grant execute on function public.hacktoberfest_claim(text, text) to service_role;
grant execute on function public.hacktoberfest_verify(text)      to service_role;
