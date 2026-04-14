import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { baseLayout, plotConfig, mergeLayout } from '../lib/plotly';

const Plot = createPlotlyComponent(Plotly);

/**
 * Wrapper around react-plotly.js with USNA dark theme defaults.
 */
export default function IntensityPlot({ traces, layoutOverrides, style }) {
  return (
    <Plot
      data={traces}
      layout={mergeLayout(layoutOverrides)}
      config={plotConfig}
      useResizeHandler
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
}
