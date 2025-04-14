User-related Endpoints

POST /users/signup — Create a new user
POST /users/login — Log in a user
GET /users/:id — Get user profile details
PUT /users/:id — Update user profile
GET /users/:id/bookings — Get all bookings for a user

PetSitter-related Endpoints

GET /petsitters — Get a list of available pet sitters
GET /petsitters/:id — Get a specific pet sitter’s details
GET /petsitters/:id/bookings — Get all bookings for a specific pet sitter

Booking-related Endpoints

POST /bookings — Create a new booking
GET /bookings/:id — Get a specific booking
GET /bookings/user/:userId — Get all bookings made by a specific user
GET /bookings/petsitter/:petSitterId — Get all bookings for a specific pet sitter
PUT /bookings/:id — Update booking (e.g., change dates, status)
DELETE /bookings/:id — Delete a booking

what is wrong with you '