const express = require("express");
const { Bookings, Spots, Reviews, ReviewImages } = require("../../db/models");
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


    // GET /reviews/current - Get all reviews by the current authenticated user
    router.get('/current', requireAuth, async (req, res) => {
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



// constant for the max num of images per review
const maxReviewImages = 10;

// POST /reviews/:id/images - Create new image for a review
router.post('/:id/images', requireAuth, async (req, res) => {
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
    const review = await Reviews.findByPk(reviewId);
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
    const reviewImagesCount = await ReviewImages.count({
      where: { reviewId },
    });
    if (reviewImagesCount >= maxReviewImages) {
      return res.status(403).json({
        message: `Maximum number of images (${maxReviewImages}) for this review has been reached`,
        statusCode: 403,
      });
    }
// Create new image
const newImage = await ReviewImages.create({
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

//delete a review
router.delete("/:reviewId", requireAuth, async (req, res) => {
  const reviewId = req.params.reviewId;
  const currentUserId = req.user.id;

  try {
    // Find the review by ID
    const review = await Reviews.findByPk(reviewId);

    // If the review is not found, return 404
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Check if the current user is the owner of the review
    if (review.userId !== currentUserId) {
      return res.status(403).json({ message: "Forbidden - You are not authorized to delete this review" });
    }

    // Delete the review
    await review.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
