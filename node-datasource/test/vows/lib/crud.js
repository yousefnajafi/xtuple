/*jshint indent:2, curly:true eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true
white:true*/
/*global XT:true, _:true, console:true, XM:true, Backbone:true, require:true, assert:true,
setTimeout:true, clearTimeout: true, exports: true */

var _ = require("underscore"),
  assert = require("assert");

(function () {
  "use strict";

  var waitTime = 10000;

  /**
    Performs all the CRUD tests on the model.

    Note: This function assumes the `id` is fetched automatically.
    For models with manually created ids such as 'XM.UserAccount',
    create a topic manually.

    @param {String} modelName
    @param {createHash} Properties to pass into the creation of the model
    @param {updateHash} Properties to test updating
  */
  exports.testCrudOperations = function (modelName, createHash, updateHash) {
    var model;
    var context = {
      topic: function () {
        var that = this,
          timeoutId,
          auto_regex = XM.Document.AUTO_NUMBER + "|" + XM.Document.AUTO_OVERRIDE_NUMBER,
          initCallback = function (model, value) {
            if (model instanceof XM.Document && model.numberPolicy.match(auto_regex)) {
              // Check that the AUTO...NUMBER property has been set.
              if (model.get(model.documentKey) && model.id) {
                clearTimeout(timeoutId);
                model.off('change:' + model.documentKey, initCallback);
                model.off('change:id', initCallback);
                that.callback(null, model);
              }
            } else {
              clearTimeout(timeoutId);
              model.off('change:id', initCallback);
              that.callback(null, model);
            }
          };

        model = new XM[modelName]();

        model.on('change:id', initCallback);
        // Add an event handler when using a model with an AUTO...NUMBER.
        if (model instanceof XM.Document && model.numberPolicy.match(auto_regex)) {
          model.on('change:' + model.documentKey, callback);
        }
        model.initialize(null, {isNew: true});

        // If we don't hear back, keep going
        timeoutId = setTimeout(function () {
          console.log("timeout was reached");
          that.callback(null, model);
        }, waitTime);
      },
      'Status is `READY_NEW`': function (model) {
        assert.equal(model.getStatusString(), 'READY_NEW');
      },
      'ID is valid': function (model) {
        assert.isNumber(model.id);
      },
      'And then we can set the values': {
        topic: function (model) {
          model.set(createHash);
          return model;
        },
        'Last Error is null': function (model) {
          assert.isNull(model.lastError);
        },
        'And then we can save the values': {
          topic: function () {
            var that = this,
              success = function () {
                console.log("Success saving");
                that.callback(null, model);
              },
              error = function (error) {
                console.log("Error saving");
                that.callback(null, error);
              };

            model.save(null, {success: success, error: error});
          },
          'Status is `READY_CLEAN`': function (model) {
            assert.equal(model.getStatusString(), "READY_CLEAN");
          },
          'And the values are as we set them': function (model) {
            _.each(createHash, function (value, key) {
              assert.equal(model.get(key), value);
            });
          },
          'And then we can update the values': {
            topic: function () {
              model.set(updateHash);
              return model;
            },
            'The updated values have been updated': function (model) {
              _.each(_.extend(createHash, updateHash), function (value, key) {
                assert.equal(model.get(key), value);
              });
            },

            'And then we can save those update values': {
              topic: function () {
                var that = this,
                  success = function () {
                    that.callback(null, model);
                  },
                  error = function (error) {
                    that.callback(null, error);
                  };

                model.save(null, {success: success, error: error});
              },
              'Status is `READY_CLEAN`': function (model) {
                assert.equal(model.getStatusString(), "READY_CLEAN");
              },
              'And then we can delete the model': {
                topic: function () {
                  var that = this,
                    destroySuccess = function (model) {
                      that.callback(null, model);
                    },
                    destroyError = function (error) {
                      that.callback(null, error);
                    };

                  model.destroy({success: destroySuccess, error: destroyError});
                },
                'Status is `DESTROYED_CLEAN`': function (model) {
                  assert.equal(model.getStatusString(), 'DESTROYED_CLEAN');
                }
              }
            }
          }
        }
      }
    };
    return context;
  };
}());
