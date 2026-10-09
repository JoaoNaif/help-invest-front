import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, saveProfile, type ProfileState, type SaveProfileInput } from '../api/profile'

export const profileKey = ['investor-profile'] as const

export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: fetchProfile })
}

export function useSaveProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SaveProfileInput) => saveProfile(input),
    onSuccess: (profile) => {
      // Perfil recém-salvo nunca está desatualizado.
      queryClient.setQueryData<ProfileState>(profileKey, { profile, isOutdated: false })
    },
  })
}
