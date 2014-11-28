MethodData = new Mongo.Collection('method_data');
/*
 * Add query methods like this:
 *  MethodData.findPublic = function () {
 *    return MethodData.find({is_public: true});
 *  }
 */
 MethodData.allow({
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

MethodData.deny({
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