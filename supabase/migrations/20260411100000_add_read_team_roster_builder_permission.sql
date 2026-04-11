-- Add READ_TEAM_ROSTER_BUILDER permission to the Leaders Committee role
UPDATE public.roles
SET permissions = array_append(permissions, 'READ_TEAM_ROSTER_BUILDER')
WHERE label = 'Leaders Committee'
  AND NOT ('READ_TEAM_ROSTER_BUILDER' = ANY(permissions));
