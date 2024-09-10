const express = require("express");
const { ReviewImages } = require("../../db/models");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");

// delete a review image
router.delete("/:imageId", requireAuth, async (req, res) => {
    // get the image id
    const imageId = req.params.imageId;
    // get the user id
    const userId = req.user.id
    try {

        // get the image
        const image = await ReviewImages.findByPk(imageId);
        // if the image does not exist
        if (!image) {
            return res.status(404).json({ message: "Review Image couldn't be found" });
        }

        // if the image belongs to the user
        if (image.userId !== userId) {
            return res.status(403).json({ message: "You do not have permission to delete this image" });
        }

        // delete the image
        await image.destroy();
        return res.status(200).json({ message: "Successfully deleted" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

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
    const review = await Reviews.findByPk(reviewId);
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
    const reviewImagesCount = await ReviewImages.count({
      where: { reviewId },
    });
    if (reviewImagesCount >= MAX_REVIEW_IMAGES) {
      return res.status(403).json({
        message: `Maximum number of images (${MAX_REVIEW_IMAGES}) for this review has been reached`,
        statusCode: 403,
      });
    }

    // Create the new image
    const newImage = await ReviewImages.create({
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

module.exports = router;
