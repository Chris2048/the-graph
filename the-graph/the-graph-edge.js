(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Const
  var CURVE = TheGraph.nodeSize;


  // Edge view

  TheGraph.Edge = React.createClass({
    mixins: [
      TheGraph.mixins.Tooltip
    ],
    componentWillMount: function() {
    },
    componentDidMount: function () {

      if (this.props.onEdgeSelection) {
        // Needs to be click (not tap) to get event.shiftKey
        this.getDOMNode().addEventListener("tap", this.onEdgeSelection);
      }

      // Context menu
      if (this.props.showContext) {
        this.getDOMNode().addEventListener("contextmenu", this.showContext);
        this.getDOMNode().addEventListener("hold", this.showContext);
      }
    },
    onEdgeSelection: function (event) {
      // Don't click app
      event.stopPropagation();

      var toggle = (TheGraph.metaKeyPressed || event.pointerType==="touch");
      this.props.onEdgeSelection(this.props.key, this.props.edge, toggle);
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      var x = event.clientX;
      var y = event.clientY;

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.export ? (this.props.isIn ? "graphInport" : "graphOutport") : "edge"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: (this.props.export ? this.props.exportKey : null),
        item: (this.props.export ? this.props.export : this.props.edge)
      });

    },
    getContext: function (menu, options) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label,
        iconColor: this.props.route
      });
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.sX !== this.props.sX || 
        nextProps.sY !== this.props.sY ||
        nextProps.tX !== this.props.tX || 
        nextProps.tY !== this.props.tY ||
        nextProps.selected !== this.props.selected ||
        nextProps.route !== this.props.route
      );
    },
    getTooltipTrigger: function () {
      return this.refs.touch.getDOMNode();
    },
    shouldShowTooltip: function () {
      return true;
    },
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var groupClass = "edge"+(this.props.selected ? " selected" : "");
      this.getDOMNode().setAttribute("class", groupClass);
      var fgClass = "edge-fg stroke route"+this.props.route;
      this.refs.route.getDOMNode().setAttribute("class", fgClass);
    },
    render: function () {
      var sourceX = this.props.sX;
      var sourceY = this.props.sY;
      var targetX = this.props.tX;
      var targetY = this.props.tY;

      // Organic / curved edge
      var c1X, c1Y, c2X, c2Y;
      if (targetX-5 < sourceX) {
        if (Math.abs(targetY-sourceY) < TheGraph.nodeSize/2) {
          // Loopback
          c1X = sourceX + CURVE;
          c1Y = sourceY - CURVE;
          c2X = targetX - CURVE;
          c2Y = targetY - CURVE;
        } else {
          // Stick out some
          c1X = sourceX + CURVE;
          c1Y = sourceY + (targetY > sourceY ? CURVE : -CURVE);
          c2X = targetX - CURVE;
          c2Y = targetY + (targetY > sourceY ? -CURVE : CURVE);
        }
      } else {
        // Controls halfway between
        c1X = sourceX + (targetX - sourceX)/2;
        c1Y = sourceY;
        c2X = c1X;
        c2Y = targetY;
      }

      var path = [
        "M",
        sourceX, sourceY,
        "C",
        c1X, c1Y,
        c2X, c2Y,
        targetX, targetY
      ];
      // Make SVG path
      path = path.join(" ");


      return (
        React.DOM.g(
          {
            className: "edge",  // See componentDidUpdate
            title: this.props.label
          },
          React.DOM.path({
            className: "edge-bg",
            d: path
          }),
          React.DOM.path({
            ref: "route",
            className: "edge-fg stroke route"+this.props.route,  // See componentDidUpdate
            d: path
          }),
          React.DOM.path({
            className: "edge-touch",
            ref: "touch",
            d: path
          })
        )
      );
    }
  });

})(this);