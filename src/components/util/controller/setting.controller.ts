/* const newProfessionalReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user;

    const newReview = {
      userAuthId: id,
      ...req.body,
    };

    const review = await createProfessionalReview(newReview);

    const { bookingId } = newReview;

    await markBookingAsProfessionalReviewed(bookingId);

    res.status(201).json({
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
 */

export {};
