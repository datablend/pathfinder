define(['../hierarchyelements', '../listeners', '../list/pathsorting', '../query/pathquery', '../config', '../setinfo'],
  function (hierarchyElements, listeners, pathSorting, pathQuery, config, setInfo) {

    var HierarchyElement = hierarchyElements.HierarchyElement;

    var LEVEL1_HIERARCHY_ELEMENT_HEIGHT = 18;
    var HIERARCHY_ELEMENT_HEIGHT = 12;

    function BaseHierarchyElement(parentElement) {
      HierarchyElement.call(this, parentElement);
    }

    BaseHierarchyElement.prototype = Object.create(HierarchyElement.prototype);
    BaseHierarchyElement.prototype.getBaseHeight = function () {
      return HIERARCHY_ELEMENT_HEIGHT;
    };

    function Level1HierarchyElement(parentElement) {
      HierarchyElement.call(this, parentElement);
    }

    Level1HierarchyElement.prototype = Object.create(HierarchyElement.prototype);
    Level1HierarchyElement.prototype.getBaseHeight = function () {
      return LEVEL1_HIERARCHY_ELEMENT_HEIGHT;
    };

    function NodeWrapper(parentElement, node) {
      BaseHierarchyElement.call(this, parentElement);
      this.id = node.id;
      this.node = node;
      this.pathIds = [];
    }

    NodeWrapper.prototype = Object.create(BaseHierarchyElement.prototype);

    NodeWrapper.prototype.addPath = function (path) {
      if (this.pathIds.indexOf(path.id) === -1) {
        this.pathIds.push(path.id);
      }
    };

    NodeWrapper.prototype.removePath = function (path) {
      var index = this.pathIds.indexOf(path.id);
      if (index !== -1) {
        this.pathIds.splice(index, 1);
      }
    };

    NodeWrapper.prototype.onDoubleClick = function () {
      pathSorting.sortingManager.addOrReplace(pathSorting.sortingStrategies.getNodePresenceStrategy([this.node.id]));
      listeners.notify(pathSorting.updateType, pathSorting.sortingManager.currentComparator);
    };

    NodeWrapper.prototype.getLabel = function () {
      return this.node.properties[config.getNodeNameProperty(this.node)];
    };

    NodeWrapper.prototype.supportsNodeFilter = function() {
      return true;
    };

    NodeWrapper.prototype.getNodeConstraintType = function() {
      return "name";
    };

    NodeWrapper.prototype.getFilterText = function() {
      return this.getLabel();
    };

    NodeWrapper.prototype.isFiltered = function () {
      return pathQuery.isNodeFiltered(this.node.id);
    };

    function NodeTypeWrapper(parentElement, type) {
      this.id = type;
      BaseHierarchyElement.call(this, parentElement);
      this.type = type;
      this.nodeWrapperDict = {};
      this.pathIds = [];
    }

    NodeTypeWrapper.prototype = Object.create(BaseHierarchyElement.prototype);

    NodeTypeWrapper.prototype.addNode = function (node, path) {
      var nodeWrapper = this.nodeWrapperDict[node.id.toString()];

      if (this.pathIds.indexOf(path.id) === -1) {
        this.pathIds.push(path.id);
      }

      if (typeof nodeWrapper === "undefined") {
        nodeWrapper = new NodeWrapper(this, node);
        this.nodeWrapperDict[node.id.toString()] = nodeWrapper;
        this.children.push(nodeWrapper);
      }
      nodeWrapper.addPath(path);
    };

    NodeTypeWrapper.prototype.removeNode = function (node) {
      var nodeWrapper = this.nodeWrapperDict[node.id.toString()];
      if (typeof nodeWrapper === "undefined") {
        return;
      }
      delete this.nodeWrapperDict[node.id.toString()];

      var index = this.children.indexOf(nodeWrapper);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    };

    NodeTypeWrapper.prototype.getLabel = function() {
      return this.type;
    };

    NodeTypeWrapper.prototype.isFiltered = function() {
      for(var i = 0; i < this.children.length; i++) {
        if(!this.children[i].isFiltered()) {
          return false;
        }
      }

      return true;
    };

    NodeTypeWrapper.prototype.supportsNodeFilter = function() {
      return true;
    };

    NodeTypeWrapper.prototype.getNodeConstraintType = function() {
      return "type";
    };

    NodeTypeWrapper.prototype.getFilterText = function() {
      return this.type;
    };

    NodeTypeWrapper.prototype.removePath = function (path) {
      var index = this.pathIds.indexOf(path.id);
      if (index !== -1) {
        this.pathIds.splice(index, 1);
      }

      this.children.forEach(function (child) {
        child.removePath(path);
      });
    };

    function SetWrapper(parentElement, setId) {
      this.id = setId;
      BaseHierarchyElement.call(this, parentElement);
      this.setId = setId;
      this.pathIds = [];
      //this.nodeIds = [];
      //this.edgeIds = [];
    }

    SetWrapper.prototype = Object.create(BaseHierarchyElement.prototype);

    SetWrapper.prototype.addNode = function (node, path) {
      if (this.pathIds.indexOf(path.id) === -1) {
        this.pathIds.push(path.id);
      }

      //if (this.nodeIds.indexOf(node.id) === -1) {
      //  this.nodeIds.push(node.id);
      //}
    };

    SetWrapper.prototype.removePath = function (path) {
      var index = this.pathIds.indexOf(path.id);
      if (index !== -1) {
        this.pathIds.splice(index, 1);
      }
    };

    SetWrapper.prototype.addEdge = function (edge, path) {
      if (this.pathIds.indexOf(path.id) === -1) {
        this.pathIds.push(path.id);
      }

      //if (this.edgeIds.indexOf(edge.id) === -1) {
      //  this.edgeIds.push(edge.id);
      //}
    };

    SetWrapper.prototype.isFiltered = function () {
      return pathQuery.isNodeSetFiltered(this.setId) && pathQuery.isEdgeSetFiltered(this.setId);
    };

    SetWrapper.prototype.onDoubleClick = function () {
      pathSorting.sortingManager.addOrReplace(pathSorting.sortingStrategies.getSetPresenceStrategy([this.setId]));
      listeners.notify(pathSorting.updateType, pathSorting.sortingManager.currentComparator);
    };

    SetWrapper.prototype.getLabel = function () {
      return setInfo.getSetLabel(this.setId);
    };

    SetWrapper.prototype.supportsNodeFilter = function() {
      return true;
    };

    SetWrapper.prototype.getNodeConstraintType = function() {
      return "set";
    };

    SetWrapper.prototype.getFilterText = function() {
      return this.setId;
    };

    function SetTypeWrapper(parentElement, type) {
      this.id = type;
      BaseHierarchyElement.call(this, parentElement);
      this.type = type;
      this.setWrapperDict = {};
      this.pathIds = [];
      //this.nodeIds = [];
      //this.edgeIds = [];
    }


    SetTypeWrapper.prototype = Object.create(BaseHierarchyElement.prototype);

    SetTypeWrapper.prototype.addNode = function (setId, node, path) {
      var setWrapper = this.setWrapperDict[setId.toString()];

      if (this.pathIds.indexOf(path.id) === -1) {
        this.pathIds.push(path.id);
      }

      if (typeof setWrapper === "undefined") {
        setWrapper = new SetWrapper(this, setId);
        this.setWrapperDict[setId.toString()] = setWrapper;
        this.children.push(setWrapper);
      }
      setWrapper.addNode(node, path);
    };

    SetTypeWrapper.prototype.getLabel = function() {
      return config.getSetTypeFromSetPropertyName(this.type);
    };

    SetTypeWrapper.prototype.supportsNodeFilter = function() {
      return false;
    };

    SetTypeWrapper.prototype.isFiltered = function() {
      for(var i = 0; i < this.children.length; i++) {
        if(!this.children[i].isFiltered()) {
          return false;
        }
      }

      return true;
    };

    SetTypeWrapper.prototype.removeSet = function (setId) {
      var setWrapper = this.setWrapperDict[setId.toString()];
      if (typeof setWrapper === "undefined") {
        return;
      }
      delete this.setWrapperDict[setId.toString()];

      var index = this.children.indexOf(setWrapper);
      if (index !== -1) {
        this.children.splice(index, 1);
      }

      //var pathsToRemove = [];
      //var that = this;
      //
      //this.pathIds.forEach(function (pathId) {
      //  var removePath = true;
      //  for (var i = 0; i < that.children.length; i++) {
      //    var pathWrapper = that.children[i];
      //    if (pathWrapper.pathIds.indexOf(pathId) !== -1) {
      //      removePath = false;
      //    }
      //  }
      //
      //  if (removePath) {
      //    pathsToRemove.push(pathId);
      //  }
      //});
      //
      //pathsToRemove.forEach(function(pathId) {
      //  var index = that.pathIds.indexOf(pathId);
      //  if (index !== -1) {
      //    that.pathIds.splice(index, 1);
      //  }
      //});
    };

    SetTypeWrapper.prototype.removePath = function (path) {
      var index = this.pathIds.indexOf(path.id);
      if (index !== -1) {
        this.pathIds.splice(index, 1);
      }

      this.children.forEach(function (child) {
        child.removePath(path);
      });
    };

    SetTypeWrapper.prototype.addEdge = function (setId, edge, path) {
      var setWrapper = this.setWrapperDict[setId.toString()];

      if (this.pathIds.indexOf(path.id) === -1) {
        this.pathIds.push(path.id);
      }

      if (typeof setWrapper === "undefined") {
        setWrapper = new SetWrapper(this, setId);
        this.setWrapperDict[setId.toString()] = setWrapper;
        this.children.push(setWrapper);
      }
      setWrapper.addEdge(edge, path);
    };

    return {
      NodeWrapper: NodeWrapper,
      NodeTypeWrapper: NodeTypeWrapper,
      SetWrapper: SetWrapper,
      SetTypeWrapper: SetTypeWrapper,
      Level1HierarchyElement: Level1HierarchyElement
    }

  });
