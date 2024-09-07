const express = require('express');
const { Spots } = require('../../db/models/spots');
const router = express.Router();



const authenticationMiddleware = (req, res, next) => {
  if (!req.user) { // Assuming req.user is set by some authentication process
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};


router.get('/', async (req, res) => {
  try {
    const spots = await Spots.findAll();
    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: "Server error", errors: err.errors });
  }
});


router.post('/', authenticationMiddleware, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    try {
      const newSpot = await Spots.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
      });

      res.status(201).json(newSpot);
    } catch (err) {
      res.status(400).json({ message: "Bad Request", errors: err.errors });
    }
  });


module.exports = router;
