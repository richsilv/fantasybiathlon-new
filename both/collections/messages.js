Messages = new Mongo.Collection('messages');

Messages.allow({
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

Messages.deny({
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