import * as promClient from 'prom-client'

export const registers = [promClient.register]

export type Metric = promClient.Counter<string> | promClient.Histogram<string> | promClient.Gauge<string>

export class Reporter {
  registers: promClient.Registry[];
  metrics: {
    [key: string]: Metric;
  };
  constructor(regs = registers) {
    this.registers = regs
    this.metrics = {}
  }
  metric(key: string, metric?: Metric): Metric {
    if (metric) {
      this.metrics[key] = metric
    }
    return this.metrics[key]
  }
  counter(key: string): promClient.Counter<string> {
    return this.metrics[key] as promClient.Counter<string>
  }
  histogram(key: string): promClient.Histogram<string> {
    return this.metrics[key] as promClient.Histogram<string>
  }
}
