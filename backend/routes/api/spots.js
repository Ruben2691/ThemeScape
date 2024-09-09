const express = require('express');
const router = express.Router();
const { Spot, SpotImage, User, Review, ReviewImage } = require('../../models');
const { requireAuth } = require('../utils/auth.js');



const authenticationMiddleware = (req, res, next) => {
  if (!req.user) { // Assuming req.user is set by some authentication process
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};


// //details of a spot from an id
// router.get('/spots/:spotId', async (req, res) => {
//   const { spotId } = req.params;

//   try {
//     const spot = await Spots.findByPk(spotId, {
//       include: [
//         { model: SpotImage, attributes: ['id', 'url', 'preview'] },
//         { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] }
//       ]
//     });

//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     return res.status(200).json(spot);
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// // Get all spots owned by the current user
// router.get('/spots/current', authenticationMiddleware, async (req, res) => {
//   try {
//     const spots = await Spots.findAll({
//       where: { ownerId: req.user.id }
//     });
//     return res.status(200).json({ Spots: spots });
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


// //add image
// router.post('/:spotId/images', authenticationMiddleware, async (req, res) => {
//   const { spotId } = req.params;
//   const { url, preview } = req.body;
//   const userId = req.user.id;

//   try {
//     // Find the spot
//     const spot = await Spots.findByPk(spotId);

//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     // Check if the current user is the owner of the spot
//     if (spot.ownerId !== userId) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     // Create and add the image
//     const newImage = await SpotImages.create({
//       spotId,
//       url,
//       preview
//     });

//     return res.status(201).json({
//       id: newImage.id,
//       url: newImage.url,
//       preview: newImage.preview
//     });
//   } catch (error) {
//     console.error('Error adding image to spot:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }

// })

// //GET Spots
// router.get('/', async (req, res) => {
//   try {
//     const spots = await Spots.findAll();
//     res.json({ Spots: spots });
//   } catch (err) {
//     console.error('Error retrieving spots:', err);
//     res.status(500).json({ message: "Server error", errors: err.errors });
//   }
// });

// //Create a spot
// router.post('/', authenticationMiddleware, async (req, res) => {
//     const { address, city, state, country, lat, lng, name, description, price } = req.body;

//     try {
//       const newSpot = await Spots.create({
//         ownerId: req.user.id,
//         address,
//         city,
//         state,
//         country,
//         lat,
//         lng,
//         name,
//         description,
//         price
//       });

//       res.status(201).json(newSpot);
//     } catch (err) {
//       res.status(400).json({ message: "Bad Request", errors: err.errors });
//     }
//   });

  // Get Spot by ID and details (Owner, SpotImages, Reviews)
router.get('/spots/:id', async (req, res) => {
  const spotId = req.params.id;

  try {
    // Find spot by ID
    const spot = await Spot.findByPk(spotId, {
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
    const reviews = await Review.findAll({
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
    const spot = await Spot.findByPk(spotId);

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
    const spot = await Spot.findByPk(spotId);

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

// POST /spots/:id/reviews - Create a new review for a spot
router.post('/spots/:id/reviews', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const spotId = req.params.id;
  const { review, stars } = req.body;

  // Validate req body
  if (!review || typeof review !== 'string' || !stars || typeof stars !== 'number' || stars < 1 || stars > 5) {
    return res.status(400).json({
      message: 'Validation error: Review and stars are required. Stars must be between 1 and 5.',
      statusCode: 400,
    });
  }

  try {
    // Check if spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({
        message: 'Spot not found',
        statusCode: 404,
      });
    }

    // Check if user has already made a review for this spot
    const existingReview = await Review.findOne({
      where: { userId, spotId },
    });
    if (existingReview) {
      return res.status(403).json({
        message: 'User already has a review for this spot',
        statusCode: 403,
      });
    }

    // Create new review
    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars,
    });

    // Return the new review data
    return res.status(201).json({
      id: newReview.id,
      userId: newReview.userId,
      spotId: newReview.spotId,
      review: newReview.review,
      stars: newReview.stars,
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

// Set a constant for the maximum number of images per review
const MAX_REVIEW_IMAGES = 10;

// POST /reviews/:id/images - Create a new image for a review
router.post('/reviews/:id/images', requireAuth, async (req, res) => {
  const userId = req.user.id; // Assuming `req.user.id` is set after authentication
  const reviewId = req.params.id;
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      message: 'Validation error: URL is required.',
      statusCode: 400,
    });
  }

  try {
    // Check if the review exists
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        statusCode: 404,
      });
    }

    // Check if the authenticated user is the owner of the review
    if (review.userId !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to add an image to this review',
        statusCode: 403,
      });
    }

    // Check if the maximum number of images for this review has been reached
    const reviewImagesCount = await ReviewImage.count({
      where: { reviewId },
    });
    if (reviewImagesCount >= MAX_REVIEW_IMAGES) {
      return res.status(403).json({
        message: `Maximum number of images (${MAX_REVIEW_IMAGES}) for this review has been reached`,
        statusCode: 403,
      });
    }

    // Create the new image
    const newImage = await ReviewImage.create({
      reviewId,
      url,
    });

    // Return the newly created image data
    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    console.error('Error creating review image:', error);
    res.status(500).json({
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

// constant for the max num of images per review
const maxReviewImages = 10;

// POST /reviews/:id/images - Create new image for a review
router.post('/reviews/:id/images', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.id;
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      message: 'Validation error: URL is required.',
      statusCode: 400,
    });
  }

  try {
    // if review exists?
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        statusCode: 404,
      });
    }

    // check if the auth user is the owner of review
    if (review.userId !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to add an image to this review',
        statusCode: 403,
      });
    }

    // check if the max num of images for this review has been met
    const reviewImagesCount = await ReviewImage.count({
      where: { reviewId },
    });
    if (reviewImagesCount >= maxReviewImages) {
      return res.status(403).json({
        message: `Maximum number of images (${maxReviewImages}) for this review has been reached`,
        statusCode: 403,
      });
    }

    // Create new image
    const newImage = await ReviewImage.create({
      reviewId,
      url,
    });

    // Return the data
    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    console.error('Error creating review image:', error);
    res.status(500).json({
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

// GET /reviews/current - Get all reviews by the current authenticated user
router.get('/reviews/current', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    // Find reviews by the current user, including data for User, Spot, and ReviewImages
    const userReviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Spot,
          attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'
          ],
          include: [
            {
              model: SpotImage,
              as: 'previewImage',
              attributes: ['url'],
              where: { preview: true },
              required: false // if spot doesn't have a prev image
            }
          ]
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url'],
        },
      ],
    });


    if (!userReviews.length) {
      return res.status(200).json({ Reviews: [] });
    }

    // Process the reviews and send the response
    return res.status(200).json({
      Reviews: userReviews.map(review => {
        // Extract the preview image if it exists
        const previewImage = review.Spot.SpotImages && review.Spot.SpotImages[0]
          ? review.Spot.SpotImages[0].url
          : null;

        return {
          id: review.id,
          userId: review.userId,
          spotId: review.spotId,
          review: review.review,
          stars: review.stars,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          User: {
            id: review.User.id,
            firstName: review.User.firstName,
            lastName: review.User.lastName,
          },
          Spot: {
            id: review.Spot.id,
            ownerId: review.Spot.ownerId,
            address: review.Spot.address,
            city: review.Spot.city,
            state: review.Spot.state,
            country: review.Spot.country,
            lat: review.Spot.lat,
            lng: review.Spot.lng,
            name: review.Spot.name,
            price: review.Spot.price,
            previewImage: previewImage, // Set the preview image URL or null
          },
          ReviewImages: review.ReviewImages.map(image => ({
            id: image.id,
            url: image.url,
          })),
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching reviews for the current user:', error);
    return res.status(500).json({
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});


// GET /spots/:spotId/reviews - Get all reviews for a spot
router.get('/spots/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;

  try {
    // if the spot exists?
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
        statusCode: 404,
      });
    }

    // Find all reviews for the given spotId
    const spotReviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url'],
        },
      ],
    });


    return res.status(200).json({
      Reviews: spotReviews.map(review => ({
        id: review.id,
        userId: review.userId,
        spotId: review.spotId,
        review: review.review,
        stars: review.stars,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        User: {
          id: review.User.id,
          firstName: review.User.firstName,
          lastName: review.User.lastName,
        },
        ReviewImages: review.ReviewImages.map(image => ({
          id: image.id,
          url: image.url,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching reviews for the spot:', error);
    return res.status(500).json({
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

// PUT /reviews/:reviewId - Update a review
router.put('/reviews/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const { user } = req;

  try {
    // Fetch the existing review by ID
    const existingReview = await Review.findByPk(reviewId);

    // If review doesn't exist, return a 404 error
    if (!existingReview) {
      return res.status(404).json({
        message: "Review couldn't be found",
        statusCode: 404
      });
    }

    // Check if authenticated user is the owner of the review
    if (existingReview.userId !== user.id) {
      return res.status(403).json({
        message: "Forbidden - You are not authorized to update this review",
        statusCode: 403
      });
    }

    // Validate the `review` and `stars` fields
    if (!review || typeof stars !== 'number' || stars < 1 || stars > 5) {
      return res.status(400).json({
        message: "Validation error",
        statusCode: 400,
        errors: {
          review: review ? null : "Review text is required",
          stars: stars < 1 || stars > 5 ? "Stars must be an integer from 1 to 5" : null
        }
      });
    }

    // Update the review in the database
    existingReview.review = review;
    existingReview.stars = stars;

    await existingReview.save();

    return res.status(200).json({
      id: existingReview.id,
      userId: existingReview.userId,
      spotId: existingReview.spotId,
      review: existingReview.review,
      stars: existingReview.stars,
      createdAt: existingReview.createdAt,
      updatedAt: existingReview.updatedAt
    });
  } catch (err) {
    console.error("Error updating review:", err);
    return res.status(500).json({
      message: "Internal server error",
      statusCode: 500
    });
  }
});

module.exports = router;
