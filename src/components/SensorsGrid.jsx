import React, { useMemo, useRef } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Page, Search, Filter, Sort, Toolbar, ExcelExport, Resize } from '@syncfusion/ej2-react-grids';
import { StatusBadge } from './StatusBadge';

const GRID_STORAGE_KEY = 'workside_sensors_grid_columns';

export const SensorsGrid = ({ sensors, isLoading, onRowClick, onEdit, onDelete }) => {
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
        fileName: `sensors-${new Date().toISOString().split('T')[0]}.xlsx`,
      });
    }
  };

  const handleRowSelecting = (args) => {
    if (args.data && onRowClick) {
      onRowClick(args.data.id);
    }
  };

  // Custom template for type
  const typeTemplate = (props) => {
    return props.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Custom template for status
  const statusTemplate = (props) => {
    return (
      <StatusBadge
        status={props.status === 'active' ? 'Active' : 'Inactive'}
        variant={props.status === 'active' ? 'active' : 'inactive'}
      />
    );
  };

  // Custom template for current value
  const valueTemplate = (props) => {
    return props.currentValue !== null ? `${props.currentValue} ${props.units}` : '—';
  };

  // Custom template for last update
  const lastUpdateTemplate = (props) => {
    return new Date(props.lastUpdate).toLocaleString();
  };

  // Custom template for well/pad
  const wellPadTemplate = (props) => {
    return `${props.wellName} / ${props.padName}`;
  };

  // Custom template for action buttons
  const actionTemplate = (props) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(props);
            }}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
            title="Edit sensor"
          >
            ✏️ Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete sensor "${props.name}"?`)) {
                onDelete(props.id);
              }
            }}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
            title="Delete sensor"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    );
  };

  // Check loading state AFTER all hooks
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading sensors...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <GridComponent
        ref={gridRef}
        dataSource={sensors || []}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        allowResizing={true}
        allowExcelExport={true}
        filterSettings={{ type: 'Excel' }}
        pageSettings={{ pageSize: 25, pageSizes: [10, 25, 50, 100] }}
        rowSelecting={handleRowSelecting}
        toolbar={toolbarOptions}
        toolbarClick={handleToolbarClick}
        resizeStop={handleResizeStop}
        enableHover={true}
        height="auto"
        rowHeight={50}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="name"
            headerText="Sensor Name"
            width={getColumnWidth('name', 200)}
            minWidth={150}
            allowFiltering={true}
          />
          <ColumnDirective
            field="type"
            headerText="Type"
            width={getColumnWidth('type', 130)}
            minWidth={110}
            template={typeTemplate}
            allowFiltering={true}
            filter={{ type: 'CheckBox' }}
          />
          <ColumnDirective
            field="wellName"
            headerText="Well/Pad"
            width={getColumnWidth('wellName', 150)}
            minWidth={120}
            template={wellPadTemplate}
            allowFiltering={true}
          />
          <ColumnDirective
            field="units"
            headerText="Units"
            width={getColumnWidth('units', 80)}
            minWidth={60}
          />
          <ColumnDirective
            field="currentValue"
            headerText="Current Value"
            width={getColumnWidth('currentValue', 140)}
            minWidth={110}
            template={valueTemplate}
            type="number"
            textAlign="Right"
          />
          <ColumnDirective
            field="status"
            headerText="Status"
            width={getColumnWidth('status', 110)}
            minWidth={90}
            template={statusTemplate}
            allowFiltering={true}
            filter={{ type: 'CheckBox' }}
          />
          <ColumnDirective
            field="lastUpdate"
            headerText="Last Update"
            width={getColumnWidth('lastUpdate', 180)}
            minWidth={150}
            template={lastUpdateTemplate}
            type="date"
            format="yMd"
            allowFiltering={true}
          />
          {(onEdit || onDelete) && (
            <ColumnDirective
              field="id"
              headerText="Actions"
              width={getColumnWidth('actions', 180)}
              minWidth={160}
              template={actionTemplate}
              allowSorting={false}
              allowFiltering={false}
            />
          )}
        </ColumnsDirective>
        <Inject services={[Page, Search, Filter, Sort, Toolbar, ExcelExport, Resize]} />
      </GridComponent>
    </div>
  );
};

