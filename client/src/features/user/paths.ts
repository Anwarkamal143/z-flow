const prefix = 'user:'

export const USER_QUERY = {
  me: `${prefix}me`,
  all: `${prefix}all`,
} as const
export const USER_PATHS = {
  me: 'me',
} as const
