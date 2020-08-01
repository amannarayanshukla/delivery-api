'use strict';
const {asyncHandler} = require('../utils/asyncHandler')
const pagination = (req, res) => (model) => async (query) => {

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = {};

    result.data = await model.aggregate([
        {
            "$facet": {
                "data": [
                    { "$match": query },
                    { "$skip": startIndex },
                    { "$limit": limit }
                ],
                "totalCount": [
                    { "$match": query },
                    { "$group": {
                            "_id": null,
                            "count": { "$sum": 1 }
                        }
                    }
                ]
            }
        }
    ])

    if (endIndex < result.data[0].totalCount[0].count) {
        result.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0 && startIndex < result.data[0].totalCount[0].count) {
        result.prev = {
            page: page - 1,
            limit
        };
    }
    return result;
};

module.exports = {
    pagination
};
