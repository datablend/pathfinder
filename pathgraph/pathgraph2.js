define(['jquery', 'd3', 'webcola', 'dagre', '../listeners', '../selectionutil', '../list/pathsorting', '../query/pathquery', '../config', '../view', './forcelayout', './layeredlayout'],
  function ($, d3, webcola, dagre, listeners, selectionUtil, pathSorting, pathQuery, config, View, ForceLayout, LayeredLayout) {
    'use strict';


    function PathGraphView() {
      View.call(this, "#pathgraph");
      this.grabHSpace = true;
      this.grabVSpace = true;
      this.layeredLayout = new LayeredLayout(this);
      this.forceLayout = new ForceLayout(this);


      this.currentGraphLayout = this.layeredLayout;
      this.paths = [];
    }

    PathGraphView.prototype = Object.create(View.prototype);


    PathGraphView.prototype.init = function () {

      View.prototype.init.call(this);
      var that = this;

      var nodeWidth = config.getNodeWidth();
      var nodeHeight = config.getNodeHeight();

      var svg = d3.select(this.parentSelector + " svg");

      this.textSizeDomElement = svg.append("text")
        .attr('class', "textSizeElement")
        .attr("x", 0)
        .attr("y", 0)
        .style("font", "10px sans-serif")
        .style("opacity", 0);

      svg.append("clipPath")
        .attr("id", "graphNodeClipPath")
        .append("rect")
        .attr("x", -nodeWidth / 2 + 3)
        .attr("y", -nodeHeight / 2)
        .attr("width", nodeWidth - 6)
        .attr("height", nodeHeight);


      var graphGroup = svg.append("g")
        .attr("class", "graph");

      graphGroup.append("g")
        .classed("edgeGroup", true);
      graphGroup.append("g")
        .classed("nodeGroup", true);

      $(window).on('resize.center', function (e) {
        if (that.currentGraphLayout === that.layeredLayout) {
          that.layeredLayout.centerGraph();
        } else {
          that.forceLayout.render(that.paths);
        }
      });

      selectionUtil.addListener("path", function (selectionType, source) {
        that.currentGraphLayout.onPathSelectionUpdate(selectionType, source);
      });


      listeners.add(function (query) {
        if (pathQuery.isRemoveFilteredPaths() || pathQuery.isRemoteQuery()) {
          that.currentGraphLayout.updateGraphToFilteredPaths();

          if (pathQuery.isRemoteQuery()) {
            for (var i = 0; i < that.paths.length; i++) {
              var path = that.paths[i];
              if (pathQuery.isPathFiltered(path.id)) {
                that.paths.splice(i, 1);
                i--;
              }
            }
          }
        } else {
          that.currentGraphLayout.updateFilter();
        }
      }, listeners.updateType.QUERY_UPDATE);
      listeners.add(function (remove) {
        if (remove) {
          that.currentGraphLayout.updateGraphToFilteredPaths();
        } else {
          that.currentGraphLayout.updateGraphToAllPaths();
        }
      }, listeners.updateType.REMOVE_FILTERED_PATHS_UPDATE);

      this.currentGraphLayout.init();

      $("#layeredLayout").on("click", function () {
        //that.currentGraphLayout.reset();
        that.currentGraphLayout.prepareLayoutChange();
        that.currentGraphLayout = that.layeredLayout;
        that.render(that.paths);
        that.updateViewSize();
      });

      $("#forceLayout").on("click", function () {
        //that.currentGraphLayout.reset();
        that.currentGraphLayout.prepareLayoutChange();
        that.currentGraphLayout = that.forceLayout;
        that.render(that.paths);
        that.updateViewSize();
      });
    };

    PathGraphView.prototype.getTextWidth = function (string) {

      this.textSizeDomElement
        .text(string);

      return this.textSizeDomElement.node().getBBox().width;
    };

    PathGraphView.prototype.reset = function () {
      this.paths = [];
      this.forceLayout.reset();
      this.layeredLayout.reset();

      var svg = d3.select("#pathgraph svg");

      svg.selectAll("g.graph")
        .remove();

      var graphGroup = svg.append("g")
        .attr("class", "graph");


      graphGroup.append("g")
        .classed("edgeGroup", true);
      graphGroup.append("g")
        .classed("nodeGroup", true);
    };

    PathGraphView.prototype.addPath = function (path) {
      this.paths.push(path);
      this.currentGraphLayout.addPath(path);
    };

    PathGraphView.prototype.render = function (paths) {
      this.paths = paths;
      this.currentGraphLayout.render(paths);
    };

    PathGraphView.prototype.getMinSize = function () {
      return this.currentGraphLayout.getMinSize();
    };

    PathGraphView.prototype.addNeighbor = function(source, neighbor) {
      this.currentGraphLayout.addNeighbor(source, neighbor);
    };

    return new PathGraphView();


  }
)
;
