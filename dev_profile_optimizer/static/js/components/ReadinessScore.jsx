import React, { useState, useEffect } from 'react';
import { Gauge } from '@mui/x-charts/Gauge';
import { Card, CardContent, Typography, Box, Grid, Divider, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const ReadinessScore = ({ userSkills = [], jobRequirements = {} }) => {
  const [score, setScore] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateScore = async () => {
      if (userSkills.length === 0 || Object.keys(jobRequirements).length === 0) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/readiness/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_skills: userSkills,
            job_requirements: jobRequirements,
            last_activity: new Date().toISOString(), // Example: using current time
            project_count: 5, // Example: default value
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setScore(data.total_score);
        setBreakdown(data.breakdown);
      } catch (err) {
        console.error('Error calculating readiness score:', err);
        setError('Failed to calculate readiness score. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    calculateScore();
  }, [userSkills, jobRequirements]);

  const getScoreColor = (value) => {
    if (value >= 75) return '#4CAF50'; // Green
    if (value >= 50) return '#FFC107'; // Yellow
    if (value >= 25) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const renderScoreGauge = () => (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Gauge
        width={250}
        height={200}
        value={score || 0}
        valueMin={0}
        valueMax={100}
        startAngle={-110}
        endAngle={110}
        text={({ value, valueMax }) => `${value} / ${valueMax}`}
        sx={{
          [`& .MuiGauge-valueText`]: {
            fontSize: '2rem',
            fontWeight: 'bold',
            fill: getScoreColor(score || 0),
          },
        }}
      />
      <Typography variant="h6" component="div" sx={{ mt: 1 }}>
        Job Readiness Score
      </Typography>
    </Box>
  );

  const renderBreakdown = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
        Score Breakdown
        <Tooltip title="How your score is calculated">
          <InfoIcon fontSize="small" sx={{ ml: 1, color: 'action.active' }} />
        </Tooltip>
      </Typography>
      
      <Grid container spacing={2}>
        {breakdown && Object.entries(breakdown).map(([key, value]) => (
          <Grid item xs={6} key={key}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {key.replace('_', ' ')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{
                    width: '60px',
                    height: '8px',
                    bgcolor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    mr: 1
                  }}
                >
                  <Box 
                    sx={{
                      width: `${value}%`,
                      height: '100%',
                      bgcolor: getScoreColor(value),
                      transition: 'width 0.5s ease-in-out'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'right' }}>
                  {value}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <Typography>Calculating your readiness score...</Typography>
    </Box>
  );

  const renderError = () => (
    <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, textAlign: 'center' }}>
      <Typography color="error">{error}</Typography>
    </Box>
  );

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Job Readiness
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {loading && renderLoading()}
        {error && renderError()}
        {!loading && !error && score !== null && (
          <>
            {renderScoreGauge()}
            {breakdown && renderBreakdown()}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadinessScore;
