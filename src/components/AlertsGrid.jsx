import React, { useMemo, useRef } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Page, Search, Filter, Sort, Toolbar, ExcelExport, Resize } from '@syncfusion/ej2-react-grids';
import { SeverityBadge } from './SeverityBadge';

const GRID_STORAGE_KEY = 'workside_alerts_grid_columns';

export const AlertsGrid = ({ alerts, isLoading, onAcknowledge }) => {
  const gridRef = useRef(null);

  // Load saved column widths from localStorage - MUST be before any early returns
  const savedColumns = useMemo(() => {
    try {
      const saved = localStorage.getItem(GRID_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  // Save column widths when they change
  const handleResizeStop = () => {
    if (gridRef.current) {
      const columns = gridRef.current.columns;
      const widths = {};
      columns.forEach((col) => {
        if (col.field) {
          widths[col.field] = col.width;
        }
      });
      localStorage.setItem(GRID_STORAGE_KEY, JSON.stringify(widths));
    }
  };

  // Get column width from saved or default
  const getColumnWidth = (field, defaultWidth) => {
    return savedColumns?.[field] || defaultWidth;
  };

  // Grid toolbar items
  const toolbarOptions = ['Search', 'ExcelExport'];

  // Handle toolbar click for export
  const handleToolbarClick = (args) => {
    if (args.item.id?.includes('excelexport')) {
      gridRef.current?.excelExport({
        fileName: `alerts-${new Date().toISOString().split('T')[0]}.xlsx`,
      });
    }
  };

  // Custom template for severity badge
  const severityTemplate = (props) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SeverityBadge severity={props.severity} />
      </div>
    );
  };

  // Custom template for status badge
  const statusTemplate = (props) => {
    const bgColor = props.status === 'active' ? '#fef3c7' : '#dcfce7';
    const textColor = props.status === 'active' ? '#b45309' : '#166534';
    return (
      <span style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>
        {props.status === 'active' ? 'Active' : 'Acknowledged'}
      </span>
    );
  };

  // Custom template for timestamp
  const timestampTemplate = (props) => {
    return new Date(props.createdAt).toLocaleString();
  };

  // Custom template for action button
  const actionTemplate = (props) => {
    return props.status === 'active' ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAcknowledge(props.id);
        }}
        style={{
          padding: '0.375rem 0.75rem',
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}
      >
        Acknowledge
      </button>
    ) : (
      <span style={{ color: '#999', fontSize: '0.75rem' }}>Acknowledged</span>
    );
  };

  // Check loading state AFTER all hooks
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading alerts...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <GridComponent
        ref={gridRef}
        dataSource={alerts || []}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        allowResizing={true}
        allowExcelExport={true}
        filterSettings={{ type: 'Excel' }}
        pageSettings={{ pageSize: 25, pageSizes: [10, 25, 50, 100] }}
        toolbar={toolbarOptions}
        toolbarClick={handleToolbarClick}
        resizeStop={handleResizeStop}
        enableHover={true}
        height="auto"
        rowHeight={50}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="severity"
            headerText="Severity"
            width={getColumnWidth('severity', 100)}
            minWidth={80}
            template={severityTemplate}
            allowFiltering={true}
            filter={{ type: 'CheckBox' }}
          />
          <ColumnDirective
            field="sensorName"
            headerText="Sensor"
            width={getColumnWidth('sensorName', 200)}
            minWidth={150}
            allowFiltering={true}
          />
          <ColumnDirective
            field="type"
            headerText="Type"
            width={getColumnWidth('type', 120)}
            minWidth={100}
            allowFiltering={true}
            filter={{ type: 'CheckBox' }}
          />
          <ColumnDirective
            field="message"
            headerText="Message"
            width={getColumnWidth('message', 280)}
            minWidth={200}
          />
          <ColumnDirective
            field="status"
            headerText="Status"
            width={getColumnWidth('status', 120)}
            minWidth={100}
            template={statusTemplate}
            allowFiltering={true}
            filter={{ type: 'CheckBox' }}
          />
          <ColumnDirective
            field="createdAt"
            headerText="Created At"
            width={getColumnWidth('createdAt', 180)}
            minWidth={150}
            template={timestampTemplate}
            type="date"
            format="yMd"
            allowFiltering={true}
          />
          <ColumnDirective
            field="id"
            headerText="Action"
            width={getColumnWidth('action', 130)}
            minWidth={120}
            template={actionTemplate}
            allowSorting={false}
            allowFiltering={false}
          />
        </ColumnsDirective>
        <Inject services={[Page, Search, Filter, Sort, Toolbar, ExcelExport, Resize]} />
      </GridComponent>
    </div>
  );
};

