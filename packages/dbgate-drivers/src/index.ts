import mysqlDriver from 'dbgate-driver-mysql';

// Driver registry - maps driver names to driver implementations
const drivers = {
  mysql: mysqlDriver,
  mariadb: mysqlDriver, // MariaDB uses the same driver as MySQL
};

// Export drivers keyed by driver name
export default drivers;

// Export individual drivers for named imports
export { mysqlDriver };

// Export type for the drivers registry
export type DriversRegistry = typeof drivers;
