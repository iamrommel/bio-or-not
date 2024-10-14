export class Logger {
  public logSource: string = 'UNKNOWN'

  log(message: string, ...rest: any[]) {
    console.log(`${this.logSource}::${message}`, rest)
  }
  error(message: string, ...rest: any[]) {
    console.error(`${this.logSource}::ERROR::${message}`, rest)
  }
}
