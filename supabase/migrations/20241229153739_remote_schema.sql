drop policy "public can read test_cats" on "public"."test_cats";

revoke delete on table "public"."test_cats" from "anon";

revoke insert on table "public"."test_cats" from "anon";

revoke references on table "public"."test_cats" from "anon";

revoke select on table "public"."test_cats" from "anon";

revoke trigger on table "public"."test_cats" from "anon";

revoke truncate on table "public"."test_cats" from "anon";

revoke update on table "public"."test_cats" from "anon";

revoke delete on table "public"."test_cats" from "authenticated";

revoke insert on table "public"."test_cats" from "authenticated";

revoke references on table "public"."test_cats" from "authenticated";

revoke select on table "public"."test_cats" from "authenticated";

revoke trigger on table "public"."test_cats" from "authenticated";

revoke truncate on table "public"."test_cats" from "authenticated";

revoke update on table "public"."test_cats" from "authenticated";

revoke delete on table "public"."test_cats" from "service_role";

revoke insert on table "public"."test_cats" from "service_role";

revoke references on table "public"."test_cats" from "service_role";

revoke select on table "public"."test_cats" from "service_role";

revoke trigger on table "public"."test_cats" from "service_role";

revoke truncate on table "public"."test_cats" from "service_role";

revoke update on table "public"."test_cats" from "service_role";

alter table "public"."test_cats" drop constraint "test_cats_pkey";

drop index if exists "public"."test_cats_pkey";

drop table "public"."test_cats";

create table "public"."user_roles" (
    "id" bigint generated by default as identity not null,
    "user_email" text not null,
    "user_role" text not null
);


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";


