import { z } from 'zod'



//   startDate  DateTime                                // Booking start date
//   endDate    DateTime                                // Booking end date
//   petSitter  PetSitter @relation(fields: [petSitterId], references: [id]) // Link to PetSitter
//   petSitterId Int    // Foreign key to PetSitter
//   user       User     @relation(fields: [userId], references: [id])  // Link to User
//   userId     

export const bookingSchema = z.object({

    startDate: z.string().datetime(),           // ISO 8601 datetime string
    endDate: z.string().datetime(),
    petSitterId: z.number().int().positive(),
    userId: z.number().int().positive(),
});

export const bookingSchemaStrict = bookingSchema.refine(
    (data) => data.startDate < data.endDate,
    { message: "endDate must be after startDate", path: ["endDate"] }
);