/*****************************************************************************/
/* MethodData Publish Functions
/*****************************************************************************/

Meteor.publish('method_data', function () {
  return MethodData.find();
});