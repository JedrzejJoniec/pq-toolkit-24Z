import { z } from 'zod'

export const samplesListSchema = z.object({
    samples: z.array(
        z.object({
          name: z.string(), 
          url: z.string().url(),
          rating: z.number(),
    })
    ),
});

export type AdminExperimentsList = z.infer<typeof samplesListSchema>
