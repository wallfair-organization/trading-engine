class ModuleException extends Error {
  message: string;

  constructor(message) {
    super(message);
    this.message = message;
  }
}