export class Cache<T> {
  private value: T | null = null
  private expires: number | null = null

  public constructor(private ttl: number) {}

  public get(): T | null {
    if (this.expires === null) {
      return null
    }
    if (this.expires < Date.now()) {
      this.expires = null
      this.value = null
      return null
    }
    return this.value
  }

  public set(v: T) {
    this.value = v
    this.expires = Date.now() + this.ttl
  }
}
