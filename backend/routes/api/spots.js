const express = require('express');
const router = express.Router();
const { Spots, SpotImages, Users, Reviews, ReviewImages } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");



//GET Spots
router.get('/', async (req, res) => {
  try {
    const spots = await Spots.findAll();
    res.json({ Spots: spots });
  } catch (err) {
    console.error('Error retrieving spots:', err);
    res.status(500).json({ message: "Server error", errors: err.errors });
  }
});

//details of a spot from an id
router.get('/spots/:spotId', async (req, res) => {
  const { spotId } = req.params;

  try {
    const spot = await Spots.findByPk(spotId, {
      include: [
        { model: SpotImages, attributes: ['id', 'url', 'preview'] },
        { model: Users, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    return res.status(200).json(spot);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all spots owned by the current user
router.get('/spots/current', requireAuth, async (req, res) => {
  try {
    const spots = await Spots.findAll({
      where: { ownerId: req.user.id }
    });
    return res.status(200).json({ Spots: spots });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Create a spot
router.post('/', requireAuth, async (req, res) => {
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

  // Get Spot by ID and details (Owner, SpotImages, Reviews)
router.get('/spots/:id', async (req, res) => {
  const spotId = req.params.id;

  try {
    // Find spot by ID
    const spot = await Spots.findByPk(spotId, {
      include: [
        // the owner (User) data
        {
          model: 'Users',
          as: 'Owner',
          attributes: ['id', 'firstName', 'lastName'],
        },
        // spot images
        {
          model: 'SpotImages',
          attributes: ['id', 'url', 'preview'],
        },
      ],
    });

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found', statusCode: 404 });
    }

    // Get # of reviews and avg rating
    const reviews = await Reviews.findAll({
      where: { spotId: spot.id },
      attributes: ['stars'],
    });

    const numReviews = reviews.length;
    const avgStarRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.stars, 0) / numReviews
      : 0;

    // response object
    const spotDetails = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      numReviews: numReviews,
      avgStarRating: avgStarRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner,
    };

    res.json(spotDetails);
  } catch (error) {
    console.error('Error fetching spot details:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
});


// PUT /spots/:id - Update a spot
router.put('/spots/:id', requireAuth, async (req, res) => {
  const spotId = req.params.id;
  const userId = req.user.id; // `req.user.id` is set after auth
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
    // find spot by ID
    const spot = await Spots.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found', statusCode: 404 });
    }

    // if the authenticated user is the owner of spot
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden - You are not the owner of this spot', statusCode: 403 });
    }

    // validate the req body
    if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
      return res.status(400).json({
        message: 'Validation error - Missing required fields',
        statusCode: 400,
        errors: {
          address: !address ? 'Address is required' : undefined,
          city: !city ? 'City is required' : undefined,
          state: !state ? 'State is required' : undefined,
          country: !country ? 'Country is required' : undefined,
          lat: !lat ? 'Latitude is required' : undefined,
          lng: !lng ? 'Longitude is required' : undefined,
          name: !name ? 'Name is required' : undefined,
          description: !description ? 'Description is required' : undefined,
          price: !price ? 'Price is required' : undefined,
        },
      });
    }

    // update spot with new data
    await spot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    // return updated spot details
    return res.json({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
    });
  } catch (error) {
    console.error('Error updating spot:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
});

// DELETE /spots/:id - Delete a spot
router.delete('/spots/:id', requireAuth, async (req, res) => {
  const spotId = req.params.id;
  const userId = req.user.id;

  try {
    // spot by ID
    const spot = await Spots.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found', statusCode: 404 });
    }

    // if the auth user is the owner of the spot?
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden - You are not the owner of this spot', statusCode: 403 });
    }

    // Delete spot
    await spot.destroy();

    // Return a success message
    return res.json({ message: 'Successfully deleted', statusCode: 200 });
  } catch (error) {
    console.error('Error deleting spot:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
});

module.exports = router;
