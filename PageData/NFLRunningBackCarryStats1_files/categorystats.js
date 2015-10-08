/*globals YUI, window, console */

/**
 * The player-category module handles setting selectedIndex in the player category in dropdown element.
 *
 * @module player-category
 */
YUI.add("player-category", function (Y) {
  
  "use strict";  

  var PlayerCategory = Y.Base.create("player-category", Y.Base, [], {
    
    initializer : function() {
      var node = this.get("statisticCategoryNode");
      var category = this.get("statisticCategory");
      if (category !== "") {
        node.set("value", category);
      }
    },    
    destructor : function() {}    
  }, 
  {
    ATTRS : {
      statisticCategoryNode : {
        value : null
      },
      statisticCategory : {
        value : "null"
      }
    }
  });

  PlayerCategory.NAME = "playercategory";
  Y.namespace('NFL').PlayerCategory = PlayerCategory;

  }, "3.4.1", {
    requires: [
      "base",
      "node-base"
    ],
    group: "nfl"
});

/**
 * The player-position-category module handles setting selectedIndex in the player position category in dropdown element.
 *
 * @module player-position-category
 */
YUI.add("player-position-category", function (Y) {
  
  "use strict";  

  var PlayerPositionCategory = Y.Base.create("player-position-category", Y.Base, [], {
    
    initializer : function() {
      var node = this.get("statisticPositionCategoryNode");
      var category = this.get("statisticPositionCategory");
      if (category !== "") {
        node.set("value", category);
      }
    },    
    destructor : function() {}    
  }, 
  {
    ATTRS : {
      statisticPositionCategoryNode : {
        value : null
      },
      statisticPositionCategory : {
        value : "null"
      }
    }
  });

  PlayerPositionCategory.NAME = "playerpositioncategory";
  Y.namespace('NFL').PlayerPositionCategory = PlayerPositionCategory;

  }, "3.4.1", {
    requires: [
      "base",
      "node-base"
    ],
    group: "nfl"
});

/**
 * The team-category module performs the following tasks:
 *
 * <ol>
 *  <li>Toggles visibility of stats category selection based on offense or defense role.</li>
 *  <li>Presets the dropdown selection to original parameters, in case the window is reloaded.</li>
 * </ol>
 *
 * @module team-category
 */
YUI.add("team-category", function (Y) {

   "use strict";  

   var TeamCategory = Y.Base.create("team-category", Y.Base, [], {

     initializer : function() {
       // show the category dropdown contextual to the role
       var roleNode = this.get("roleNode");
       var currentRole = this.get("currentRole");
       if (currentRole) roleNode.set("value", currentRole);
       roleNode.on("change", this._switchStatisticCategoryHandler, this);
       this._switchStatisticCategoryHandler({ target : roleNode });

     },    

     destructor : function() {
       
     },

     _switchStatisticCategoryHandler : function(e) {
       var role = e.target.get("value");
       var defensiveCategoryNode = this.get("defensiveCategoryNode");       
       var offensiveCategoryNode = this.get("offensiveCategoryNode");
       if (role === "TM") { // offensive
         offensiveCategoryNode.show();
         defensiveCategoryNode.hide();
         defensiveCategoryNode.set("value", "null");
         offensiveCategoryNode.set("value", this.get("offensiveStatisticCategory"));
       }
       else if (role === "OPP") { // defensive
         offensiveCategoryNode.hide();
         offensiveCategoryNode.set("value", "null");
         defensiveCategoryNode.show();
         defensiveCategoryNode.set("value", this.get("defensiveStatisticCategory"));         
       }
     }
   },
   {
     ATTRS : {
				roleNode : {
				  value : null
				},
				roleTypes : {
				  value : ["TM", "OPP"]
				},
				currentRole : {
				  value : undefined
				},
				defensiveCategoryNode : {
				  value : null
				},
				offensiveCategoryNode : {
				  value : null
				},
				offensiveStatisticCategory : {
				  value : "null",
				  validator : function(v) {
				    var valid = (v !== "") ? true : false;
				    return valid;
				  }
				},
				defensiveStatisticCategory : {
				  value : "null",
				  validator : function(v) {
				    var valid = (v !== "he") ? true : false;
				    return valid;
				  }
				}
     }
   });

   TeamCategory.NAME = "teamcategory";
   Y.namespace('NFL').TeamCategory = TeamCategory;

 }, "3.4.1", {
   requires: [
     "base",
     "node"
   ],
   group: "nfl"
});


/**
 * Enables/Disables the experience dropdown node and sets boolean value to 
 * archive node based on the season selected.
 *
 * @module experience-limiter
 */
YUI.add("experience-limiter", function(Y){
  
  "use strict";  

  var ExperienceLimiter = Y.Base.create("experience-limiter", Y.Base, [], {
    
    initializer : function() {
      var node = this.get("seasonNode");
      node.on("change", this._limitExperience, this);        

      // Reset the change node where it should.
      var defaultOptionNode = node.one("option[selected=selected]");
      if (defaultOptionNode) node.set("value", defaultOptionNode.get("value"));

      // call it first time around.
      this._limitExperience();
    },

    _limitExperience : function(e) {
      var experienceNode = this.get("experienceNode"),
          archiveNode = this.get("archiveNode"),
          seasonNode = this.get("seasonNode"),
          thresholdYear = this.get("thresholdYear"),
          season = parseInt(seasonNode.get("value"), 10);

      if (Y.Lang.isNumber(season)) {
        if (season < thresholdYear) {          
          experienceNode.set("value", "null");
          experienceNode.set("disabled", true);
        } else {
          experienceNode.set("disabled", false);
        }
        archiveNode.set("value", (season <  this.get("currentSeason")));
      }
    },
    destructor : function() {}    
  }, 
  {
    ATTRS : {      
			seasonNode : {
			  value : null
			},			
			experienceNode : {
			  value : null			  
		  },
			archiveNode : {
			  value : null
		  },
      thresholdYear : {
        value : 1991,
			  validator : function(v) {
			    var valid = Y.Lang.isNumber(v) ? true : false;
			    return valid;
			  }        
      },
      currentSeason : {
        value : new Date().getFullYear(),
			  validator : function(v) {
			    var valid = Y.Lang.isNumber(v) ? true : false;
			    return valid;
			  }        
      }
    }
  });

  ExperienceLimiter.NAME = "experiencelimiter";
  Y.namespace('NFL').ExperienceLimiter = ExperienceLimiter;

  }, "3.4.1", {
    requires: [
      "base",
      "node-base"
    ],
    group: "nfl"  
});

/**
 * The category-stats-base module peforms the following tasks on domready:
 *
 * <ol>
 *  <li>Sets the stats table label</li>
 *  <li>Toggles visibility of years if the offensive line category was chosen.</li> 
 *  <li>Toggles visibility of offsensive line category based on season selection</li>
 * </ol>
 *
 * @module category-stats-loader
 */
YUI.add("category-stats-base", function (Y) {
  
  "use strict";  

  var CategoryStatsBase = Y.Base.create("category-stats-base", Y.Base, [], {
    
    initializer : function() {
      this._setTableLabel();      
      if (this.get("tabSequenceNumber") === 2) {
        var offensiveCategoryNode = this.get("offensiveCategoryNode"),
            seasonNode            = this.get("seasonNode"),
            seasonTypeNode        = this.get("seasonTypeNode");

        // Need to keep track of the default options listing of these dropdowns
        // Chrome, IE cannot 'hide' option tags like firefox can, they need to be restored
        // from this default list.
        Y.each([ offensiveCategoryNode, seasonNode, seasonTypeNode], function(node){
          node.setData('defaultContent', node.getContent());
          node.setData('defaultValue', node.get("value"));
        });

        this._selectReset(offensiveCategoryNode);
        offensiveCategoryNode.on("change", this._seasonOptionsFilter, this);
        seasonNode.on("change", this._offensiveCategoryFilter, this);
        this._seasonOptionsFilter();
        this._offensiveCategoryFilter();
      }
    },
  
    destructor : function() {},
    
    _setTableLabel : function() {
      var tab  = parseInt(this.get("tabSequenceNumber"), 10),
          role = this.get("role"),
          labelNode = this.get("tableLabelNode"),
          dropdownNode = null,
          optionNode = null;
  
      switch(tab) {
        case 0:
          dropdownNode = this.get("statisticCategoryNode");
          break;
        case 1:
          dropdownNode = this.get("statisticPositionCategoryNode");
          break;
        case 2:
          if (role) {
            if (role == "TM") { // offense
              dropdownNode = this.get("offensiveCategoryNode");            
            } 
            else if (role == "OPP") { // defense
              dropdownNode = this.get("defensiveCategoryNode");            
            }
          }
          break;
      }
      // set the tabel label
      if (dropdownNode) {
        optionNode = dropdownNode.one("option[selected=selected]");
        if (optionNode) {
          labelNode.setContent(optionNode.getContent());
        }
      }
    },

    _seasonOptionsFilter : function() {
      var offensiveCategoryNode = this.get("offensiveCategoryNode"),
          seasonNode            = this.get("seasonNode"),
          seasonTypeNode        = this.get("seasonTypeNode"),
          offensiveCategory     = offensiveCategoryNode.get("value");

      if (offensiveCategory == "OFFENSIVE_LINE") {
        seasonNode.all("option").each(function(optionNode){
          if (parseInt(optionNode.get("value"), 10) < 2009) optionNode.remove();
        });
        if (parseInt(seasonNode.get("value"), 10) < 2009) seasonNode.set("value", "null");
        if (seasonTypeNode.get("value") == "PRE") seasonTypeNode.set("value", "null");
        seasonTypeNode.one("option[value=PRE]").remove();
      } 
      else {
        Y.each([seasonNode, seasonTypeNode], function(node){
          node.setContent(node.getData("defaultContent"));
          node.set("value", node.getData("defaultValue"));
        });        
      }
    },

    _offensiveCategoryFilter : function() {
      var offensiveCategoryNode = this.get("offensiveCategoryNode"),
          seasonNode            = this.get("seasonNode");      
      
      if (parseInt(seasonNode.get("value"), 10) < 2009) {
        offensiveCategoryNode.one("option[value=OFFENSIVE_LINE]").remove();
      } else {
        offensiveCategoryNode.setContent(offensiveCategoryNode.getData("defaultContent"));
        offensiveCategoryNode.set("value", offensiveCategoryNode.getData("defaultValue"));        
      }
            
    },

    _selectReset : function(node) {
      node.set("value", node.one("option[selected=selected]").get("value"));      
    }
  }, 
  {
    ATTRS : {
      tableLabelNode : {
        value : null
      },
      tabSequenceString : {
        value : "0",
			  validator : function(v) {
			    var valid = Y.Lang.isNumber(parseInt(v, 10)) ? true : false;
			    return valid;
			  }        
      },
      tabSequenceNumber : {
        valueFn : function() {
          return parseInt(this.get("tabSequenceString"), 10);
        }
      },
      role : {
        value : undefined
      },
      statisticCategoryNode : {
        value : null
      },
      statisticPositionCategoryNode : {
        value : null
      },
      offensiveCategoryNode : {
        value : null        
      },
      defensiveCategoryNode : {
        value : null
      },
      seasonNode : {
        value : null
      },
      seasonTypeNode : {
        value :null
      }      
    }
  });

  CategoryStatsBase.NAME = "categorystatsbase";
  Y.namespace('NFL').CategoryStatsBase = CategoryStatsBase;

  }, "3.4.1", {
    requires: [
      "node",
      "base"
    ],
    group: "nfl"
});
