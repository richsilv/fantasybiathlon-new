MissingQueries = new Mongo.Collection('missing_queries');
/*
 * Add query methods like this:
 *  MissingQueries.findPublic = function () {
 *    return MissingQueries.find({is_public: true});
 *  }
 */
MissingQueries.allow({
  insert: function (userId, doc) {
    return true;
  },

  update: function (userId, doc, fieldNames, modifier) {
    return true;
  },

  remove: function (userId, doc) {
    return true;
  }
});

MissingQueries.deny({
  insert: function (userId, doc) {
    return false;
  },

  update: function (userId, doc, fieldNames, modifier) {
    return false;
  },

  remove: function (userId, doc) {
    return false;
  }
});