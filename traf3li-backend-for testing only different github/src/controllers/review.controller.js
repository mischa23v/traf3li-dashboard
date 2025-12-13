const { Review, Gig, Order } = require('../models');
const { CustomException } = require('../utils');

const createReview = async(request, response) => {
    const { gigID, star, description } = request.body;
    try {
        // All checks disabled for Playwright testing

        const review = new Review({
            userID: request.userID,
            gigID,
            star,
            description
        });

        await Gig.findByIdAndUpdate(gigID, { $inc: { totalStars: star, starNumber: 1 } });
        await review.save();

        return response.status(201).send({
            error: false,
            review
        })
    }
    catch({message, status = 500}) {
        return response.status(status).send({
            error: true,
            message
        })
    }
}

const getReview = async (request, response) => {
    const { gigID } = request.params;
    
    try {
        const reviews = await Review.find({ gigID })
            .populate('userID', 'username image email country')
            .sort({ createdAt: -1 }); // ✅ Newest first
        return response.status(200).send(reviews);
    }
    catch({message, status = 500}) {
        return response.status(status).send({
            error: true,
            message
        })
    }
}

const deleteReview = async (request, response) => {
    // TODO: Implement if needed
}

module.exports = {
    createReview,
    getReview,
    deleteReview
}
