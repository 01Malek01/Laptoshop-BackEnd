const Laptop = require('../models/laptopModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllLaptops = catchAsync(async (req, res, next) => {
  let query = Laptop.find();

  const features = new APIFeatures(query, req.query).filter().sort().paginate();

  const laptops = await features.query;

  res.status(200).json({
    status: 'success',
    results: laptops.length,
    data: {
      laptops,
    },
  });
});

exports.postLaptop = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'fail',
      message: 'you are not logged in',
    });
  }
  const laptop = await Laptop.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      laptop,
    },
  });
});

exports.getLaptop = catchAsync(async (req, res, next) => {
  const laptop = await Laptop.findById(req.params.id).populate({
    path: 'reviews',
    select: 'rating comment userId -productId -_id ',
  });
  res.status(200).json({
    status: 'success',
    data: {
      laptop,
    },
  });
});

exports.updateLaptop = catchAsync(async (req, res, next) => {
  const laptop = await Laptop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      laptop,
    },
  });
});

exports.deleteLaptop = catchAsync(async (req, res, next) => {
  const laptop = await Laptop.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// exports.getLaptopStats = catchAsync(async (req, res, next) => {
//   const stats = await Laptop.aggregate([

//     {
//       $group: {
//         id: '$processor',
//         nLaptops: { $sum: 1 },
//         avgRating: { $avg: '$rating' },
//         minRating: { $min: '$rating' },
//         maxRating: { $max: '$rating' },
//       },
//     },
//   ]);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats,
//     },
//   });
// });
