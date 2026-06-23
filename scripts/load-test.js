const autocannon = require('autocannon');

const url = process.argv[2] || 'http://localhost:3000/products';
const label = process.argv[3] || 'benchmark';

const instance = autocannon({
  url,
  connections: 10,
  duration: 10,
  title: label,
}, (err, result) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`\n=== ${label} ===`);
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency avg:  ${result.latency.average} ms`);
  console.log(`Latency p50:  ${result.latency.p50} ms`);
  console.log(`Latency p99:  ${result.latency.p99} ms`);
  console.log(`Throughput:   ${(result.throughput.average / 1024).toFixed(1)} KB/s`);
  console.log(`Total req:    ${result.requests.total}`);
});

autocannon.track(instance, { renderProgressBar: true });
