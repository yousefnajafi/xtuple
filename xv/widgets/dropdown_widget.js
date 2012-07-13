/*jshint node:true, indent:2, curly:true eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global XT:true, enyo:true, _:true */
(function () {
  "use strict";

  // XXX again I'm doing these widgets as wrappers instead of subclassing the kind
  // this is worth a conversation

  enyo.kind({
    name: "XV.DropdownWidget",
    kind: enyo.Control,
    events: {
      onFieldChanged: ""
    },
    published: {
      modelType: null
    },
    components: [{
      kind: "onyx.InputDecorator",
      style: "height: 14px;",
      components: [
        {kind: "onyx.PickerDecorator", components: [
          {},
          // FIXME: onblur is not the event we want here, but onselect and
          // onchange don't work. Overriding the picker's onselected
          // function didn't work either, because the "model update" event
          // was being thrown not just by manual changes but in the
          // initialization change of the widget
          { kind: "onyx.Picker", name: "dropdown", onblur: "doDropdownChanged" }
        ]}
      ]
    }],
    /**
     * A convenience function so that this object can be treated generally like an input
     */
    setValue: function (value) {
      // not sure why this cleaner approach doesn't work
      //var tempSelected = _.find(this.$.dropdown.getComponents(), function (component) {
      //  component.value === value;
      //});
      //this.$.dropdown.setSelected(tempSelected);

      for (var i = 0; i < this.$.dropdown.getComponents().length; i++) {
        if (this.$.dropdown.getComponents()[i].value === value) {
          this.$.dropdown.setSelected(this.$.dropdown.getComponents()[i]);
          break;
        }
      }
    },
    /**
     * A convenience function so that this object can be treated generally like an input
     */
    getValue: function () {
      return this.$.dropdown.getSelected() ? this.$.dropdown.getSelected().value : undefined;
    },
    /**
     * render this object onto the name field
     */
    modelTypeChanged: function () {

      this.$.dropdown.createComponent({ idValue: "", content: "" });
      var collection = XT.getObjectByName(this.modelType);
      for (var i = 0; i < collection.models.length; i++) {
        var statusId = collection.models[i].get("status");
        var statusString = collection.models[i].get("statusString");
        this.$.dropdown.createComponent({ value: statusId, content: statusString });
      }
      this.$.dropdown.render();
    },
    doDropdownChanged: function (inSender, inEvent) {
      this.doFieldChanged(this, inEvent); // pass this up the stream
      return true;
    }
  });
}());
