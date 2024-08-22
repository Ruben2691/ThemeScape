Table Users {
  id integer [primary key] AUTOINCREMENT
  firstName string
  lastName string
  email string
  username string
}

Table Spots{
id integer  [primary key]
ownerId integer
adress string
city string
stat string
country string
lat float
lng float
name string
description string
price integer
createdAt timestamp
updatedAt timestamp
avgRating float
previewImage char
}

Table Reviews{
  id integer [primary key]
  userId integer
  spotid integer
  review string
  stars integer
  createdAt timestamp
  updatedAt timestamp
}

Table Bookings {
  id integer
  spotId integer
}

Table Images {
  id integer [primary key]
  url string
}

Ref: Reviewseviews > Users, Spots // many-to-many
Ref: Users > Spots //one to many
Ref: Spots < Users//many to one
Ref: Imgaes > Reviews // one to many 
