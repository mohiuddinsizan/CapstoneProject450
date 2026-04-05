const accessService = require('../services/access.service');

async function decision(req, res, next) {
  try {
    const result = await accessService.decision(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  decision
};