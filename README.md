# Paiva Cleaners Pro

## Admin login setup (Supabase Auth + user_roles)

The admin area uses real Supabase Auth and checks admin access in public.user_roles.

### 1) Create your admin user in Supabase Auth

Use Supabase Dashboard:
- Authentication -> Users -> Invite user or Add user
- Email: your real admin email
- Set password

### 2) Allow this user as admin

Run this SQL (recommended):

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('admin@example.com')
ON CONFLICT (user_id, role) DO NOTHING;

### 3) Verify admin access

Use this query:

SELECT u.email, r.role
FROM public.user_roles r
JOIN auth.users u ON u.id = r.user_id
WHERE lower(u.email) = lower('admin@example.com');

### Notes

- Do not use service_role in frontend.
- Do not hardcode passwords in source code.
- If login works but admin is blocked, ensure the email exists in auth.users and role admin exists in public.user_roles.
