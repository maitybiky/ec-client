import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api';
import { homepageKeys } from '@/entities/homepage';

export function useUpdateHomepage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content) => {
      const res = await http.patch('/homepage', content);
      return res.data.data.homepage;
    },
    onSuccess: (homepage) => {
      queryClient.setQueryData(homepageKeys.all, homepage);
    },
  });
}

/** Upload an image file, returns its public URL. */
export async function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await http.post('/uploads', fd);
  return res.data.data.url;
}
