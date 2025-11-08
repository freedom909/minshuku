# Analytics System Guide

## Overview

The analytics system provides comprehensive performance monitoring and reporting capabilities for the minshuku platform. It integrates data from multiple sources (MySQL, Neo4j) to generate insightful reports, trend analysis, and predictive analytics.

## Features

### 📊 Core Reporting
- **Listing Performance Reports**: Detailed analysis of individual or multiple listings
- **Revenue Analytics**: Revenue potential and market analysis
- **User Analytics**: User behavior and engagement metrics (future)

### 🔍 Advanced Analytics
- **Performance Scoring**: 0-100 scoring system with A-D grading
- **Trend Analysis**: Market trends and performance patterns
- **Predictive Analytics**: Performance forecasting and growth predictions

### ⚡ Real-time Features
- **Caching System**: 5-minute cache for optimal performance
- **Health Monitoring**: System status and database connectivity checks
- **Real-time Metrics**: Live performance indicators

### 📈 Data Export
- **CSV Export**: Downloadable reports in spreadsheet format
- **JSON API**: RESTful API for programmatic access
- **Filtered Results**: Advanced filtering capabilities

## API Endpoints

### 1. Generate Report
```http
GET /analytics/report/generate
```

**Parameters:**
- `report_type` (required): `listing`, `user`, or `revenue`
- `listing_id` (optional): Specific listing ID for detailed analysis
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `format` (optional): `json` or `summary` (default: json)
- `include_recommendations` (optional): Include AI recommendations (default: true)

**Example:**
```bash
# All listings report
curl "http://localhost:8000/analytics/report/generate?report_type=listing"

# Specific listing with date range
curl "http://localhost:8000/analytics/report/generate?report_type=listing&listing_id=listing-001&date_from=2023-01-01&date_to=2023-12-31"
```

### 2. Export Report as CSV
```http
GET /analytics/report/export
```

**Parameters:** Same as generate report endpoint

**Response:** CSV file download

### 3. Health Check
```http
GET /analytics/report/health
```

**Response:** System health status including database connectivity and cache status

### 4. Service Statistics
```http
GET /analytics/report/stats
```

**Response:** Usage statistics and performance metrics

### 5. Real-time Monitoring
```http
GET /analytics/report/monitor
```

**Response:** Live system metrics and performance indicators

### 6. Predictive Analytics
```http
GET /analytics/report/predictive
```

**Parameters:**
- `listing_id` (optional): Listing ID for prediction
- `forecast_period` (optional): Days to forecast (1-30, default: 7)

**Response:** Performance predictions and growth forecasts

### 7. Advanced Filtering
```http
GET /analytics/report/filter
```

**Parameters:**
- `min_price`, `max_price`: Price range filtering
- `min_rating`: Minimum rating filter
- `location_type`: Location type filter
- `status`: Listing status filter
- `featured_only`: Show featured listings only

## Performance Scoring System

### Scoring Algorithm (0-100 scale)
- **Rating Score (40%)**: Average rating × 20
- **Review Count (20%)**: min(reviews × 2, 20)
- **Price Score (20%)**: max(0, 20 - (price / 100))
- **Status Score (20%)**: Available=20, Unavailable=10
- **Featured Bonus**: Featured listings get 20% bonus

### Performance Grades
- **A (80-100)**: Excellent performance
- **B (60-79)**: Good performance
- **C (40-59)**: Average performance
- **D (0-39)**: Needs improvement

## Data Sources

### MySQL Database
- Listings table: Basic listing information, pricing, status
- Primary source for listing metadata and pricing

### Neo4j Graph Database
- Reviews and ratings data
- Relationship analysis between listings and reviews
- Performance trend analysis

## Caching Strategy

### Cache Duration
- **5 minutes**: Optimal balance between freshness and performance
- **Automatic cleanup**: Expired entries automatically removed

### Cache Keys
Format: `{report_type}:{listing_id}:{date_from}:{date_to}`

### Cache Statistics
Available via `/analytics/report/stats` endpoint

## Error Handling

### Common Error Responses
- **400 Bad Request**: Invalid parameters or date formats
- **500 Internal Server Error**: Database connectivity issues
- **404 Not Found**: Invalid endpoints or resources

### Error Recovery
- Automatic retry mechanisms
- Graceful degradation when databases are unavailable
- Detailed error logging for troubleshooting

## Testing

### Test Suite
Run the comprehensive test suite:
```bash
cd machine/analytics/tests
python -m pytest test_analytics_system.py -v
```

### Test Coverage
- Date validation and parsing
- Performance metrics calculation
- Report generation and caching
- Error handling scenarios
- Integration workflows

## Performance Optimization

### Database Optimization
- Connection pooling for MySQL
- Efficient Neo4j queries with proper indexing
- Batch processing for large datasets

### Memory Management
- Efficient caching with automatic cleanup
- Streaming responses for large datasets
- Memory monitoring and optimization

## Security Considerations

### Input Validation
- Strict parameter validation
- SQL injection prevention
- Date format validation

### Access Control
- API endpoint authentication (future)
- Rate limiting (future)
- Data privacy compliance

## Monitoring and Logging

### Logging Levels
- **INFO**: Report generation, cache hits
- **WARNING**: Performance issues, partial failures
- **ERROR**: Database errors, system failures

### Monitoring Metrics
- Response times
- Cache hit rates
- Database connection health
- Error rates and patterns

## Future Enhancements

### Planned Features
- **User Behavior Analytics**: Track user interactions and preferences
- **Booking Analytics**: Analyze booking patterns and revenue trends
- **Competitive Analysis**: Market comparison and benchmarking
- **Machine Learning**: Advanced predictive models
- **Real-time Alerts**: Performance threshold alerts
- **Dashboard Integration**: Web-based analytics dashboard

### Integration Opportunities
- **Payment Analytics**: Revenue tracking and payment patterns
- **Marketing Analytics**: Campaign performance and ROI
- **Customer Support Analytics**: Support ticket analysis and trends

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Check MySQL and Neo4j service status
- Verify connection strings in configuration
- Check network connectivity

#### Cache Performance Issues
- Monitor cache hit rates
- Adjust cache duration if needed
- Check memory usage

#### Report Generation Failures
- Validate input parameters
- Check database query performance
- Review error logs for specific issues

### Debug Mode
Enable detailed logging for troubleshooting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Support and Maintenance

### Regular Maintenance Tasks
- Monitor system performance metrics
- Review and optimize database queries
- Update caching strategies as needed
- Regular security audits

### Performance Monitoring
- Set up monitoring for key metrics
- Establish alerting for critical failures
- Regular performance testing

## Conclusion

The analytics system provides a robust foundation for understanding platform performance and making data-driven decisions. With its comprehensive reporting capabilities, real-time monitoring, and predictive analytics, it serves as a critical tool for platform optimization and growth.

For additional support or feature requests, please contact the development team.