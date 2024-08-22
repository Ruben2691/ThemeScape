https://lucid.app/lucidchart/d721ae59-75d4-40b9-a65b-009c39739353/edit?viewport_loc=-718%2C-674%2C2469%2C1348%2CHWEp-vi-RSFO&invitationId=inv_c84dde8f-1a44-4fb2-aaff-5cf82d917b2c



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
