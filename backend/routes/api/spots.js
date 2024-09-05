const express = require('express');
const { Spot } = require('../../models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll();
    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: "Server error", errors: err.errors });
  }
});


router.post('/', authenticationMiddleware, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    try {
      const newSpot = await Spot.create({
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
