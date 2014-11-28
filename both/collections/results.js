Results = new Mongo.Collection('results');
/*
 * Add query methods like this:
 *  Results.findPublic = function () {
 *    return Results.find({is_public: true});
 *  }
 */
 Results.allow({
  insert: function (userId, doc) {
    return CollectionFunction.isAdmin(userId);
  },

  update: function (userId, doc, fieldNames, modifier) {
    return CollectionFunction.isAdmin(userId);
  },

  remove: function (userId, doc) {
    return CollectionFunction.isAdmin(userId);
  }
});

Results.deny({
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