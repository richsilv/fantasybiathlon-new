Races = new Mongo.Collection('races');
/*
 * Add query methods like this:
 *  Races.findPublic = function () {
 *    return Races.find({is_public: true});
 *  }
 */
 Races.allow({
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

Races.deny({
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