import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { Motion, spring } from 'react-motion';
import { Wrapper, EnhancedSliderTracker } from './Slider.style';

const FRICTION_LEVEL = 0.3;

export default class Slider extends Component {

  constructor(props) {
    super(props);
    this.bounds = undefined;
    this.trackWidth = undefined;  // touch area width
    this.sliderWidth = undefined; // visible slider width
    this.singleWidth = undefined; // single slider width
    this._x = null; // current x coordinate
    this.state = {
      deltaX: 0,
      sliders: [],
    };
  }

  componentDidMount() {
    this.updateVars(this.props);
    this.updateSliders(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.children !== nextProps.children ||
      this.props.visibleNum !== nextProps.visibleNum ||
      this.props.gap !== nextProps.gap
    ) {
      this.updateVars(nextProps);
      this.updateSliders(nextProps);
    }
  }

  getWidth(ele) {
    return ele ? (ele.getBoundingClientRect().width || ele.offsetWidth) : 0;
  }

  applyTrackerTransform(x) {
    this.SliderTracker.style.transform = `translate3d(${x}px, 0px, 0px)`;
  }

  /**
   * @desc calculate nearest status accroding to current x coordinate
   *
   * @param {Number} x - current x coordinate position
   *
   * @return { x, index }
   */
  calcNearestStat(x) {
    const { children, visibleNum } = this.props;

    let index;
    if (x > this.bounds[0]) {
      index = 0;
    } else if (x < this.bounds[1]) {
      index = children.length - visibleNum;
    } else {
      index = Math.round(Math.abs(x) / this.singleWidth);
    }

    return {
      x: -index * this.singleWidth,
      index,
    };
  }

  updateVars(props) {
    const { children, visibleNum } = props;
    const sliderNum = children.length;
    const sliderWidth = this.getWidth(this.Slider);
    const singleWidth = sliderWidth / visibleNum;
    const trackWidth = singleWidth * sliderNum;

    this.SliderTracker.style.width = `${trackWidth}px`;

    this.bounds = [0, -trackWidth + sliderWidth];
    this.trackWidth = trackWidth;
    this.sliderWidth = singleWidth;
    this.singleWidth = singleWidth;
  }

  updateSliders(props) {
    const { children, gap } = props;
    const styledChilds = _.map(children, (child) => {
      const style = {
        display: 'inline-block',
        width: `${this.sliderWidth}px`,
        padding: `0px ${gap / 2}px`,
      };
      return React.cloneElement(child, { style });
    });
    this.setState({ sliders: styledChilds });
  }

  _handlePan = (e) => {
    const { dx } = e;
    let deltaX = dx + this._x;

    if (deltaX > this.bounds[0]) {
      deltaX = this.bounds[0] + ((deltaX - this.bounds[0]) * FRICTION_LEVEL);
    } else if (deltaX < this.bounds[1]) {
      deltaX = this.bounds[1] + ((deltaX - this.bounds[1]) * FRICTION_LEVEL);
    }
    this.setState({ deltaX });
  }

  _handlePanEnd = (e) => {
    const { dx } = e;
    const deltaX = dx + this._x;
    const { x } = this.calcNearestStat(deltaX);
    this._x = x;
    this.setState({ deltaX: x });
  }

  render() {
    return (
      <Wrapper innerRef={(ref) => { this.Slider = ref; }}>
        <Motion style={{ x: spring(this.state.deltaX) }}>
          {
            ({ x }) => (
              <EnhancedSliderTracker
                innerRef={(ref) => { this.SliderTracker = ref; }}
                style={{ transform: `translate3d(${x}px, 0px, 0px)` }}
                onPan={this._handlePan}
                onPanEnd={this._handlePanEnd}
              >
                {this.state.sliders}
              </EnhancedSliderTracker>
            )
          }
        </Motion>
      </Wrapper>
    );
  }
}

Slider.displayName = 'Slider';

Slider.defaultProps = {
  visibleNum: 3,
  gap: 10,
};

Slider.propTypes = {
  children: PropTypes.any.isRequired,

  /**
   * visibleNum:
   *
   * Define how many pictrue will be show in one slider.
   */
  visibleNum: PropTypes.number,

  gap: PropTypes.number,
};
