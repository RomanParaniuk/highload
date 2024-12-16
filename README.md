HOMEWORK2:
Add data source: 
- http://influxdb:8086
- influxQL
- Database: telegraf
- User: admin
- Password: admin


Add Dashboards: 
- https://grafana.com/grafana/dashboards/1530-mongodb-monitoring-dashboard/
- https://grafana.com/grafana/dashboards/5063-nginx/
- https://grafana.com/grafana/dashboards/8531-nginx-metrics
- https://grafana.com/grafana/dashboards/3373-elasticsearch/
- https://grafana.com/grafana/dashboards/1150-influxdb-docker/

To run test: 
- /JMETER_DIR/jmeter.sh -n -t test.jmx -JTHREADS=[number of threads] -JRAMPUP=[duration of ramp up] -JDURATION=[duration of test]
