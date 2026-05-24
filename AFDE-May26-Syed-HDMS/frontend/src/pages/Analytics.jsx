import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell, Legend,
  LabelList,
} from 'recharts';
import {
  getIssueCategories,
  getResolutionTrends,
  getPriorityDistribution,
  getDepartmentTickets,
} from '../services/analyticsService';

const PIE_COLORS = ['#e53935', '#ff9800', '#1976d2', '#4caf50'];

const formatMonth = (val) => {
  if (!val) return '';
  const [y, m] = val.split('-');
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en-US', {
    month: 'short',
    year: '2-digit',
  });
};

const EmptyState = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '220px',
      color: '#aaa',
      fontSize: '14px',
      gap: '10px',
    }}
  >
    <span style={{ fontSize: '32px' }}>📭</span>
    <span>No data available.</span>
    <Link to="/etl" style={{ color: '#1976d2', fontSize: '13px' }}>
      Run ETL Import first
    </Link>
  </div>
);

const ChartCard = ({ title, children, hasData }) => (
  <div
    style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      width: 'calc(50% - 12px)',
      minWidth: '300px',
      boxSizing: 'border-box',
    }}
  >
    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
      {title}
    </h3>
    <div style={{ height: '280px' }}>
      {hasData ? children : <EmptyState />}
    </div>
  </div>
);

const Analytics = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [cats, trends, priorities, depts] = await Promise.allSettled([
        getIssueCategories(),
        getResolutionTrends(),
        getPriorityDistribution(),
        getDepartmentTickets(),
      ]);
      setCategoryData(cats.status === 'fulfilled' ? cats.value : []);
      setTrendData(trends.status === 'fulfilled' ? trends.value : []);
      setPriorityData(priorities.status === 'fulfilled' ? priorities.value : []);
      setDepartmentData(depts.status === 'fulfilled' ? depts.value : []);
      if (
        cats.status === 'rejected' &&
        trends.status === 'rejected' &&
        priorities.status === 'rejected' &&
        depts.status === 'rejected'
      ) {
        setFetchError('Could not connect to the backend. Make sure the server is running.');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>
        Loading analytics data...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
          Analytics Dashboard
        </h1>
        <Link
          to="/etl"
          style={{
            fontSize: '13px',
            color: '#1976d2',
            textDecoration: 'none',
            border: '1px solid #90caf9',
            borderRadius: '4px',
            padding: '6px 12px',
          }}
        >
          + Import Data
        </Link>
      </div>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Historical ticket analytics based on ETL-loaded data.
      </p>

      {fetchError && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef9a9a',
            borderRadius: '6px',
            padding: '14px',
            color: '#c62828',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          {fetchError}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>

        {/* Chart 1: Issue Category Distribution */}
        <ChartCard title="Most Common Issue Categories" hasData={categoryData.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={categoryData}
              margin={{ top: 4, right: 40, left: 10, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="issue_category"
                width={130}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => [v, 'Tickets']} />
              <Bar dataKey="ticket_count" fill="#1976d2" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="ticket_count" position="right" style={{ fontSize: 11, fill: '#555' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Resolution Trends */}
        <ChartCard title="Average Resolution Time (Days) by Month" hasData={trendData.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 4, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'Avg Days', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
              />
              <Tooltip
                labelFormatter={formatMonth}
                formatter={(v) => [`${v} days`, 'Avg Resolution']}
              />
              <Line
                type="monotone"
                dataKey="avg_days"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ r: 4, fill: '#1976d2' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Priority Distribution */}
        <ChartCard title="Priority Distribution" hasData={priorityData.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="ticket_count"
                nameKey="priority"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                label={({ priority, percent }) =>
                  `${priority} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={true}
              >
                {priorityData.map((entry, index) => (
                  <Cell
                    key={entry.priority}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name]} />
              <Legend
                formatter={(value) => value}
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Department-wise Ticket Counts */}
        <ChartCard title="Department-wise Ticket Counts" hasData={departmentData.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentData}
              margin={{ top: 20, right: 20, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [v, 'Tickets']} />
              <Bar dataKey="ticket_count" fill="#4caf50" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="ticket_count"
                  position="top"
                  style={{ fontSize: 12, fill: '#555', fontWeight: '600' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      <p style={{ marginTop: '32px', fontSize: '12px', color: '#bbb', textAlign: 'center' }}>
        Data source: historical_tickets table · ETL-loaded reporting database
      </p>
    </div>
  );
};

export default Analytics;
