/**
 * Created by Christian on 11.12.2014.
 */
require(['jquery', 'd3', './listeners', './listview', './setlist', './overviewgraph', './setinfo',  'font-awesome'],
  function ($, d3, listeners, listView, setList, overviewGraph, setInfo) {
    'use strict';

    //var jsonPaths = require('./testpaths1.json');

    //TODO: fetch amount of sets from server


    $(document).ready(function () {


        overviewGraph.init();
        listView.init();
        //setList.init();


        //  $.ajax({
        //
        //    // The 'type' property sets the HTTP method.
        //    // A value of 'PUT' or 'DELETE' will trigger a preflight request.
        //    //type: 'POST',
        //    type: 'GET',
        //
        //    // The URL to make the request to.
        //    url: 'http://localhost:7474/db/data/',
        //    //url: 'http://localhost:7474/db/data/ext/FindShortestPath/graphdb/get_shortest_path',
        //
        //    accepts: 'application/json',
        //
        //    success: function (response) {
        //      d3.select("body").append("p").text(response);
        //    },
        //
        //    error: function (response) {
        //      var x = 2
        //    }
        //  });

        //console.time("time")
        //
        //$.ajax({
        //
        //  // The 'type' property sets the HTTP method.
        //  // A value of 'PUT' or 'DELETE' will trigger a preflight request.
        //  //type: 'POST',
        //  type: 'POST',
        //
        //  // The URL to make the request to.
        //  //url: 'http://localhost:7474/db/data/ext/KShortestPaths/graphdb/kShortestPaths',
        //  url: '/api/pathway/setinfo',
        //
        //  accepts: 'application/json',
        //
        //  // The 'contentType' property sets the 'Content-Type' header.
        //  // The JQuery default for this property is
        //  // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
        //  // a preflight. If you set this value to anything other than
        //  // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
        //  // you will trigger a preflight request.
        //  contentType: 'application/json',
        //  data: "{\"sets\":[\"hsa00310\", \"hsa00330\"]}",
        //
        //  //data: '{"source":"http://localhost/:7474/db/data/node/15991", ' +
        //  //'"target":"http://localhost/:7474/db/data/node/1713", ' +
        //  //'"k":"3", ' +
        //  //'"costFunction":"function getCost(properties) {return 1.0}", ' +
        //  //'"ignoreDirection":"false"}',
        //  //data: '{"node_from": "/node/116", "node_to": "/node/92", "relationship_types": ["PATHWAY_EDGE"], "relationship_costs": [1.0], "only_one_route": true, "soft_timeout": 5000, "max_cost": 1000000.0 }',
        //
        //  //xhrFields: {
        //  // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
        //  // This can be used to set the 'withCredentials' property.
        //  // Set the value to 'true' if you'd like to pass cookies to the server.
        //  // If this is enabled, your server must respond with the header
        //  // 'Access-Control-Allow-Credentials: true'.
        //  //withCredentials: false
        //  //},
        //
        //  //headers: {
        //  // Set any custom headers here.
        //  // If you set any non-simple headers, your server must include these
        //  // headers in the 'Access-Control-Allow-Headers' response header.
        //  //},
        //
        //  success: function (response) {
        //
        //    console.timeEnd("time")
        //    var paths = JSON.parse(response);
        //
        //    //var strp = paths.toString();
        //
        //    loadPaths(paths);
        //
        //    //if (paths.length > 0) {
        //    //
        //    //  renderPaths(svg, paths);
        //    //
        //    //  var firstPath = paths[0];
        //    //  var firstNode = firstPath.nodes[0];
        //    //  var lastNode = firstPath.nodes[firstPath.nodes.length - 1];
        //    //
        //    //  var pathGraph = getGraphFromPaths(paths);
        //    //
        //    //  renderGraph(svg2, pathGraph, firstNode, lastNode);
        //    //}
        //  },
        //
        //  error: function (response) {
        //    // Here's where you handle an error response.
        //    // Note that if the error was due to a CORS issue,
        //    // this function will still fire, but there won't be any additional
        //    // information about the error.
        //    var x = 2
        //  }
        //});

        //$.ajax({
        //  type: 'GET',
        //  url: '/api/pathway/summary',
        //  accepts: 'application/json',
        //
        //  success: function (response) {
        //
        //    var summaryData = JSON.parse(response);
        //
        //    d3.selectAll("body p")
        //      .data(summaryData)
        //      .enter()
        //      .append("p")
        //      .text(function (d) {
        //        return d[0].toString() + ": " + d[1].toString();
        //      });
        //  },
        //
        //  error: function (response) {
        //  }
        //});

        //$.getJSON("/api/pathway/setinfo", {sets:"tololo"}, function (paths) {
        //  loadPaths(paths);
        //} );

        var selectPaths = $('<select>').prependTo('#listView')[0];

        $(selectPaths).append($("<option value='testpaths1.json'>20 paths from node 1800 to node 1713</option>"));
        $(selectPaths).append($("<option value='testpaths2.json'>50 paths from node 1800 to node 1713</option>"));
        $(selectPaths).append($("<option value='testpaths3.json'>50 paths from node 5 to node 9999</option>"));
        $(selectPaths).append($("<option value='testpaths4.json'>20 paths from node 780 to node 5395</option>"));
        $(selectPaths).on("change", function () {
          $.getJSON(this.value, function (paths) {
            loadPaths(paths);
          });
        });

        $('#submit').on('click', function() {
          var s= $('#from_node').val();
          var t= $('#to_node').val();
          var k = $('#at_most_k').val();
          var $this = $(this).attr({
            disabled: 'disabled'
          }).html('<i class="fa fa-spinner fa-pulse"></i>');
          searchPaths(s, t, k, function(path) {
            console.log('got path',path);
          }).then(function (paths) {
            paths = JSON.parse(paths);
            console.log('got paths',paths);
            $this = $this.attr({
              disabled: null
            }).text('Search');
            loadPaths(paths);
          });
        });

        $.getJSON("testpaths1.json", function (paths) {
          loadPaths(paths);
        });

        function loadPaths(paths) {

          for (var i = 0; i < paths.length; i++) {
            paths[i].id = i;
          }

          listeners.clear(listeners.updateType.PATH_SELECTION);
          listeners.clear(listeners.updateType.SET_INFO_UPDATE);


          if (paths.length > 0) {
            var allSets = [];
            var setDict = {};

            paths.forEach(function (path) {
              addPathSets(path);

              path.sets.forEach(function (s) {
                var setExists = setDict[s.id];
                if (!setExists) {
                  allSets.push(s.id);
                  setDict[s.id] = true;
                }
              });

            });




            listView.render(paths);
            //setList.render(paths);

            overviewGraph.render(paths);

            setInfo.fetch(allSets);

            //$.ajax({
            //  type: 'POST',
            //  url: '/api/pathway/setinfo',
            //  accepts: 'application/json',
            //  contentType: 'application/json',
            //  data: JSON.stringify(allSets),
            //  success: function (response) {
            //    var setInfos = JSON.parse(response);
            //    listeners.notify(setInfos, listeners.updateType.SET_INFO_UPDATE);
            //  }
            //});
          }
        }

        function addPathSets(path) {
          var setDict = {};
          var setList = [];

          for (var i = 0; i < path.edges.length; i++) {
            var edge = path.edges[i];

            for (var key in edge.properties) {
              if (key.charAt(0) !== '_') {
                var property = edge.properties[key];
                if (property instanceof Array) {
                  edge.properties[key].forEach(function (setId) {
                    addSet(setId, i);
                  });
                } else {
                  addSet(edge.properties[key], i);
                }
              }
            }
          }

          function addSet(setId, relIndex) {
            var mySet = setDict[setId];
            if (typeof mySet == "undefined") {
              mySet = {id: setId, relIndices: [relIndex]};
              setDict[setId] = mySet;
              setList.push(mySet);
            } else {
              mySet.relIndices.push(relIndex);
            }
          }

          path.sets = setList;
        }



        //var propertyCosts = {
        //  size: {
        //    big: 2.0,
        //    small: 1.0
        //  },
        //  mood: {
        //    good: 2.0,
        //    bad: 1.0
        //  }
        //};
        //
        //var myCost = getCost([["size", "big"], ["mood", "bad"]]);
        //d3.select("body").append("p").text(myCost);
        //
        //function getCost(properties) {
        //  var totalCost = 1.0;
        //  properties.forEach(function (propObject) {
        //    var property = propObject[0];
        //    var value = propObject[1];
        //    var propDef = propertyCosts[property];
        //    if (typeof propDef != "undefined") {
        //      var cost = propDef[value];
        //      if (typeof cost != "undefined") {
        //        totalCost += cost;
        //      }
        //    }
        //  });
        //  return totalCost;
        //}

      }
    )
    ;

    function getIncrementalJSON(url, data, onChunkDone) {
      var processed = 0;
      function sendChunk(path) {
        path = JSON.parse(path);
        onChunkDone(path);
      }
      function processPart(text) {
        var p = 0, act = 0, open = 0,
          l = text.length,
          c, start;
        if (text[act] === '[') { //skip initial [
          act = 1;
        }
        start = act;
        while(act < l) {
          c = text[act];
          if (c === '{') { //starting object
            open += 1;
          } else if (c === '}') { //closing object
            open -= 1;
            if (open === 0) { //found a full chunk
              sendChunk(text.substring(start, act+1));
              start = act + 1;
              if (text[start] === ',') { //skip ,
                start += 1;
                act += 1;
              }
            }
          }
          act++;
        }
        return start; //everything before start was fully processed
      }
      return $.ajax({
        async: true,
        url : url,
        data: data,
        dataType : 'text',
        success: function(data) {
          processPart(data.substr(processed))
        },
        xhr: function(){
          // get the native XmlHttpRequest object
          var xhr = $.ajaxSettings.xhr() ;
          // set the onprogress event handler
          xhr.onprogress = function(evt){
            processed += processPart(evt.currentTarget.responseText.substr(processed));
          } ;
          return xhr ;
        }
      })
    }

    function searchPaths(source, target, k, onPathDone) {
      return getIncrementalJSON('/api/pathway/path/'+source+'/'+target, { k : k || 10 }, onPathDone);
    }
    //$.get("/api/pathway/path", function (resp) {
    //
    //  var paths = JSON.parse(resp);
    //
    //  renderPaths(svg, paths);
    //  //$('<h1>' + resp + '</h1>').appendTo('body');
    //});


  }
)