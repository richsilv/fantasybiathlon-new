CrawlerMatrix = new Mongo.Collection('crawler_matrix');
/*
 * Add query methods like this:
 *  CrawlerMatrix.findPublic = function () {
 *    return CrawlerMatrix.find({is_public: true});
 *  }
 */

Schemas.CrawlerMatrix = new SimpleSchema({
  
});

CrawlerMatrix.allow({
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

CrawlerMatrix.deny({
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