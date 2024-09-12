const express = require("express");
const { Bookings, Spots, Reviews } = require("../../db/models");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");

const validateBooking = [
  // Check if startDate exists
  check("startDate")
    .exists({ checkFalsy: true })
    .withMessage("Start date is required"),

  // Check if endDate exists
  check("endDate")
    .exists({ checkFalsy: true })
    .withMessage("End date is required"),

  // Custom validation to check if startDate is before endDate
  check("startDate").custom((value, { req }) => {
    const startDate = new Date(value);
    const endDate = new Date(req.body.endDate);

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    // If the validation passes, return true
    return true;
  }),
  handleValidationErrors,
];

// POST /spots/:id/reviews - Create a new review for a spot
router.post('/:id/reviews', requireAuth, async (req, res) => {
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
      const spot = await Spots.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({
          message: 'Spot not found',
          statusCode: 404,
        });
      }

      // Check if user has already made a review for this spot
      const existingReview = await Reviews.findOne({
        where: { userId, spotId },
      });
      if (existingReview) {
        return res.status(403).json({
          message: 'User already has a review for this spot',
          statusCode: 403,
        });
      }

      // Create new review
      const newReview = await Reviews.create({
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

//edit a booking
router.put("/:bookingId", requireAuth, validateBooking, async (req, res) => {
  const bookingId = req.params.bookingId;
  const { startDate, endDate } = req.body;
  const userId = req.user.id; // userId from authentication

  try {
    // Find the booking by ID
    const booking = await Bookings.findByPk(bookingId);

    // If booking is not found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the current user owns this booking
    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this booking" });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "Bad Request",
        errors: { endDate: "End date cannot be on or before startDate" },
      });
    }
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
    }
    });


    // GET /reviews/current - Get all reviews by the current authenticated user
router.get('/reviews/current', requireAuth, async (req, res) => {
    const userId = req.user.id;

    try {
      // Find reviews by the current user, including data for User, Spot, and ReviewImages
      const userReviews = await Reviews.findAll({
        where: { userId },
        include: [
          {
            model: Users,
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: Spots,
            attributes: [
              'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'
            ],
            include: [
              {
                model: SpotImages,
                as: 'previewImage',
                attributes: ['url'],
                where: { preview: true },
                required: false // if spot doesn't have a prev image
              }
            ]
          },
          {
            model: ReviewImages,
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
          const previewImage = review.Spots.SpotImages && review.Spots.SpotImages[0]
            ? review.Spots.SpotImages[0].url
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
              id: review.Users.id,
              firstName: review.Users.firstName,
              lastName: review.Users.lastName,
            },
            Spot: {
              id: review.Spots.id,
              ownerId: review.Spots.ownerId,
              address: review.Spots.address,
              city: review.Spots.city,
              state: review.Spots.state,
              country: review.Spots.country,
              lat: review.Spots.lat,
              lng: review.Spots.lng,
              name: review.Spots.name,
              price: review.Spots.price,
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
  router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;

    try {
      // if the spot exists?
      const spot = await Spots.findByPk(spotId);

      if (!spot) {
        return res.status(404).json({
          message: "Spot couldn't be found",
          statusCode: 404,
        });
      }

      // Find all reviews for the given spotId
      const spotReviews = await Reviews.findAll({
        where: { spotId },
        include: [
          {
            model: Users,
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: ReviewImages,
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
            id: review.Users.id,
            firstName: review.Users.firstName,
            lastName: review.Users.lastName,
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
  router.put('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { review, stars } = req.body;
    const { user } = req;

    try {
      // Fetch the existing review by ID
      const existingReview = await Reviews.findByPk(reviewId);

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
