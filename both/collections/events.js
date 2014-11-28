Events = new Mongo.Collection('events');
/*
 * Add query methods like this:
 *  Events.findPublic = function () {
 *    return Events.find({is_public: true});
 *  }
 */
 Events.allow({
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

Events.deny({
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