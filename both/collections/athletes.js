Athletes = new Mongo.Collection('athletes');
/*
 * Add query methods like this:
 *  Athletes.findPublic = function () {
 *    return Athletes.find({is_public: true});
 *  }
 */
 Athletes.allow({
  insert: function (userId, doc) {
    return CollectionFunctions.isAdmin(userId);
  },

  update: function (userId, doc, fieldNames, modifier) {
    return CollectionFunctions.isAdmin(userId);
  },

  remove: function (userId, doc) {
    return CollectionFunctions.isAdmin(userId);
  }
});

Athletes.deny({
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

