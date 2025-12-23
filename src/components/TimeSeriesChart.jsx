import React, { Suspense, lazy } from 'react';
import { LoadingState } from './LoadingState';

// Lazy load heavy Syncfusion components to improve initial bundle size
const ChartComponent = lazy(() => 
  import('@syncfusion/ej2-react-charts').then(module => ({ default: module.ChartComponent }))
);
const SeriesCollectionDirective = lazy(() => 
  import('@syncfusion/ej2-react-charts').then(module => ({ default: module.SeriesCollectionDirective }))
);
const SeriesDirective = lazy(() => 
  import('@syncfusion/ej2-react-charts').then(module => ({ default: module.SeriesDirective }))
);

// Import non-lazy items for Inject
import { LineSeries, DateTime, Legend, Tooltip, Inject } from '@syncfusion/ej2-react-charts';

/**
 * Lazy-loaded chart fallback component
 */
const ChartFallback = () => (
  <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
    <LoadingState message="Loading chart..." />
  </div>
);

/**
 * TimeSeriesChart - Displays time series data using Syncfusion Charts
 * Lazy loads the chart components to improve initial page load performance
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of { timestamp, value } data points
 * @param {string} props.sensorName - Name of the sensor for chart title
 * @param {string} props.units - Unit label for y-axis
 * @param {boolean} props.isLoading - Whether data is still loading
 */
export const TimeSeriesChart = ({ data, sensorName, units, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data available</div>;
  }

  // Transform data for Syncfusion
  const chartData = data.map(point => ({
    x: new Date(point.timestamp),
    y: point.value,
    tooltip: `${point.value} ${units}`,
  }));

  const chartProps = {
    id: 'timeseries-chart',
    primaryXAxis: {
      valueType: 'DateTime',
      labelFormat: 'h:mm a',
      intervalType: 'Hours',
      interval: 3,
      majorGridLines: { width: 0 },
      background: 'white',
    },
    primaryYAxis: {
      labelFormat: '{value}',
      title: units,
      lineStyle: { width: 0 },
      majorTickLines: { width: 0 },
      minorTickLines: { width: 0 },
    },
    chartArea: { border: { width: 0 } },
    tooltip: {
      enable: true,
      shared: true,
    },
    title: `${sensorName} - Last 24 Hours`,
  };

  return (
    <Suspense fallback={<ChartFallback />}>
      <div style={{ width: '100%', height: '400px' }}>
        <ChartComponent {...chartProps}>
          <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={chartData}
              xName="x"
              yName="y"
              name={sensorName}
              width="2"
              marker={{
                visible: false,
              }}
              tooltip={{
                format: '${x|dateTime} : ${y} ' + units,
              }}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </div>
    </Suspense>
  );
};

