const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/pagination');

const paginate = async (model, query = {}, options = {}) => {
  // Use global defaults if not provided
  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : DEFAULT_PAGE;
  let limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : DEFAULT_LIMIT;

  // Enforce max limit
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const sort = options.sort || { createdAt: -1 };

  const total = await model.countDocuments(query);
  const results = await model
    .find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    count: results.length,
    data: results,
  };
};

module.exports = paginate;
