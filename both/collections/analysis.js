Analysis = new Mongo.Collection('analysis');
/*
 * Add query methods like this:
 *  Analysis.findPublic = function () {
 *    return Analysis.find({is_public: true});
 *  }
 */
 Analysis.allow({
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

Analysis.deny({
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